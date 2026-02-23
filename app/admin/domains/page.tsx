'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Globe, Check, X, Copy, ExternalLink, RefreshCw, AlertCircle, Eye, Shield, Activity, TrendingUp } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type Agent = Database['public']['Tables']['agents']['Row'];

interface DomainStatus {
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  sslStatus: 'active' | 'pending' | 'none';
}

export default function DomainsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [domainStats, setDomainStats] = useState<any>(null);

  useEffect(() => {
    loadAgents();
  }, []);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Panoya kopyalandı!');
  };

  const viewDomainDetail = async (agent: Agent) => {
    setSelectedAgent(agent);
    
    // Load agent's leads for analytics
    const { data: agentLeads } = await supabase
      .from('leads')
      .select('*')
      .eq('agent_id', agent.id);

    // Load agent's properties
    const { data: agentProperties } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', agent.id);

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const stats = {
      totalLeads: agentLeads?.length || 0,
      leadsLastWeek: agentLeads?.filter(l => new Date(l.created_at) >= lastWeek).length || 0,
      leadsLastMonth: agentLeads?.filter(l => new Date(l.created_at) >= lastMonth).length || 0,
      totalProperties: agentProperties?.length || 0,
      activeProperties: agentProperties?.filter(p => p.status === 'active').length || 0,
      sslStatus: agent.domain?.includes('.') ? 'active' : 'n/a',
      domainType: agent.domain?.includes('.') ? 'custom' : 'path',
      isCustomDomain: agent.domain?.includes('.') || false
    };

    setDomainStats(stats);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Yönetimi</h1>
        <p className="text-sm text-gray-600">Danışman domain'lerini yönetin ve Vercel'de nasıl bağlanacağını öğrenin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Toplam Domain</div>
          <div className="text-2xl font-bold text-gray-900">{agents.filter(a => a.domain).length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Aktif Domain</div>
          <div className="text-2xl font-bold text-green-600">
            {agents.filter(a => a.domain && a.is_active && a.license_status === 'active').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Custom Domain</div>
          <div className="text-2xl font-bold text-blue-600">
            {agents.filter(a => a.domain && a.domain.includes('.')).length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-xs text-gray-600 mb-1">Path-based</div>
          <div className="text-2xl font-bold text-gray-600">
            {agents.filter(a => a.domain && !a.domain.includes('.')).length}
          </div>
        </div>
      </div>

      {/* Domain Setup Instructions */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Custom Domain Nasıl Bağlanır?</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</span>
                <div>
                  <strong>Vercel'e Deploy Edin:</strong> Projeyi Vercel'e deploy ettiyseniz, Vercel Dashboard'a gidin.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</span>
                <div>
                  <strong>Settings → Domains:</strong> Projenizde Settings &gt; Domains bölümüne gidin.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</span>
                <div>
                  <strong>Domain Ekleyin:</strong> Danışmanın domain'ini (ör: ardaemlak.com) ekleyin.
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-600">4</span>
                <div>
                  <strong>DNS Ayarları:</strong> Vercel size DNS kayıtlarını gösterecek. Danışmana bu bilgileri verin.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Danışman Domain'leri</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {agents.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              Henüz danışman yok
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{agent.name}</h3>
                      {agent.license_status === 'active' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Aktif
                        </span>
                      )}
                    </div>
                    
                    {agent.domain ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <code className="text-sm font-mono text-blue-600">{agent.domain}</code>
                          <button
                            onClick={() => copyToClipboard(agent.domain!)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Kopyala"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>

                        {/* URL Preview */}
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <a
                            href={`/gayrimenkul/d/${agent.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                          >
                            <span>Path URL: /gayrimenkul/d/{agent.domain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {/* DNS Info for Custom Domains */}
                        {agent.domain.includes('.') && (
                          <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="text-xs font-semibold text-gray-700 mb-2">DNS Ayarları (Danışmana Verin):</div>
                            <div className="space-y-1.5 text-xs font-mono">
                              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                <div>
                                  <span className="text-gray-500">Type:</span> <span className="text-gray-900">A</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Name:</span> <span className="text-gray-900">@</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Value:</span> <span className="text-gray-900">76.76.21.21</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard('76.76.21.21')}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                <div>
                                  <span className="text-gray-500">Type:</span> <span className="text-gray-900">CNAME</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Name:</span> <span className="text-gray-900">www</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Value:</span> <span className="text-gray-900">cname.vercel-dns.com</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard('cname.vercel-dns.com')}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Copy className="w-3 h-3 text-gray-400" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 flex items-start space-x-2 text-xs text-amber-700">
                              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <p>Bu DNS kayıtlarını danışmanın domain sağlayıcısında (GoDaddy, Namecheap, vb.) ayarlaması gerekiyor.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Domain atanmamış</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {agent.domain && (
                      <button
                        onClick={() => viewDomainDetail(agent)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Detay
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowEditModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      Düzenle
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vercel Integration Info */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Vercel Domain Entegrasyonu</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-600 mb-4">
            Danışman domain'lerini Vercel'de bağlamak için aşağıdaki adımları izleyin:
          </p>
          <ol className="space-y-3 text-sm text-gray-700">
            <li><strong>Vercel Dashboard'a gidin:</strong> <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com/dashboard</a></li>
            <li><strong>Projenizi seçin</strong> (gayrimenkul-crm)</li>
            <li><strong>Settings → Domains</strong> bölümüne gidin</li>
            <li><strong>"Add Domain"</strong> butonuna tıklayın</li>
            <li>Danışmanın domain'ini girin (ör: <code className="bg-gray-100 px-1.5 py-0.5 rounded">ardaemlak.com</code>)</li>
            <li>Vercel size DNS ayarlarını gösterecek</li>
            <li>Bu DNS ayarlarını danışmana gönderin</li>
            <li>Danışman kendi domain sağlayıcısında bu ayarları yapacak</li>
            <li>10-15 dakika içinde domain aktif olacak</li>
            <li>SSL sertifikası otomatik oluşturulacak (Let's Encrypt)</li>
          </ol>
        </div>
      </div>

      {/* Domain Detail Modal */}
      {showDetailModal && selectedAgent && domainStats && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedAgent.name} - Domain Detayları</h3>
                <p className="text-sm text-gray-600 mt-1 font-mono">{selectedAgent.domain}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAgent(null);
                  setDomainStats(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Domain Status Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <div className="text-xs font-semibold text-blue-900">Domain Tipi</div>
                  </div>
                  <div className="text-lg font-bold text-blue-700 capitalize">{domainStats.domainType}</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <div className="text-xs font-semibold text-green-900">SSL Durumu</div>
                  </div>
                  <div className="text-lg font-bold text-green-700 uppercase">{domainStats.sslStatus}</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <div className="text-xs font-semibold text-purple-900">Toplam Lead</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{domainStats.totalLeads}</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <div className="text-xs font-semibold text-orange-900">İlanlar</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">{domainStats.totalProperties}</div>
                </div>
              </div>

              {/* Analytics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Domain Analytics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Son 7 Gün Lead</div>
                    <div className="text-2xl font-bold text-gray-900">{domainStats.leadsLastWeek}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Son 30 Gün Lead</div>
                    <div className="text-2xl font-bold text-gray-900">{domainStats.leadsLastMonth}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Aktif İlanlar</div>
                    <div className="text-2xl font-bold text-gray-900">{domainStats.activeProperties}</div>
                  </div>
                </div>
              </div>

              {/* DNS & SSL Info */}
              {domainStats.isCustomDomain && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">SSL & DNS Bilgileri</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-gray-600">SSL Sertifikası:</span>
                      <span className="font-medium text-green-600">Let's Encrypt (Otomatik)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-gray-600">DNS Sağlayıcı:</span>
                      <span className="font-medium text-gray-900">Vercel DNS</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span className="text-gray-600">HTTPS:</span>
                      <span className="font-medium text-green-600">Aktif</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Access URLs */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Erişim URL'leri</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Path URL</div>
                      <code className="text-sm text-gray-900 font-mono">/gayrimenkul/d/{selectedAgent.domain}</code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`/gayrimenkul/d/${selectedAgent.domain}`)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  {domainStats.isCustomDomain && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Custom Domain URL</div>
                        <code className="text-sm text-gray-900 font-mono">https://{selectedAgent.domain}</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`https://${selectedAgent.domain}`)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAgent(null);
                  setDomainStats(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowEditModal(true);
                }}
                className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition shadow-lg"
              >
                Düzenle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAgent && (
        <EditAgentModal
          agent={selectedAgent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAgent(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedAgent(null);
            loadAgents();
          }}
        />
      )}

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
          <h2 className="text-2xl font-bold text-gray-900">Domain ve Danışman Ayarları</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="05XX XXX XX XX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="905XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="İstanbul"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Domain (benzersiz) *</label>
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="ahmetyilmaz.com veya ahmet-yilmaz"
                required
              />
              {formData.domain && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-900 font-semibold">Path URL:</span>
                      <code className="text-blue-700">/gayrimenkul/d/{formData.domain}</code>
                    </div>
                    {formData.domain.includes('.') && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-900 font-semibold">Custom Domain:</span>
                        <code className="text-blue-700">{formData.domain}</code>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
              <select
                value={formData.is_active ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lisans Durumu</label>
              <select
                value={formData.license_status}
                onChange={(e) => setFormData({ ...formData, license_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
