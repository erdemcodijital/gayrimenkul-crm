'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Key, Calendar, AlertCircle, CheckCircle, Clock, TrendingUp, RefreshCw, Plus, Edit, XCircle, DollarSign } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Agent = Database['public']['Tables']['agents']['Row'];

interface License {
  id: string;
  agent_id: string;
  license_type: string;
  start_date: string;
  end_date: string;
  status: string;
  price: number | null;
  currency: string | null;
  billing_cycle: string;
  auto_renew: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  agents?: Agent;
}

interface LicenseStats {
  total: number;
  active: number;
  expired: number;
  expiring_soon: number;
  revenue_monthly: number;
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<LicenseStats>({
    total: 0,
    active: 0,
    expired: 0,
    expiring_soon: 0,
    revenue_monthly: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLicenses();
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Agents load error:', error);
    }
  };

  const loadLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select(`
          *,
          agents (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const licensesData = data || [];
      setLicenses(licensesData);

      // Calculate stats
      const now = new Date();
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);

      const stats: LicenseStats = {
        total: licensesData.length,
        active: licensesData.filter(l => l.status === 'active').length,
        expired: licensesData.filter(l => l.status === 'expired' || new Date(l.end_date) < now).length,
        expiring_soon: licensesData.filter(l => {
          const endDate = new Date(l.end_date);
          return endDate > now && endDate <= in7Days && l.status === 'active';
        }).length,
        revenue_monthly: licensesData
          .filter(l => l.status === 'active' && l.billing_cycle === 'monthly')
          .reduce((sum, l) => sum + (l.price || 0), 0)
      };

      setStats(stats);
    } catch (error) {
      console.error('Licenses load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate: string): number => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getStatusColor = (license: License): string => {
    const daysRemaining = getDaysRemaining(license.end_date);
    
    if (license.status === 'expired' || daysRemaining < 0) return 'text-red-600 bg-red-50 border-red-200';
    if (daysRemaining <= 7) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (license.status === 'active') return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusText = (license: License): string => {
    const daysRemaining = getDaysRemaining(license.end_date);
    
    if (license.status === 'expired' || daysRemaining < 0) return 'Süresi Doldu';
    if (daysRemaining <= 7) return `${daysRemaining} gün kaldı`;
    if (license.status === 'active') return 'Aktif';
    if (license.status === 'suspended') return 'Askıda';
    return 'Bilinmiyor';
  };

  const renewLicense = async (license: License, months: number) => {
    try {
      const currentEndDate = new Date(license.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + months);

      const { error } = await supabase
        .from('licenses')
        .update({
          end_date: newEndDate.toISOString(),
          status: 'active'
        })
        .eq('id', license.id);

      if (error) throw error;
      
      alert(`Lisans ${months} ay uzatıldı`);
      await loadLicenses();
    } catch (error) {
      console.error('Renew error:', error);
      alert('Lisans yenilenemedi');
    }
  };

  const filteredLicenses = licenses.filter(license => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return license.status === 'active' && getDaysRemaining(license.end_date) > 0;
    if (filterStatus === 'expiring') return getDaysRemaining(license.end_date) <= 7 && getDaysRemaining(license.end_date) > 0;
    if (filterStatus === 'expired') return license.status === 'expired' || getDaysRemaining(license.end_date) < 0;
    return true;
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Lisans Yönetimi</h1>
            <p className="text-sm text-gray-600 mt-1">Danışman lisanslarını ve aboneliklerini yönetin</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Lisans
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Licenses */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Toplam Lisans</span>
              <Key className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Tüm kayıtlar</div>
          </div>

          {/* Active Licenses */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Aktif</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <span>Toplam {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</span>
            </div>
          </div>

          {/* Expiring Soon */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Yakında Bitenler</span>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.expiring_soon}</div>
            <div className="text-xs text-gray-500 mt-1">7 gün içinde</div>
          </div>

          {/* Expired */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Süresi Dolmuş</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.expired}</div>
            <div className="text-xs text-gray-500 mt-1">Yenileme gerekli</div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Aylık Gelir</span>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600">₺{stats.revenue_monthly.toFixed(0)}</div>
            <div className="text-xs text-gray-500 mt-1">Tekrarlayan</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Filtrele:</span>
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'active', label: 'Aktif' },
          { key: 'expiring', label: 'Yakında Bitenler' },
          { key: 'expired', label: 'Süresi Dolmuş' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filterStatus === key
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Licenses Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Danışman</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Tip</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Başlangıç</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Bitiş</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Kalan Gün</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Fiyat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-500">
                    Lisans bulunamadı
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((license) => {
                  const daysRemaining = getDaysRemaining(license.end_date);
                  
                  return (
                    <tr key={license.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {license.agents?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {license.agents?.domain}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 capitalize">
                          {license.license_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(license.start_date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(license.end_date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className={`w-4 h-4 ${daysRemaining < 0 ? 'text-red-500' : daysRemaining <= 7 ? 'text-orange-500' : 'text-green-500'}`} />
                          <span className={`text-sm font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d ago` : `${daysRemaining}d`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(license)}`}>
                          {getStatusText(license)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {license.price ? `₺${license.price}` : '-'}
                        <div className="text-xs text-gray-500 capitalize">{license.billing_cycle}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => renewLicense(license, 1)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                            title="1 ay yenile"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingLicense(license);
                              setShowEditModal(true);
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
