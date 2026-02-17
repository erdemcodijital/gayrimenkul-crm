'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Plus, Edit, Trash2, CheckCircle, XCircle, ExternalLink, Server, Users, Activity, TrendingUp, Key, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Agent = Database['public']['Tables']['agents']['Row'];

interface SystemStats {
  uptime: number;
  totalAgents: number;
  activeAgents: number;
  totalLeads: number;
  serverStatus: 'online' | 'degraded' | 'offline';
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<SystemStats>({
    uptime: 99.9,
    totalAgents: 0,
    activeAgents: 0,
    totalLeads: 0,
    serverStatus: 'online'
  });

  useEffect(() => {
    loadAgents();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: agentsData } = await supabase
        .from('agents')
        .select('*');
      
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*');

      setStats({
        uptime: 99.9,
        totalAgents: agentsData?.length || 0,
        activeAgents: agentsData?.filter(a => a.is_active).length || 0,
        totalLeads: leadsData?.length || 0,
        serverStatus: 'online'
      });
    } catch (error) {
      console.error('Stats yükleme hatası:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Danışmanlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentStatus = async (agent: Agent) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ is_active: !agent.is_active })
        .eq('id', agent.id);

      if (error) throw error;
      await loadAgents();
      await loadStats();
    } catch (error) {
      console.error('Durum değiştirme hatası:', error);
      alert('Durum değiştirilemedi');
    }
  };

  const deleteAgent = async (id: string) => {
    if (!confirm('Bu danışmanı silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadAgents();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Danışman silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <h1 className="text-2xl font-bold text-gray-900">Danışmanlar</h1>
            <p className="text-sm text-gray-600 mt-1">Danışman hesaplarını ve lisansları yönetin</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Danışman
          </button>
        </div>

        {/* System Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Server Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Server Status</span>
              <Server className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${stats.serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-lg font-bold text-gray-900 capitalize">{stats.serverStatus}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Uptime: {stats.uptime}%</div>
          </div>

          {/* Total Agents */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Toplam Danışman</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalAgents}</div>
            <div className="text-xs text-gray-500 mt-1">Tüm kayıtlar</div>
          </div>

          {/* Active Agents */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Aktif Danışman</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.activeAgents}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.totalAgents > 0 ? Math.round((stats.activeAgents / stats.totalAgents) * 100) : 0}% aktif
            </div>
          </div>

          {/* Total Leads */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Toplam Lead</span>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
            <div className="text-xs text-gray-500 mt-1">Tüm başvurular</div>
          </div>

          {/* Licensed Agents */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Lisanslı</span>
              <Key className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {agents.filter(a => a.license_status === 'active').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Aktif lisans</div>
          </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Danışman
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Domain
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Lisans
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600">
                  Kayıt Tarihi
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600">
                  İşlemler
                </th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {agents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  Henüz danışman eklenmemiş
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.email}</div>
                        {agent.city && <div className="text-xs text-gray-400">{agent.city}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {agent.domain ? (
                      <a
                        href={`/gayrimenkul/d/${agent.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <span className="font-mono">{agent.domain}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAgentStatus(agent)}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition"
                    >
                      {agent.is_active ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-xs text-gray-700">Aktif</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                          <span className="text-xs text-gray-500">Pasif</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                      agent.license_status === 'active'
                        ? 'bg-blue-50 text-blue-700'
                        : agent.license_status === 'suspended'
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {agent.license_status === 'active' && <Key className="w-3 h-3 mr-1" />}
                      {agent.license_status === 'active' ? 'Lisanslı' : 
                       agent.license_status === 'suspended' ? 'Askıda' : 'Yok'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(agent.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => {
                          setEditingAgent(agent);
                          setShowEditModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAgent(agent.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateAgentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAgents();
            loadStats();
          }}
        />
      )}

      {showEditModal && editingAgent && (
        <EditAgentModal
          agent={editingAgent}
          onClose={() => {
            setShowEditModal(false);
            setEditingAgent(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingAgent(null);
            loadAgents();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

function CreateAgentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    domain: '',
    whatsapp_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('agents')
        .insert([formData]);

      if (insertError) throw insertError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Danışman Ekle</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Ad Soyad *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">E-posta *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div>
              <label className="label">WhatsApp</label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="input"
                placeholder="905XXXXXXXXX"
              />
            </div>

            <div>
              <label className="label">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
                placeholder="İstanbul"
              />
            </div>

            <div>
              <label className="label">Domain (benzersiz) *</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') })}
                className="input"
                placeholder="ahmetyilmaz.com veya ahmet-yilmaz"
                required
              />
              {formData.domain && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-primary-600 font-semibold">
                    📍 Path URL: /d/{formData.domain}
                  </p>
                  <p className="text-xs text-green-600 font-semibold">
                    🌐 Custom Domain: {formData.domain}
                  </p>
                  <p className="text-xs text-gray-500">
                    Danışman bu domain'i Vercel'de bağlayabilir
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditAgentModal({ agent, onClose, onSuccess }: { agent: Agent; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: agent.name || '',
    email: agent.email || '',
    phone: agent.phone || '',
    city: agent.city || '',
    domain: agent.domain || '',
    whatsapp_number: agent.whatsapp_number || '',
    is_active: agent.is_active,
    license_status: agent.license_status || 'inactive',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('agents')
        .update(formData)
        .eq('id', agent.id);

      if (updateError) throw updateError;
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Danışman Düzenle</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">ID:</span>
            <span className="text-xs font-mono text-gray-700">{agent.id.slice(0, 8)}...</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Domain Section - En Üstte */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-blue-900 mb-2">🌐 Domain (benzersiz) *</label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') })}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
              placeholder="ardaemlak.com veya arda-yilmaz"
              required
            />
            {formData.domain && (
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center space-x-2 text-blue-700">
                  <span className="font-semibold">Path URL:</span>
                  <code className="bg-white px-2 py-1 rounded border border-blue-200">/gayrimenkul/d/{formData.domain}</code>
                </div>
                {formData.domain.includes('.') && (
                  <div className="flex items-center space-x-2 text-green-700">
                    <span className="font-semibold">Custom Domain:</span>
                    <code className="bg-white px-2 py-1 rounded border border-green-200">{formData.domain}</code>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Ad Soyad *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">E-posta *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div>
              <label className="label">WhatsApp</label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="input"
                placeholder="905XXXXXXXXX"
              />
            </div>

            <div>
              <label className="label">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input"
                placeholder="İstanbul"
              />
            </div>

            <div>
              <label className="label">Durum</label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="input"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div>
              <label className="label">Lisans Durumu</label>
              <select
                value={formData.license_status}
                onChange={(e) => setFormData({ ...formData, license_status: e.target.value })}
                className="input"
              >
                <option value="active">Aktif</option>
                <option value="suspended">Askıda</option>
                <option value="expired">Süresi Dolmuş</option>
                <option value="inactive">İnaktif</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
