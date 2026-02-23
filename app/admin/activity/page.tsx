'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Activity, Filter, Calendar, User, FileText, Search, RefreshCw, Clock, Database, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  description: string | null;
  changes: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ActivityStats {
  total: number;
  today: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<string>('7');
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    today: 0,
    byAction: {},
    byEntity: {}
  });

  useEffect(() => {
    loadActivities();
  }, [dateRange]);

  const loadActivities = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      const activitiesData = data || [];
      setActivities(activitiesData);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayActivities = activitiesData.filter(a => 
        new Date(a.created_at) >= today
      );

      const byAction: Record<string, number> = {};
      const byEntity: Record<string, number> = {};

      activitiesData.forEach(activity => {
        byAction[activity.action] = (byAction[activity.action] || 0) + 1;
        byEntity[activity.entity_type] = (byEntity[activity.entity_type] || 0) + 1;
      });

      setStats({
        total: activitiesData.length,
        today: todayActivities.length,
        byAction,
        byEntity
      });
    } catch (error) {
      console.error('Activity load error:', error);
      toast.error('Aktiviteler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      created: '✓',
      updated: '↻',
      deleted: '×',
      login: '→',
      logout: '←'
    };
    return icons[action] || '•';
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      created: 'text-green-600 bg-green-50 border-green-200',
      updated: 'text-blue-600 bg-blue-50 border-blue-200',
      deleted: 'text-red-600 bg-red-50 border-red-200',
      login: 'text-purple-600 bg-purple-50 border-purple-200',
      logout: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[action] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      created: 'Oluşturuldu',
      updated: 'Güncellendi',
      deleted: 'Silindi',
      login: 'Giriş',
      logout: 'Çıkış'
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: Record<string, string> = {
      agents: 'Danışman',
      leads: 'Lead',
      properties: 'İlan',
      invoices: 'Fatura',
      licenses: 'Lisans',
      payments: 'Ödeme'
    };
    return labels[entityType] || entityType;
  };

  const filteredActivities = activities.filter(activity => {
    if (filterAction !== 'all' && activity.action !== filterAction) return false;
    if (filterEntity !== 'all' && activity.entity_type !== filterEntity) return false;
    if (filterUser !== 'all' && activity.user_email !== filterUser) return false;
    if (searchTerm && !activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !activity.entity_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const exportToCSV = () => {
    const headers = ['Tarih', 'Kullanıcı', 'Eylem', 'Varlık', 'Açıklama'];
    const rows = filteredActivities.map(activity => [
      new Date(activity.created_at).toLocaleString('tr-TR'),
      activity.user_name || activity.user_email || '-',
      getActionLabel(activity.action),
      getEntityLabel(activity.entity_type),
      activity.description || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('CSV dosyası indiriliyor...');
  };

  const uniqueUsers = Array.from(new Set(activities.map(a => a.user_email).filter(Boolean)));
  const uniqueActions = Array.from(new Set(activities.map(a => a.action)));
  const uniqueEntities = Array.from(new Set(activities.map(a => a.entity_type)));

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistem Aktiviteleri</h1>
            <p className="text-sm text-gray-600 mt-1">Tüm sistem aktivitelerini ve değişikliklerini izleyin</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV İndir
            </button>
            <button
              onClick={() => loadActivities()}
              className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Toplam Aktivite</span>
              <Database className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Son {dateRange} gün</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Bugün</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.today}</div>
            <div className="text-xs text-gray-500 mt-1">Yeni aktiviteler</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">En Çok</span>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {Object.keys(stats.byAction).length > 0 
                ? getActionLabel(Object.entries(stats.byAction).sort((a, b) => b[1] - a[1])[0][0])
                : '-'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Eylem tipi</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">En Aktif</span>
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {Object.keys(stats.byEntity).length > 0 
                ? getEntityLabel(Object.entries(stats.byEntity).sort((a, b) => b[1] - a[1])[0][0])
                : '-'}
            </div>
            <div className="text-xs text-gray-500 mt-1">Varlık tipi</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <Calendar className="w-3 h-3 inline mr-1" />
              Tarih Aralığı
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900"
            >
              <option value="1">Son 24 saat</option>
              <option value="7">Son 7 gün</option>
              <option value="30">Son 30 gün</option>
              <option value="90">Son 90 gün</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <Activity className="w-3 h-3 inline mr-1" />
              Eylem
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Tümü</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{getActionLabel(action)}</option>
              ))}
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <FileText className="w-3 h-3 inline mr-1" />
              Varlık Tipi
            </label>
            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Tümü</option>
              {uniqueEntities.map(entity => (
                <option key={entity} value={entity}>{getEntityLabel(entity)}</option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <User className="w-3 h-3 inline mr-1" />
              Kullanıcı
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Tümü</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              <Search className="w-3 h-3 inline mr-1" />
              Arama
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ara..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Aktivite Zaman Çizelgesi</h2>
        
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aktivite bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4 relative">
                {/* Timeline Line */}
                {index !== filteredActivities.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                )}

                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${getActionColor(activity.action)} z-10`}>
                  {getActionIcon(activity.action)}
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getActionColor(activity.action)}`}>
                          {getActionLabel(activity.action)}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-700">
                          {getEntityLabel(activity.entity_type)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description || `${getActionLabel(activity.action)} ${getEntityLabel(activity.entity_type)}`}
                      </p>
                      {activity.entity_name && (
                        <p className="text-xs text-gray-600 mt-1">
                          {activity.entity_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleString('tr-TR')}
                      </div>
                      {activity.user_name && (
                        <div className="text-xs text-gray-600 mt-1 font-medium">
                          {activity.user_name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
    </div>
  );
}
