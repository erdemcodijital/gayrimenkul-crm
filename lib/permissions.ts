import { supabase } from './supabase';

export interface Permission {
  name: string;
  display_name: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
}

/**
 * Check if current user has a specific permission
 */
export async function hasPermission(permissionName: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .rpc('has_permission', {
        p_user_id: user.id,
        p_permission_name: permissionName
      });

    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if current user has any of the specified permissions
 */
export async function hasAnyPermission(permissionNames: string[]): Promise<boolean> {
  for (const permission of permissionNames) {
    const hasPerm = await hasPermission(permission);
    if (hasPerm) return true;
  }
  return false;
}

/**
 * Check if current user has all of the specified permissions
 */
export async function hasAllPermissions(permissionNames: string[]): Promise<boolean> {
  for (const permission of permissionNames) {
    const hasPerm = await hasPermission(permission);
    if (!hasPerm) return false;
  }
  return true;
}

/**
 * Get all permissions for current user
 */
export async function getUserPermissions(): Promise<Permission[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .rpc('get_user_permissions', {
        p_user_id: user.id
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Get all roles for current user
 */
export async function getUserRoles(): Promise<Role[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .rpc('get_user_roles', {
        p_user_id: user.id
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Assign a role to a user
 */
export async function assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .rpc('assign_role_to_user', {
        p_user_id: userId,
        p_role_name: roleName
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error assigning role:', error);
    return false;
  }
}

/**
 * Remove a role from a user
 */
export async function removeRoleFromUser(userId: string, roleName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .rpc('remove_role_from_user', {
        p_user_id: userId,
        p_role_name: roleName
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing role:', error);
    return false;
  }
}

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
  // Agents
  AGENTS_VIEW: 'agents.view',
  AGENTS_CREATE: 'agents.create',
  AGENTS_EDIT: 'agents.edit',
  AGENTS_DELETE: 'agents.delete',
  AGENTS_APPROVE: 'agents.approve',
  
  // Leads
  LEADS_VIEW: 'leads.view',
  LEADS_VIEW_ALL: 'leads.view_all',
  LEADS_CREATE: 'leads.create',
  LEADS_EDIT: 'leads.edit',
  LEADS_DELETE: 'leads.delete',
  LEADS_ASSIGN: 'leads.assign',
  
  // Properties
  PROPERTIES_VIEW: 'properties.view',
  PROPERTIES_VIEW_ALL: 'properties.view_all',
  PROPERTIES_CREATE: 'properties.create',
  PROPERTIES_EDIT: 'properties.edit',
  PROPERTIES_DELETE: 'properties.delete',
  PROPERTIES_PUBLISH: 'properties.publish',
  
  // Licenses
  LICENSES_VIEW: 'licenses.view',
  LICENSES_CREATE: 'licenses.create',
  LICENSES_EDIT: 'licenses.edit',
  LICENSES_DELETE: 'licenses.delete',
  LICENSES_ACTIVATE: 'licenses.activate',
  
  // Invoices
  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_EDIT: 'invoices.edit',
  INVOICES_DELETE: 'invoices.delete',
  INVOICES_PAY: 'invoices.pay',
  
  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CREATE: 'payments.create',
  
  // Domains
  DOMAINS_VIEW: 'domains.view',
  DOMAINS_CREATE: 'domains.create',
  DOMAINS_EDIT: 'domains.edit',
  DOMAINS_DELETE: 'domains.delete',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  
  // Activity Logs
  ACTIVITY_LOGS_VIEW: 'activity_logs.view',
  
  // Notifications
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_SEND: 'notifications.send',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',
  
  // Users & Roles
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  ROLES_VIEW: 'roles.view',
  ROLES_EDIT: 'roles.edit',
} as const;

/**
 * Role constants
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
  VIEWER: 'viewer',
} as const;
