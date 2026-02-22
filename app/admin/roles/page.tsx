'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Users, Lock, Check, X, Edit, Save, AlertCircle } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system: boolean;
}

interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  category: string;
}

interface RolePermission {
  role_id: string;
  permission_id: string;
}

export default function RolesPage() {
  const { can } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ display_name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesRes, permissionsRes, rolePermsRes] = await Promise.all([
        supabase.from('roles').select('*').order('name'),
        supabase.from('permissions').select('*').order('category, name'),
        supabase.from('role_permissions').select('*')
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (permissionsRes.data) setPermissions(permissionsRes.data);
      if (rolePermsRes.data) setRolePermissions(rolePermsRes.data);

      if (rolesRes.data && rolesRes.data.length > 0) {
        setSelectedRole(rolesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (roleId: string, permissionId: string): boolean => {
    return rolePermissions.some(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
  };

  const togglePermission = async (roleId: string, permissionId: string) => {
    if (!can(PERMISSIONS.ROLES_EDIT)) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    const role = roles.find(r => r.id === roleId);
    if (role?.is_system && role.name === 'super_admin') {
      toast.error('Süper Admin rolü düzenlenemez');
      return;
    }

    try {
      const hasIt = hasPermission(roleId, permissionId);

      if (hasIt) {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission_id', permissionId);

        if (error) throw error;

        setRolePermissions(prev => 
          prev.filter(rp => !(rp.role_id === roleId && rp.permission_id === permissionId))
        );
        toast.success('Yetki kaldırıldı');
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role_id: roleId, permission_id: permissionId });

        if (error) throw error;

        setRolePermissions(prev => [...prev, { role_id: roleId, permission_id: permissionId }]);
        toast.success('Yetki eklendi');
      }
    } catch (error: any) {
      console.error('Error toggling permission:', error);
      toast.error('Yetki güncellenirken hata: ' + error.message);
    }
  };

  const startEdit = (role: Role) => {
    if (!can(PERMISSIONS.ROLES_EDIT)) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    if (role.is_system) {
      toast.error('Sistem rolleri düzenlenemez');
      return;
    }

    setEditingRole(role.id);
    setEditForm({
      display_name: role.display_name,
      description: role.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setEditForm({ display_name: '', description: '' });
  };

  const saveRole = async (roleId: string) => {
    if (!editForm.display_name.trim()) {
      toast.error('Rol adı gerekli');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('roles')
        .update({
          display_name: editForm.display_name,
          description: editForm.description
        })
        .eq('id', roleId);

      if (error) throw error;

      setRoles(prev => prev.map(r => 
        r.id === roleId 
          ? { ...r, display_name: editForm.display_name, description: editForm.description }
          : r
      ));

      toast.success('Rol güncellendi');
      setEditingRole(null);
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error('Rol kaydedilirken hata: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const categoryNames: Record<string, string> = {
    agents: 'Danışmanlar',
    leads: 'Leadler',
    properties: 'İlanlar',
    licenses: 'Lisanslar',
    invoices: 'Faturalar',
    payments: 'Ödemeler',
    domains: 'Domainler',
    settings: 'Ayarlar',
    activity_logs: 'Aktivite Logları',
    notifications: 'Bildirimler',
    reports: 'Raporlar',
    users: 'Kullanıcılar',
    roles: 'Roller'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!can(PERMISSIONS.ROLES_VIEW)) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erişim Engellendi</h2>
          <p className="text-gray-600">Bu sayfayı görüntüleme yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rol & Yetki Yönetimi</h1>
          <p className="text-gray-600 mt-1">Kullanıcı rollerini ve yetkilerini yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Roller
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {roles.map((role) => {
                const permCount = rolePermissions.filter(rp => rp.role_id === role.id).length;
                const isEditing = editingRole === role.id;

                return (
                  <div
                    key={role.id}
                    className={`p-4 cursor-pointer transition ${
                      selectedRole === role.id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => !isEditing && setSelectedRole(role.id)}
                  >
                    {isEditing ? (
                      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editForm.display_name}
                          onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Rol Adı"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Açıklama"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveRole(role.id)}
                            disabled={saving}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50"
                          >
                            <Save className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{role.display_name}</h3>
                          {!role.is_system && can(PERMISSIONS.ROLES_EDIT) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(role);
                              }}
                              className="p-1 text-gray-500 hover:text-blue-600 transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{permCount} yetki</span>
                          {role.is_system && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              Sistem Rolü
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-2">
          {selectedRoleData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {selectedRoleData.display_name} - Yetkiler
                </h2>
                {selectedRoleData.is_system && selectedRoleData.name === 'super_admin' && (
                  <p className="text-sm text-amber-600 mt-1">
                    Süper Admin rolünün yetkileri düzenlenemez
                  </p>
                )}
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category}>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        {categoryNames[category] || category}
                        <span className="text-xs text-gray-500 font-normal">
                          ({perms.filter(p => hasPermission(selectedRole!, p.id)).length}/{perms.length})
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map((permission) => {
                          const isGranted = hasPermission(selectedRole!, permission.id);
                          const canEdit = can(PERMISSIONS.ROLES_EDIT) && 
                            !(selectedRoleData.is_system && selectedRoleData.name === 'super_admin');

                          return (
                            <label
                              key={permission.id}
                              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                                isGranted
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              } ${!canEdit && 'opacity-60 cursor-not-allowed'}`}
                            >
                              <input
                                type="checkbox"
                                checked={isGranted}
                                onChange={() => togglePermission(selectedRole!, permission.id)}
                                disabled={!canEdit}
                                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  {permission.display_name}
                                </div>
                                {permission.description && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {permission.description}
                                  </div>
                                )}
                              </div>
                              {isGranted && (
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
