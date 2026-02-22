/* Create notifications table */
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete cascade,
  type text not null, /* system, license_expiry, payment_due, new_lead, invoice_created */
  title text not null,
  message text not null,
  action_url text,
  action_label text,
  priority text default 'normal', /* low, normal, high, urgent */
  is_read boolean default false,
  read_at timestamptz,
  metadata jsonb,
  created_at timestamptz default now()
);

/* Create notification_settings table */
create table if not exists public.notification_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  agent_id uuid references public.agents(id) on delete cascade unique,
  email_enabled boolean default true,
  email_license_expiry boolean default true,
  email_payment_due boolean default true,
  email_new_lead boolean default true,
  email_invoice_created boolean default true,
  in_app_enabled boolean default true,
  in_app_license_expiry boolean default true,
  in_app_payment_due boolean default true,
  in_app_new_lead boolean default true,
  in_app_invoice_created boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

/* Create indexes */
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_agent_id_idx on public.notifications(agent_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
create index if not exists notifications_type_idx on public.notifications(type);

/* Enable RLS */
alter table public.notifications enable row level security;
alter table public.notification_settings enable row level security;

/* RLS Policies for notifications */
create policy "Users can view their own notifications" on public.notifications
  for select using (auth.uid() = user_id or auth.uid() in (select user_id from public.agents where id = agent_id));

create policy "Enable insert for authenticated users only" on public.notifications
  for insert with check (true);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = user_id or auth.uid() in (select user_id from public.agents where id = agent_id));

create policy "Users can delete their own notifications" on public.notifications
  for delete using (auth.uid() = user_id or auth.uid() in (select user_id from public.agents where id = agent_id));

/* RLS Policies for notification_settings */
create policy "Users can view their own settings" on public.notification_settings
  for select using (auth.uid() = user_id or auth.uid() in (select user_id from public.agents where id = agent_id));

create policy "Users can update their own settings" on public.notification_settings
  for update using (auth.uid() = user_id or auth.uid() in (select user_id from public.agents where id = agent_id));

create policy "Enable insert for authenticated users only" on public.notification_settings
  for insert with check (true);

/* Trigger for updated_at */
create trigger handle_notification_settings_updated_at
  before update on public.notification_settings
  for each row
  execute function public.handle_updated_at();

/* Function to create notification */
create or replace function create_notification(
  p_user_id uuid default null,
  p_agent_id uuid default null,
  p_type text,
  p_title text,
  p_message text,
  p_action_url text default null,
  p_action_label text default null,
  p_priority text default 'normal',
  p_metadata jsonb default null
)
returns uuid as $$
declare
  v_notification_id uuid;
  v_settings record;
begin
  -- Check notification settings
  if p_user_id is not null then
    select * into v_settings from public.notification_settings where user_id = p_user_id;
  elsif p_agent_id is not null then
    select * into v_settings from public.notification_settings where agent_id = p_agent_id;
  end if;

  -- Check if in-app notifications are enabled
  if v_settings is null or v_settings.in_app_enabled = true then
    insert into public.notifications (
      user_id,
      agent_id,
      type,
      title,
      message,
      action_url,
      action_label,
      priority,
      metadata
    ) values (
      p_user_id,
      p_agent_id,
      p_type,
      p_title,
      p_message,
      p_action_url,
      p_action_label,
      p_priority,
      p_metadata
    ) returning id into v_notification_id;

    return v_notification_id;
  end if;

  return null;
end;
$$ language plpgsql security definer;

/* Function to mark notification as read */
create or replace function mark_notification_read(p_notification_id uuid)
returns void as $$
begin
  update public.notifications
  set is_read = true, read_at = now()
  where id = p_notification_id;
end;
$$ language plpgsql security definer;

/* Function to mark all notifications as read */
create or replace function mark_all_notifications_read(p_user_id uuid default null, p_agent_id uuid default null)
returns void as $$
begin
  if p_user_id is not null then
    update public.notifications
    set is_read = true, read_at = now()
    where user_id = p_user_id and is_read = false;
  elsif p_agent_id is not null then
    update public.notifications
    set is_read = true, read_at = now()
    where agent_id = p_agent_id and is_read = false;
  end if;
end;
$$ language plpgsql security definer;

/* Function to delete old notifications */
create or replace function cleanup_old_notifications()
returns void as $$
begin
  delete from public.notifications
  where created_at < now() - interval '90 days'
    and is_read = true;
end;
$$ language plpgsql;

/* Function to get unread notification count */
create or replace function get_unread_notification_count(p_user_id uuid default null, p_agent_id uuid default null)
returns integer as $$
declare
  v_count integer;
begin
  if p_user_id is not null then
    select count(*)::integer into v_count
    from public.notifications
    where user_id = p_user_id and is_read = false;
  elsif p_agent_id is not null then
    select count(*)::integer into v_count
    from public.notifications
    where agent_id = p_agent_id and is_read = false;
  end if;

  return coalesce(v_count, 0);
end;
$$ language plpgsql;

/* Trigger function to send license expiry notifications */
create or replace function check_license_expiry()
returns void as $$
declare
  v_license record;
begin
  /* Check for licenses expiring in 7 days */
  for v_license in
    select l.*, a.name as agent_name, a.user_id
    from public.licenses l
    join public.agents a on a.id = l.agent_id
    where l.status = 'active'
      and l.end_date between now() and now() + interval '7 days'
      and not exists (
        select 1 from public.notifications n
        where n.agent_id = l.agent_id
          and n.type = 'license_expiry'
          and n.created_at > now() - interval '24 hours'
      )
  loop
    perform create_notification(
      null,
      v_license.agent_id,
      'license_expiry',
      'Lisans Süresi Dolmak Üzere',
      format('Lisansınız %s tarihinde sona erecek. Lütfen yenileyin.', v_license.end_date::date),
      '/admin/licenses',
      'Lisansları Görüntüle',
      'high',
      jsonb_build_object('license_id', v_license.id, 'end_date', v_license.end_date)
    );
  end loop;
end;
$$ language plpgsql;
