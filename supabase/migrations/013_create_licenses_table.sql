-- Create licenses table for agent license management
create table if not exists public.licenses (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references public.agents(id) on delete cascade not null,
  license_type text not null default 'basic', -- basic, pro, enterprise
  start_date timestamptz not null default now(),
  end_date timestamptz not null,
  status text not null default 'active', -- active, expired, suspended
  price decimal(10,2),
  currency text default 'TRY',
  billing_cycle text default 'monthly', -- monthly, yearly
  auto_renew boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists licenses_agent_id_idx on public.licenses(agent_id);
create index if not exists licenses_status_idx on public.licenses(status);
create index if not exists licenses_end_date_idx on public.licenses(end_date);

-- Enable RLS
alter table public.licenses enable row level security;

-- RLS Policies
create policy "Enable read access for all users" on public.licenses
  for select using (true);

create policy "Enable insert for authenticated users only" on public.licenses
  for insert with check (true);

create policy "Enable update for authenticated users only" on public.licenses
  for update using (true);

create policy "Enable delete for authenticated users only" on public.licenses
  for delete using (true);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_licenses_updated_at
  before update on public.licenses
  for each row
  execute function public.handle_updated_at();

-- Insert sample licenses for existing agents
insert into public.licenses (agent_id, license_type, start_date, end_date, status, price, billing_cycle)
select 
  id,
  'basic',
  now(),
  now() + interval '30 days',
  'active',
  99.00,
  'monthly'
from public.agents
where not exists (
  select 1 from public.licenses where licenses.agent_id = agents.id
);
