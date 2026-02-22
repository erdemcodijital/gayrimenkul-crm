/* Drop existing settings tables if they exist with wrong schema */
drop table if exists public.settings cascade;
drop table if exists public.email_templates cascade;
drop table if exists public.whatsapp_templates cascade;

/* Create settings table for system configuration */
create table if not exists public.settings (
  id uuid default gen_random_uuid() primary key,
  "key" text unique not null,
  value jsonb,
  category text not null, /* general, email, whatsapp, sms, appearance */
  description text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

/* Create email_templates table */
create table if not exists public.email_templates (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  subject text not null,
  body text not null,
  variables jsonb, /* Available variables for template */
  category text, /* welcome, invoice, reminder, notification */
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

/* Create whatsapp_templates table */
create table if not exists public.whatsapp_templates (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  message text not null,
  variables jsonb,
  category text, /* welcome, reminder, notification, quick_reply */
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

/* Create indexes */
create index if not exists settings_key_idx on public.settings("key");
create index if not exists settings_category_idx on public.settings(category);
create index if not exists email_templates_category_idx on public.email_templates(category);
create index if not exists whatsapp_templates_category_idx on public.whatsapp_templates(category);

/* Enable RLS */
alter table public.settings enable row level security;
alter table public.email_templates enable row level security;
alter table public.whatsapp_templates enable row level security;

/* RLS Policies for settings */
create policy "Public settings are viewable by everyone" on public.settings
  for select using (is_public = true or auth.role() = 'authenticated');

create policy "Only authenticated users can update settings" on public.settings
  for update using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users only" on public.settings
  for insert with check (auth.role() = 'authenticated');

/* RLS Policies for email_templates */
create policy "Enable read access for authenticated users" on public.email_templates
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users only" on public.email_templates
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.email_templates
  for update using (auth.role() = 'authenticated');

/* RLS Policies for whatsapp_templates */
create policy "Enable read access for authenticated users" on public.whatsapp_templates
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users only" on public.whatsapp_templates
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.whatsapp_templates
  for update using (auth.role() = 'authenticated');

/* Triggers for updated_at */
create trigger handle_settings_updated_at
  before update on public.settings
  for each row
  execute function public.handle_updated_at();

create trigger handle_email_templates_updated_at
  before update on public.email_templates
  for each row
  execute function public.handle_updated_at();

create trigger handle_whatsapp_templates_updated_at
  before update on public.whatsapp_templates
  for each row
  execute function public.handle_updated_at();

/* Function to get setting value */
create or replace function get_setting(p_key text)
returns jsonb as $$
declare
  v_value jsonb;
begin
  select value into v_value
  from public.settings
  where "key" = p_key;
  
  return v_value;
end;
$$ language plpgsql;

/* Function to update or insert setting */
create or replace function upsert_setting(
  p_key text,
  p_value jsonb,
  p_category text default 'general',
  p_description text default null,
  p_is_public boolean default false
)
returns uuid as $$
declare
  v_setting_id uuid;
begin
  insert into public.settings ("key", value, category, description, is_public)
  values (p_key, p_value, p_category, p_description, p_is_public)
  on conflict ("key") do update
  set value = excluded.value,
      category = excluded.category,
      description = excluded.description,
      is_public = excluded.is_public,
      updated_at = now()
  returning id into v_setting_id;
  
  return v_setting_id;
end;
$$ language plpgsql security definer;

/* Insert default settings */
insert into public.settings ("key", value, category, description, is_public) values
  ('site_name', '"Gayrimenkul CRM"', 'general', 'Site name', true),
  ('site_logo', '""', 'general', 'Site logo URL', true),
  ('currency', '"TRY"', 'general', 'Default currency', true),
  ('timezone', '"Europe/Istanbul"', 'general', 'Default timezone', true),
  ('language', '"tr"', 'general', 'Default language', true),
  ('smtp_host', '""', 'email', 'SMTP server host', false),
  ('smtp_port', '587', 'email', 'SMTP server port', false),
  ('smtp_user', '""', 'email', 'SMTP username', false),
  ('smtp_password', '""', 'email', 'SMTP password', false),
  ('smtp_from_email', '""', 'email', 'From email address', false),
  ('smtp_from_name', '""', 'email', 'From name', false),
  ('whatsapp_api_key', '""', 'whatsapp', 'WhatsApp API key', false),
  ('whatsapp_enabled', 'false', 'whatsapp', 'Enable WhatsApp integration', false),
  ('sms_api_key', '""', 'sms', 'SMS gateway API key', false),
  ('sms_enabled', 'false', 'sms', 'Enable SMS integration', false),
  ('theme_primary_color', '"#1f2937"', 'appearance', 'Primary theme color', true),
  ('theme_secondary_color', '"#3b82f6"', 'appearance', 'Secondary theme color', true)
on conflict ("key") do nothing;

/* Insert default email templates */
insert into public.email_templates (name, subject, body, variables, category) values
  (
    'welcome_email',
    'Hoş Geldiniz - {{site_name}}',
    '<h1>Merhaba {{agent_name}},</h1><p>Sistemimize hoş geldiniz!</p><p>Hesabınız oluşturuldu. Giriş yapabilirsiniz.</p><p>Domain: {{domain}}</p>',
    '["agent_name", "domain", "site_name"]',
    'welcome'
  ),
  (
    'invoice_email',
    'Yeni Fatura - {{invoice_number}}',
    '<h1>Fatura Detayları</h1><p>Sayın {{agent_name}},</p><p>{{invoice_number}} numaralı faturanız oluşturuldu.</p><p>Tutar: {{total_amount}}</p><p>Vade: {{due_date}}</p>',
    '["agent_name", "invoice_number", "total_amount", "due_date"]',
    'invoice'
  ),
  (
    'license_expiry_email',
    'Lisans Süresi Dolmak Üzere',
    '<h1>Lisans Hatırlatması</h1><p>Sayın {{agent_name}},</p><p>Lisansınız {{days_left}} gün içinde sona erecek.</p><p>Lütfen yenileme işleminizi yapın.</p>',
    '["agent_name", "days_left", "end_date"]',
    'reminder'
  )
on conflict (name) do nothing;

/* Insert default WhatsApp templates */
insert into public.whatsapp_templates (name, message, variables, category) values
  (
    'welcome_message',
    'Merhaba {{agent_name}}! {{site_name}} sistemine hoş geldiniz. Hesabınız aktif edildi.',
    '["agent_name", "site_name"]',
    'welcome'
  ),
  (
    'new_lead_notification',
    '🔔 Yeni lead: {{lead_name}} - {{lead_phone}}. Detaylar için sisteme giriş yapın.',
    '["lead_name", "lead_phone"]',
    'notification'
  ),
  (
    'license_reminder',
    '⚠️ Lisansınız {{days_left}} gün içinde sona erecek. Yenileme için lütfen iletişime geçin.',
    '["days_left"]',
    'reminder'
  )
on conflict (name) do nothing;
