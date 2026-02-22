/* Assign super_admin role to initial admin user */
/* Replace the email with your actual admin email */

do $$
declare
  v_user_id uuid;
  v_role_id uuid;
begin
  /* Get user ID from auth.users by email */
  select id into v_user_id
  from auth.users
  where email = 'erdemsltd@gmail.com';
  
  /* Get super_admin role ID */
  select id into v_role_id
  from public.roles
  where name = 'super_admin';
  
  /* Assign role if user exists */
  if v_user_id is not null and v_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (v_user_id, v_role_id)
    on conflict (user_id, role_id) do nothing;
    
    raise notice 'Super admin role assigned to user: %', 'erdemsltd@gmail.com';
  else
    raise notice 'User or role not found';
  end if;
end $$;
