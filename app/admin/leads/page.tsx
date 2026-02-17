'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { formatDate, formatPhone } from '@/lib/utils';
import { Filter, Download, Phone } from 'lucide-react';

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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [selectedAgent, selectedStatus, leads]);

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

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      alert('Durum güncellenemedi');
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
