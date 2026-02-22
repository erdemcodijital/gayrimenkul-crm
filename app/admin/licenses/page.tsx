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
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [renewingLicense, setRenewingLicense] = useState<License | null>(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editForm, setEditForm] = useState({
    license_type: 'basic',
    end_date: '',
    price: '',
    billing_cycle: 'monthly',
    status: 'active',
    notes: ''
  });

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

  const openRenewModal = (license: License) => {
    setRenewingLicense(license);
    setRenewMonths(1);
    setShowRenewModal(true);
  };

  const confirmRenewal = async () => {
    if (!renewingLicense) return;

    try {
      const currentEndDate = new Date(renewingLicense.end_date);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + renewMonths);

      const { error } = await supabase
        .from('licenses')
        .update({
          end_date: newEndDate.toISOString(),
          status: 'active'
        })
        .eq('id', renewingLicense.id);

      if (error) throw error;
      
      setShowRenewModal(false);
      setRenewingLicense(null);
      await loadLicenses();
      alert(`Lisans başarıyla ${renewMonths} ay uzatıldı`);
    } catch (error) {
      console.error('Renew error:', error);
      alert('Lisans yenilenemedi');
    }
  };

  const openEditModal = (license: License) => {
    setEditingLicense(license);
    setEditForm({
      license_type: license.license_type,
      end_date: license.end_date.split('T')[0],
      price: license.price?.toString() || '',
      billing_cycle: license.billing_cycle,
      status: license.status,
      notes: license.notes || ''
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingLicense) return;

    try {
      const { error } = await supabase
        .from('licenses')
        .update({
          license_type: editForm.license_type,
          end_date: new Date(editForm.end_date).toISOString(),
          price: editForm.price ? parseFloat(editForm.price) : null,
          billing_cycle: editForm.billing_cycle,
          status: editForm.status,
          notes: editForm.notes
        })
        .eq('id', editingLicense.id);

      if (error) throw error;
      
      setShowEditModal(false);
      setEditingLicense(null);
      await loadLicenses();
      alert('Lisans başarıyla güncellendi');
    } catch (error) {
      console.error('Update error:', error);
      alert('Lisans güncellenemedi');
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
                            onClick={() => openRenewModal(license)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                            title="Lisans yenile"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(license)}
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

      {/* Renew License Modal */}
      {showRenewModal && renewingLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Lisans Yenileme</h3>
              <p className="text-sm text-gray-600 mt-1">
                {renewingLicense.agents?.name} - {renewingLicense.license_type.toUpperCase()}
              </p>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Current Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Mevcut Bitiş:</span>
                    <div className="font-medium text-gray-900">
                      {new Date(renewingLicense.end_date).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Kalan Gün:</span>
                    <div className="font-medium text-orange-600">
                      {getDaysRemaining(renewingLicense.end_date)} gün
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Yenileme Süresi
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 3, 6, 12].map(months => {
                    const monthlyPrice = renewingLicense.price || 5000;
                    const totalPrice = monthlyPrice * months;
                    const newEndDate = new Date(renewingLicense.end_date);
                    newEndDate.setMonth(newEndDate.getMonth() + months);
                    
                    return (
                      <button
                        key={months}
                        onClick={() => setRenewMonths(months)}
                        className={`p-4 border-2 rounded-lg text-left transition ${
                          renewMonths === months
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-bold text-lg text-gray-900">{months} Ay</div>
                        <div className="text-sm text-gray-600 mt-1">₺{totalPrice.toLocaleString('tr-TR')}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {newEndDate.toLocaleDateString('tr-TR')} bitiş
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary with KDV */}
              <div className="space-y-2">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Aylık Ücret:</span>
                    <span className="font-medium text-gray-900">₺{(renewingLicense.price || 5000).toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Süre:</span>
                    <span className="font-medium text-gray-900">{renewMonths} Ay</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Ara Toplam:</span>
                      <span className="font-medium text-gray-900">₺{((renewingLicense.price || 5000) * renewMonths).toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>KDV %20 Dahil</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">Toplam Tutar (KDV Dahil):</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₺{((renewingLicense.price || 5000) * renewMonths).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowRenewModal(false);
                  setRenewingLicense(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                İptal
              </button>
              <button
                onClick={confirmRenewal}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-lg"
              >
                Yenilemeyi Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit License Modal */}
      {showEditModal && editingLicense && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Lisans Düzenle</h3>
              <p className="text-sm text-gray-600 mt-1">
                {editingLicense.agents?.name}
              </p>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* License Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Lisans Tipi
                </label>
                <select
                  value={editForm.license_type}
                  onChange={(e) => setEditForm({ ...editForm, license_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Price & Billing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fiyat (₺) - KDV Dahil
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="5000.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">KDV %20 dahil fiyat</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fatura Döngüsü
                  </label>
                  <select
                    value={editForm.billing_cycle}
                    onChange={(e) => setEditForm({ ...editForm, billing_cycle: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="monthly">Aylık</option>
                    <option value="yearly">Yıllık</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Durum
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="active">Aktif</option>
                  <option value="expired">Süresi Dolmuş</option>
                  <option value="suspended">Askıda</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notlar
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Ek notlar..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingLicense(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                İptal
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition shadow-lg"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
