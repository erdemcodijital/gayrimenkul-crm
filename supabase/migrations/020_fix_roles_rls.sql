/* Temporarily disable RLS for roles table to debug */
/* This allows reading roles without authentication */

-- Drop existing restrictive policy
drop policy if exists "Enable read access for authenticated users" on public.roles;

-- Create more permissive policy for roles (they are public info anyway)
create policy "Anyone can view roles" on public.roles
  for select using (true);

-- Make sure RLS is enabled
alter table public.roles enable row level security;
