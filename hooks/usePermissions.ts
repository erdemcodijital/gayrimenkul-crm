import { useState, useEffect } from 'react';
import { getUserPermissions, getUserRoles, hasPermission, Permission, Role } from '@/lib/permissions';

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const [perms, userRoles] = await Promise.all([
        getUserPermissions(),
        getUserRoles()
      ]);
      setPermissions(perms);
      setRoles(userRoles);
    } catch (error) {
      console.error('Error loading permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const can = (permissionName: string): boolean => {
    return permissions.some(p => p.name === permissionName);
  };

  const canAny = (permissionNames: string[]): boolean => {
    return permissionNames.some(name => can(name));
  };

  const canAll = (permissionNames: string[]): boolean => {
    return permissionNames.every(name => can(name));
  };

  const hasRole = (roleName: string): boolean => {
    return roles.some(r => r.name === roleName);
  };

  const isAdmin = (): boolean => {
    return hasRole('super_admin') || hasRole('admin');
  };

  const isManager = (): boolean => {
    return hasRole('manager');
  };

  const isAgent = (): boolean => {
    return hasRole('agent');
  };

  return {
    permissions,
    roles,
    loading,
    can,
    canAny,
    canAll,
    hasRole,
    isAdmin,
    isManager,
    isAgent,
    refresh: loadPermissions
  };
}
