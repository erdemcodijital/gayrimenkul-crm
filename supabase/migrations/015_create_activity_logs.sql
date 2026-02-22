-- Create activity_logs table for audit trail and activity tracking
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  user_name text,
  action text not null, -- created, updated, deleted, login, logout, etc.
  entity_type text not null, -- agent, lead, property, invoice, license, etc.
  entity_id uuid,
  entity_name text,
  description text,
  changes jsonb, -- before/after values
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists activity_logs_user_id_idx on public.activity_logs(user_id);
create index if not exists activity_logs_action_idx on public.activity_logs(action);
create index if not exists activity_logs_entity_type_idx on public.activity_logs(entity_type);
create index if not exists activity_logs_entity_id_idx on public.activity_logs(entity_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);
create index if not exists activity_logs_composite_idx on public.activity_logs(entity_type, entity_id, created_at desc);

-- Enable RLS
alter table public.activity_logs enable row level security;

-- RLS Policies
create policy "Enable read access for all users" on public.activity_logs
  for select using (true);

create policy "Enable insert for authenticated users only" on public.activity_logs
  for insert with check (true);

-- Function to log activity
create or replace function log_activity(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_entity_name text default null,
  p_description text default null,
  p_changes jsonb default null
)
returns uuid as $$
declare
  v_log_id uuid;
  v_user_id uuid;
  v_user_email text;
  v_user_name text;
begin
  -- Get current user info
  v_user_id := auth.uid();
  
  if v_user_id is not null then
    select email into v_user_email from auth.users where id = v_user_id;
    
    -- Try to get name from admin_users first, then from agents
    select name into v_user_name from public.admin_users where user_id = v_user_id;
    
    if v_user_name is null then
      select name into v_user_name from public.agents where user_id = v_user_id;
    end if;
  end if;

  -- Insert activity log
  insert into public.activity_logs (
    user_id,
    user_email,
    user_name,
    action,
    entity_type,
    entity_id,
    entity_name,
    description,
    changes
  ) values (
    v_user_id,
    v_user_email,
    v_user_name,
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_description,
    p_changes
  ) returning id into v_log_id;

  return v_log_id;
end;
$$ language plpgsql security definer;

-- Function to get activity summary by date range
create or replace function get_activity_summary(
  p_start_date timestamptz default now() - interval '30 days',
  p_end_date timestamptz default now()
)
returns table (
  action_type text,
  entity_type text,
  count bigint
) as $$
begin
  return query
  select 
    action,
    entity_type,
    count(*)::bigint
  from public.activity_logs
  where created_at between p_start_date and p_end_date
  group by action, entity_type
  order by count desc;
end;
$$ language plpgsql;

-- Trigger function to automatically log certain table changes
create or replace function auto_log_changes()
returns trigger as $$
declare
  v_changes jsonb;
  v_action text;
  v_entity_name text;
begin
  -- Determine action
  if TG_OP = 'INSERT' then
    v_action := 'created';
    v_changes := jsonb_build_object('new', to_jsonb(NEW));
  elsif TG_OP = 'UPDATE' then
    v_action := 'updated';
    v_changes := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  elsif TG_OP = 'DELETE' then
    v_action := 'deleted';
    v_changes := jsonb_build_object('old', to_jsonb(OLD));
  end if;

  -- Get entity name based on table
  if TG_TABLE_NAME = 'agents' then
    v_entity_name := coalesce(NEW.name, OLD.name);
  elsif TG_TABLE_NAME = 'leads' then
    v_entity_name := coalesce(NEW.name, OLD.name);
  elsif TG_TABLE_NAME = 'invoices' then
    v_entity_name := coalesce(NEW.invoice_number, OLD.invoice_number);
  elsif TG_TABLE_NAME = 'licenses' then
    v_entity_name := coalesce(NEW.license_type, OLD.license_type);
  end if;

  -- Log the activity
  perform log_activity(
    v_action,
    TG_TABLE_NAME,
    coalesce(NEW.id, OLD.id),
    v_entity_name,
    format('%s %s', v_action, TG_TABLE_NAME),
    v_changes
  );

  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

-- Add triggers to important tables (optional - can be enabled later)
-- Uncomment to enable auto-logging:
-- create trigger agents_activity_trigger
--   after insert or update or delete on public.agents
--   for each row execute function auto_log_changes();

-- create trigger leads_activity_trigger
--   after insert or update or delete on public.leads
--   for each row execute function auto_log_changes();

-- create trigger invoices_activity_trigger
--   after insert or update or delete on public.invoices
--   for each row execute function auto_log_changes();

-- create trigger licenses_activity_trigger
--   after insert or update or delete on public.licenses
--   for each row execute function auto_log_changes();
