'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { formatDate, formatPhone } from '@/lib/utils';
import { Filter, Download, Phone, Search, Eye, Edit, Trash2, UserPlus, X, Mail, MessageSquare, MapPin, Home, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type Lead = Database['public']['Tables']['leads']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];

interface LeadWithAgent extends Lead {
  agent: Agent | null;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadWithAgent[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<LeadWithAgent[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadWithAgent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [selectedAgent, selectedStatus, searchQuery, leads]);

  const loadData = async () => {
    try {
      // Load agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);

      // Load leads with agent info
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select(`
          *,
          agent:agents(*)
        `)
        .order('created_at', { ascending: false });

      if (leadsError) throw leadsError;
      
      const formattedLeads = (leadsData || []).map(lead => ({
        ...lead,
        agent: Array.isArray(lead.agent) ? lead.agent[0] : lead.agent
      }));
      
      setLeads(formattedLeads);
      setFilteredLeads(formattedLeads);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];

    if (selectedAgent !== 'all') {
      filtered = filtered.filter(lead => lead.agent_id === selectedAgent);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(lead => lead.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.district?.toLowerCase().includes(query)
      );
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      toast.success('Durum güncellendi!');
      await loadData();
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      toast.error('Durum güncellenemedi');
    }
  };

  const exportToCSV = () => {
    const headers = ['Tarih', 'Danışman', 'Ad', 'Telefon', 'Bütçe', 'Oda Sayısı', 'İlçe', 'Durum'];
    const rows = filteredLeads.map(lead => [
      formatDate(lead.created_at),
      lead.agent?.name || '-',
      lead.name,
      lead.phone,
      lead.budget || '-',
      lead.room_count || '-',
      lead.district || '-',
      lead.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leadler</h1>
          <p className="text-gray-600 mt-2">Tüm leadleri görüntüle ve yönet</p>
        </div>
        <button
          onClick={exportToCSV}
          className="btn-primary flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>CSV İndir</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İsim, telefon veya ilçe ile ara..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Danışman</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Durum</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              <option value="new">Yeni</option>
              <option value="contacted">İletişime Geçildi</option>
              <option value="converted">Dönüştürüldü</option>
              <option value="lost">Kayıp</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Toplam {filteredLeads.length} lead gösteriliyor
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danışman
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri Bilgileri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bütçe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Oda Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İlçe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Henüz lead bulunmuyor
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.agent?.name || '-'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.agent?.city || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <a
                        href={`tel:${formatPhone(lead.phone)}`}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.budget || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.room_count || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.district || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`text-sm font-semibold rounded-full px-3 py-1 ${
                          lead.status === 'new'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.status === 'contacted'
                            ? 'bg-yellow-100 text-yellow-800'
                            : lead.status === 'converted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="new">Yeni</option>
                        <option value="contacted">İletişime Geçildi</option>
                        <option value="converted">Dönüştürüldü</option>
                        <option value="lost">Kayıp</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Detayları Gör"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Lead Detayları</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Müşteri Bilgileri
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Ad Soyad</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Telefon</p>
                    <a href={`tel:${selectedLead.phone}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedLead.phone}
                    </a>
                  </div>
                  {selectedLead.email && (
                    <div>
                      <p className="text-xs text-blue-600 mb-1">Email</p>
                      <a href={`mailto:${selectedLead.email}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Gayrimenkul Tercihleri
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-green-600 mb-1">İlçe</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedLead.district || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Bütçe</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {selectedLead.budget || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Oda Sayısı</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedLead.room_count || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600 mb-1">Tip</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedLead.property_type || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Agent & Status */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">Danışman & Durum</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Atanan Danışman</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedLead.agent?.name || 'Atanmamış'}</p>
                    {selectedLead.agent?.domain && (
                      <p className="text-xs text-gray-500 mt-1">{selectedLead.agent.domain}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 mb-1">Durum</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedLead.status === 'new'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedLead.status === 'contacted'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedLead.status === 'converted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedLead.status === 'new' ? 'Yeni' :
                       selectedLead.status === 'contacted' ? 'İletişime Geçildi' :
                       selectedLead.status === 'converted' ? 'Dönüştürüldü' : 'Kayıp'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedLead.message && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Mesaj
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedLead.message}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Tarihler
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Oluşturulma</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedLead.created_at)}</p>
                  </div>
                  {selectedLead.updated_at && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Son Güncelleme</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(selectedLead.updated_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  window.location.href = `tel:${selectedLead.phone}`;
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Ara
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
