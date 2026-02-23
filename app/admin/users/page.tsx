'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Shield, Mail, Calendar, Check, X, AlertCircle, UserPlus, Eye, EyeOff } from 'lucide-react';
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
  
  // Create user modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    role: 'agent'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load users - Try admin API first, fallback to regular query
      let authUsers: any[] = [];
      
      try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (!error && users) {
          authUsers = users;
        }
      } catch (adminError) {
        console.warn('Admin API not available, using fallback method');
        // Fallback: Get users from admin_users table
        const { data: adminUsersData } = await supabase
          .from('admin_users')
          .select('user_id, name, email, created_at');
        
        if (adminUsersData) {
          authUsers = adminUsersData.map(au => ({
            id: au.user_id,
            email: au.email || '',
            created_at: au.created_at,
            last_sign_in_at: ''
          }));
        }
      }

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
      
      // Debug log
      console.log('Loaded roles:', rolesData);

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

  const createUser = async () => {
    if (!createForm.email || !createForm.password) {
      toast.error('Email ve şifre gerekli');
      return;
    }

    if (createForm.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }

    setCreating(true);
    try {
      // Create user with Supabase Auth Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: createForm.email,
        password: createForm.password,
        email_confirm: true
      });

      if (error) throw error;
      if (!data.user) throw new Error('Kullanıcı oluşturulamadı');

      // Assign selected role
      const success = await assignRoleToUser(data.user.id, createForm.role);
      if (!success) {
        console.warn('Rol atanamadı ama kullanıcı oluşturuldu');
      }

      toast.success('Kullanıcı başarıyla oluşturuldu!');
      setShowCreateModal(false);
      setCreateForm({ email: '', password: '', role: 'agent' });
      
      // Reload data
      await loadData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Kullanıcı oluşturulamadı');
    } finally {
      setCreating(false);
    }
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-5 h-5" />
            <span className="font-medium">{users.length} Kullanıcı</span>
          </div>
          {/* Temporarily disabled permission check for debugging */}
          {/* {can(PERMISSIONS.USERS_EDIT) && ( */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Yeni Kullanıcı
            </button>
          {/* )} */}
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
                {/* Temporarily disabled permission check */}
                {/* {can(PERMISSIONS.USERS_EDIT) && ( */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                {/* )} */}
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
                  {/* Temporarily disabled permission check */}
                  {/* {can(PERMISSIONS.USERS_EDIT) && ( */}
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
                  {/* )} */}
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Yeni Kullanıcı Oluştur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="kullanici@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="En az 6 karakter"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlangıç Rolü
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={roles.length === 0}
                >
                  {roles.length === 0 ? (
                    <option value="">Roller yükleniyor...</option>
                  ) : (
                    roles.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.display_name}
                      </option>
                    ))
                  )}
                </select>
                {roles.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{roles.length} rol mevcut</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={createUser}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
