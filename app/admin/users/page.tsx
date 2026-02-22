'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Shield, Mail, Calendar, Check, X, AlertCircle } from 'lucide-react';
import { assignRoleToUser, removeRoleFromUser } from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
}

interface UserRole {
  user_id: string;
  role_id: string;
}

interface UserWithRoles extends User {
  roles: Role[];
}

export default function UsersPage() {
  const { can } = usePermissions();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningRole, setAssigningRole] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load users from auth.users
      const { data: { users: authUsers }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;

      // Load roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (rolesError) throw rolesError;

      // Load user roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id, role_id');

      if (userRolesError) throw userRolesError;

      setRoles(rolesData || []);
      setUserRoles(userRolesData || []);

      // Combine users with their roles
      const usersWithRoles: UserWithRoles[] = (authUsers || []).map(user => {
        const userRoleIds = (userRolesData || [])
          .filter(ur => ur.user_id === user.id)
          .map(ur => ur.role_id);
        
        const userRolesList = (rolesData || []).filter(r => userRoleIds.includes(r.id));

        return {
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at || '',
          roles: userRolesList
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (userId: string, roleId: string): boolean => {
    return userRoles.some(ur => ur.user_id === userId && ur.role_id === roleId);
  };

  const toggleRole = async (userId: string, roleName: string) => {
    if (!can(PERMISSIONS.USERS_EDIT)) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    setAssigningRole(`${userId}-${roleName}`);

    try {
      const role = roles.find(r => r.name === roleName);
      if (!role) throw new Error('Rol bulunamadı');

      const hasIt = hasRole(userId, role.id);

      if (hasIt) {
        const success = await removeRoleFromUser(userId, roleName);
        if (!success) throw new Error('Rol kaldırılamadı');

        setUserRoles(prev => prev.filter(ur => !(ur.user_id === userId && ur.role_id === role.id)));
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, roles: u.roles.filter(r => r.id !== role.id) }
            : u
        ));
        toast.success('Rol kaldırıldı');
      } else {
        const success = await assignRoleToUser(userId, roleName);
        if (!success) throw new Error('Rol atanamadı');

        setUserRoles(prev => [...prev, { user_id: userId, role_id: role.id }]);
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, roles: [...u.roles, role] }
            : u
        ));
        toast.success('Rol atandı');
      }
    } catch (error: any) {
      console.error('Error toggling role:', error);
      toast.error(error.message || 'Rol güncellenirken hata oluştu');
    } finally {
      setAssigningRole(null);
    }
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

  // Temporarily disabled for debugging
  // if (!can(PERMISSIONS.USERS_VIEW)) {
  //   return (
  //     <div className="flex items-center justify-center h-96">
  //       <div className="text-center">
  //         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
  //         <h2 className="text-xl font-bold text-gray-900 mb-2">Erişim Engellendi</h2>
  //         <p className="text-gray-600">Bu sayfayı görüntüleme yetkiniz yok.</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600 mt-1">Kullanıcıları ve rollerini yönetin</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-5 h-5" />
          <span className="font-medium">{users.length} Kullanıcı</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Giriş
                </th>
                {can(PERMISSIONS.USERS_EDIT) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {role.display_name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Rol atanmamış</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR')
                        : 'Hiç giriş yapmadı'}
                    </div>
                  </td>
                  {can(PERMISSIONS.USERS_EDIT) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {roles.map(role => {
                          const isAssigned = hasRole(user.id, role.id);
                          const isProcessing = assigningRole === `${user.id}-${role.name}`;

                          return (
                            <button
                              key={role.id}
                              onClick={() => toggleRole(user.id, role.name)}
                              disabled={isProcessing}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                                isAssigned
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              } disabled:opacity-50`}
                              title={isAssigned ? 'Rolü kaldır' : 'Rol ata'}
                            >
                              {isProcessing ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isAssigned ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              {role.display_name}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Henüz kullanıcı bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}
