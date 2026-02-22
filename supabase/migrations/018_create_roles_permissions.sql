/* Create roles table */
create table if not exists public.roles (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  display_name text not null,
  description text,
  is_system boolean default false, /* Prevents deletion of system roles */
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

/* Create permissions table */
create table if not exists public.permissions (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  display_name text not null,
  description text,
  category text, /* agents, leads, properties, licenses, invoices, settings, etc. */
  created_at timestamptz default now()
);

/* Create role_permissions junction table */
create table if not exists public.role_permissions (
  id uuid default gen_random_uuid() primary key,
  role_id uuid references public.roles(id) on delete cascade,
  permission_id uuid references public.permissions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(role_id, permission_id)
);

/* Create user_roles table */
create table if not exists public.user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, role_id)
);

/* Create indexes */
create index if not exists user_roles_user_id_idx on public.user_roles(user_id);
create index if not exists user_roles_role_id_idx on public.user_roles(role_id);
create index if not exists role_permissions_role_id_idx on public.role_permissions(role_id);
create index if not exists role_permissions_permission_id_idx on public.role_permissions(permission_id);
create index if not exists permissions_category_idx on public.permissions(category);

/* Enable RLS */
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;

/* RLS Policies for roles */
create policy "Enable read access for authenticated users" on public.roles
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users only" on public.roles
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.roles
  for update using (auth.role() = 'authenticated');

create policy "Prevent deletion of system roles" on public.roles
  for delete using (auth.role() = 'authenticated' and is_system = false);

/* RLS Policies for permissions */
create policy "Enable read access for authenticated users" on public.permissions
  for select using (auth.role() = 'authenticated');

/* RLS Policies for role_permissions */
create policy "Enable read access for authenticated users" on public.role_permissions
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users only" on public.role_permissions
  for insert with check (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.role_permissions
  for delete using (auth.role() = 'authenticated');

/* RLS Policies for user_roles */
create policy "Enable read access for authenticated users" on public.user_roles
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for authenticated users only" on public.user_roles
  for insert with check (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.user_roles
  for delete using (auth.role() = 'authenticated');

/* Triggers for updated_at */
create trigger handle_roles_updated_at
  before update on public.roles
  for each row
  execute function public.handle_updated_at();

/* Insert default roles */
insert into public.roles (name, display_name, description, is_system) values
  ('super_admin', 'Süper Admin', 'Tüm yetkilere sahip sistem yöneticisi', true),
  ('admin', 'Admin', 'Sistem yöneticisi', true),
  ('manager', 'Yönetici', 'Bölge veya takım yöneticisi', true),
  ('agent', 'Danışman', 'Gayrimenkul danışmanı', true),
  ('viewer', 'Görüntüleyici', 'Sadece görüntüleme yetkisi', true)
on conflict (name) do nothing;

/* Insert default permissions */
insert into public.permissions (name, display_name, description, category) values
  /* Agent Permissions */
  ('agents.view', 'Danışman Görüntüle', 'Danışmanları görüntüleme', 'agents'),
  ('agents.create', 'Danışman Oluştur', 'Yeni danışman ekleme', 'agents'),
  ('agents.edit', 'Danışman Düzenle', 'Danışman bilgilerini düzenleme', 'agents'),
  ('agents.delete', 'Danışman Sil', 'Danışman silme', 'agents'),
  ('agents.approve', 'Danışman Onayla', 'Danışman onaylama', 'agents'),
  
  /* Lead Permissions */
  ('leads.view', 'Lead Görüntüle', 'Leadleri görüntüleme', 'leads'),
  ('leads.view_all', 'Tüm Leadleri Görüntüle', 'Tüm danışmanların leadlerini görüntüleme', 'leads'),
  ('leads.create', 'Lead Oluştur', 'Yeni lead ekleme', 'leads'),
  ('leads.edit', 'Lead Düzenle', 'Lead bilgilerini düzenleme', 'leads'),
  ('leads.delete', 'Lead Sil', 'Lead silme', 'leads'),
  ('leads.assign', 'Lead Ata', 'Lead atama yetkisi', 'leads'),
  
  /* Property Permissions */
  ('properties.view', 'İlan Görüntüle', 'İlanları görüntüleme', 'properties'),
  ('properties.view_all', 'Tüm İlanları Görüntüle', 'Tüm danışmanların ilanlarını görüntüleme', 'properties'),
  ('properties.create', 'İlan Oluştur', 'Yeni ilan ekleme', 'properties'),
  ('properties.edit', 'İlan Düzenle', 'İlan bilgilerini düzenleme', 'properties'),
  ('properties.delete', 'İlan Sil', 'İlan silme', 'properties'),
  ('properties.publish', 'İlan Yayınla', 'İlan yayınlama/gizleme', 'properties'),
  
  /* License Permissions */
  ('licenses.view', 'Lisans Görüntüle', 'Lisansları görüntüleme', 'licenses'),
  ('licenses.create', 'Lisans Oluştur', 'Yeni lisans oluşturma', 'licenses'),
  ('licenses.edit', 'Lisans Düzenle', 'Lisans düzenleme', 'licenses'),
  ('licenses.delete', 'Lisans Sil', 'Lisans silme', 'licenses'),
  ('licenses.activate', 'Lisans Aktifleştir', 'Lisans aktifleştirme', 'licenses'),
  
  /* Invoice Permissions */
  ('invoices.view', 'Fatura Görüntüle', 'Faturaları görüntüleme', 'invoices'),
  ('invoices.create', 'Fatura Oluştur', 'Yeni fatura oluşturma', 'invoices'),
  ('invoices.edit', 'Fatura Düzenle', 'Fatura düzenleme', 'invoices'),
  ('invoices.delete', 'Fatura Sil', 'Fatura silme', 'invoices'),
  ('invoices.pay', 'Ödeme Kaydet', 'Ödeme kaydetme', 'invoices'),
  
  /* Payment Permissions */
  ('payments.view', 'Ödeme Görüntüle', 'Ödemeleri görüntüleme', 'payments'),
  ('payments.create', 'Ödeme Oluştur', 'Ödeme kaydetme', 'payments'),
  
  /* Domain Permissions */
  ('domains.view', 'Domain Görüntüle', 'Domainleri görüntüleme', 'domains'),
  ('domains.create', 'Domain Oluştur', 'Yeni domain ekleme', 'domains'),
  ('domains.edit', 'Domain Düzenle', 'Domain düzenleme', 'domains'),
  ('domains.delete', 'Domain Sil', 'Domain silme', 'domains'),
  
  /* Settings Permissions */
  ('settings.view', 'Ayar Görüntüle', 'Ayarları görüntüleme', 'settings'),
  ('settings.edit', 'Ayar Düzenle', 'Ayarları düzenleme', 'settings'),
  
  /* Activity Log Permissions */
  ('activity_logs.view', 'Log Görüntüle', 'Activity logları görüntüleme', 'activity_logs'),
  
  /* Notification Permissions */
  ('notifications.view', 'Bildirim Görüntüle', 'Bildirimleri görüntüleme', 'notifications'),
  ('notifications.send', 'Bildirim Gönder', 'Bildirim gönderme', 'notifications'),
  
  /* Report Permissions */
  ('reports.view', 'Rapor Görüntüle', 'Raporları görüntüleme', 'reports'),
  ('reports.export', 'Rapor İndir', 'Rapor indirme', 'reports'),
  
  /* User & Role Permissions */
  ('users.view', 'Kullanıcı Görüntüle', 'Kullanıcıları görüntüleme', 'users'),
  ('users.edit', 'Kullanıcı Düzenle', 'Kullanıcı düzenleme', 'users'),
  ('roles.view', 'Rol Görüntüle', 'Rolleri görüntüleme', 'roles'),
  ('roles.edit', 'Rol Düzenle', 'Rol düzenleme', 'roles')
on conflict (name) do nothing;

/* Assign permissions to super_admin role (all permissions) */
insert into public.role_permissions (role_id, permission_id)
select 
  (select id from public.roles where name = 'super_admin'),
  p.id
from public.permissions p
on conflict do nothing;

/* Assign permissions to admin role (all except critical system operations) */
insert into public.role_permissions (role_id, permission_id)
select 
  (select id from public.roles where name = 'admin'),
  p.id
from public.permissions p
where p.name not in ('roles.edit')
on conflict do nothing;

/* Assign permissions to manager role */
insert into public.role_permissions (role_id, permission_id)
select 
  (select id from public.roles where name = 'manager'),
  p.id
from public.permissions p
where p.name in (
  'agents.view', 'agents.edit',
  'leads.view_all', 'leads.create', 'leads.edit', 'leads.assign',
  'properties.view_all', 'properties.create', 'properties.edit', 'properties.publish',
  'licenses.view',
  'invoices.view',
  'payments.view',
  'domains.view',
  'activity_logs.view',
  'notifications.view', 'notifications.send',
  'reports.view', 'reports.export'
)
on conflict do nothing;

/* Assign permissions to agent role */
insert into public.role_permissions (role_id, permission_id)
select 
  (select id from public.roles where name = 'agent'),
  p.id
from public.permissions p
where p.name in (
  'leads.view', 'leads.create', 'leads.edit',
  'properties.view', 'properties.create', 'properties.edit',
  'invoices.view',
  'payments.view',
  'notifications.view'
)
on conflict do nothing;

/* Assign permissions to viewer role */
insert into public.role_permissions (role_id, permission_id)
select 
  (select id from public.roles where name = 'viewer'),
  p.id
from public.permissions p
where p.name in (
  'agents.view',
  'leads.view',
  'properties.view',
  'licenses.view',
  'invoices.view',
  'payments.view',
  'domains.view',
  'reports.view'
)
on conflict do nothing;

/* Function to check if user has permission */
create or replace function has_permission(
  p_user_id uuid,
  p_permission_name text
)
returns boolean as $$
declare
  v_has_permission boolean;
begin
  select exists(
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = p_user_id
      and p.name = p_permission_name
  ) into v_has_permission;
  
  return v_has_permission;
end;
$$ language plpgsql security definer;

/* Function to get user permissions */
create or replace function get_user_permissions(p_user_id uuid)
returns table(
  permission_name text,
  permission_display_name text,
  permission_category text
) as $$
begin
  return query
  select distinct
    p.name,
    p.display_name,
    p.category
  from public.user_roles ur
  join public.role_permissions rp on rp.role_id = ur.role_id
  join public.permissions p on p.id = rp.permission_id
  where ur.user_id = p_user_id
  order by p.category, p.name;
end;
$$ language plpgsql security definer;

/* Function to get user roles */
create or replace function get_user_roles(p_user_id uuid)
returns table(
  role_id uuid,
  role_name text,
  role_display_name text
) as $$
begin
  return query
  select
    r.id,
    r.name,
    r.display_name
  from public.user_roles ur
  join public.roles r on r.id = ur.role_id
  where ur.user_id = p_user_id
  order by r.name;
end;
$$ language plpgsql security definer;

/* Function to assign role to user */
create or replace function assign_role_to_user(
  p_user_id uuid,
  p_role_name text
)
returns uuid as $$
declare
  v_role_id uuid;
  v_user_role_id uuid;
begin
  /* Get role id */
  select id into v_role_id
  from public.roles
  where name = p_role_name;
  
  if v_role_id is null then
    raise exception 'Role not found: %', p_role_name;
  end if;
  
  /* Insert user role */
  insert into public.user_roles (user_id, role_id)
  values (p_user_id, v_role_id)
  on conflict (user_id, role_id) do nothing
  returning id into v_user_role_id;
  
  return v_user_role_id;
end;
$$ language plpgsql security definer;

/* Function to remove role from user */
create or replace function remove_role_from_user(
  p_user_id uuid,
  p_role_name text
)
returns boolean as $$
declare
  v_role_id uuid;
begin
  /* Get role id */
  select id into v_role_id
  from public.roles
  where name = p_role_name;
  
  if v_role_id is null then
    return false;
  end if;
  
  /* Delete user role */
  delete from public.user_roles
  where user_id = p_user_id
    and role_id = v_role_id;
  
  return true;
end;
$$ language plpgsql security definer;
