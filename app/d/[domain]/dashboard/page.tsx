'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { LogOut, TrendingUp, Users, Phone, Mail, MessageCircle } from 'lucide-react';

type Agent = Database['public']['Tables']['agents']['Row'];
type Lead = Database['public']['Tables']['leads']['Row'];

export default function AgentDashboard() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [agent, setAgent] = useState<Agent | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'leads' | 'settings'>('leads');
  const [themeColor, setThemeColor] = useState('#111827');
  const [savingTheme, setSavingTheme] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const savedPin = localStorage.getItem(`agent_pin_${domain}`);
    if (savedPin) {
      verifyPin(savedPin);
    }
  }, [domain]);

  const verifyPin = async (pin: string) => {
    setLoading(true);
    setError('');

    try {
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('domain', domain)
        .eq('pin_code', pin)
        .single();

      if (agentError || !agentData) {
        setError('Hatalı PIN kodu');
        localStorage.removeItem(`agent_pin_${domain}`);
        return;
      }

      // Lisans kontrolü
      if (agentData.license_status !== 'active') {
        setError('Lisansınız aktif değil. Lütfen yönetici ile iletişime geçin.');
        localStorage.removeItem(`agent_pin_${domain}`);
        return;
      }

      // Aktif mi kontrolü
      if (!agentData.is_active) {
        setError('Hesabınız devre dışı. Lütfen yönetici ile iletişime geçin.');
        localStorage.removeItem(`agent_pin_${domain}`);
        return;
      }

      setAgent(agentData);
      setIsAuthenticated(true);
      setThemeColor(agentData.theme_color || '#111827');
      localStorage.setItem(`agent_pin_${domain}`, pin);
      await loadLeads(agentData.id);
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const saveThemeColor = async () => {
    if (!agent) return;
    
    setSavingTheme(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ theme_color: themeColor })
        .eq('id', agent.id);

      if (error) throw error;
      
      alert('Tema rengi kaydedildi! Landing sayfanızı yenilediğinizde göreceksiniz.');
    } catch (err) {
      alert('Tema rengi kaydedilemedi');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pinCode);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAgent(null);
    setLeads([]);
    setPinCode('');
    localStorage.removeItem(`agent_pin_${domain}`);
  };

  const loadLeads = async (agentId: string) => {
    try {
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (leadsData) {
        setLeads(leadsData);

        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        setStats({
          total: leadsData.length,
          today: leadsData.filter(l => new Date(l.created_at) >= today).length,
          thisWeek: leadsData.filter(l => new Date(l.created_at) >= weekAgo).length,
          thisMonth: leadsData.filter(l => new Date(l.created_at) >= monthStart).length,
        });
      }
    } catch (error) {
      console.error('Lead yükleme hatası:', error);
    }
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Danışman Girişi</h1>
              <p className="text-gray-600 mt-2">{domain}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN Kodu
                </label>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || pinCode.length !== 4}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a href={`/d/${domain}`} className="text-sm text-gray-600 hover:text-gray-900">
                ← Ana Sayfaya Dön
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{agent?.name}</h1>
                <p className="text-xs text-gray-500">Danışman Paneli</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('leads')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'leads'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leadlerim
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === 'settings'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ayarlar
            </button>
          </nav>
        </div>

        {activeTab === 'leads' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Toplam Lead</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Bugün</div>
            <div className="text-2xl font-bold text-green-600">{stats.today}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Bu Hafta</div>
            <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs text-gray-600 mb-1">Bu Ay</div>
            <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Leadlerim</h2>
          </div>

          {leads.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Henüz lead yok</p>
              <p className="text-sm text-gray-500 mt-2">Yeni leadler burada görünecek</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div key={lead.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">{lead.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Yeni
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <a href={`tel:${lead.phone}`} className="hover:text-gray-900">
                            {lead.phone}
                          </a>
                        </div>
                        {lead.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            <a href={`mailto:${lead.email}`} className="hover:text-gray-900">
                              {lead.email}
                            </a>
                          </div>
                        )}
                        {lead.message && (
                          <div className="flex items-start text-sm text-gray-600 mt-2">
                            <MessageCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <p className="flex-1">{lead.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        {new Date(lead.created_at).toLocaleString('tr-TR')}
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      <a
                        href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Merhaba ${lead.name}, ${domain} üzerinden iletişime geçtiniz.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Site Ayarları</h2>
            
            {/* Theme Color */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema Rengi
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Landing sayfanızın ana rengini belirleyin
                </p>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="h-12 w-20 rounded border border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="#111827"
                    />
                  </div>
                  <button
                    onClick={saveThemeColor}
                    disabled={savingTheme}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {savingTheme ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Önizleme:</p>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-16 h-16 rounded-lg"
                    style={{ backgroundColor: themeColor }}
                  ></div>
                  <div>
                    <p className="text-sm text-gray-700">Landing sayfanızda butonlar ve vurgulamalar bu renkte görünecek</p>
                  </div>
                </div>
              </div>

              {/* Agent Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Site Bilgileriniz</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">İsim:</span>
                    <span className="font-medium text-gray-900">{agent?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Domain:</span>
                    <span className="font-medium text-gray-900">{agent?.domain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Site URL:</span>
                    <a 
                      href={`/d/${agent?.domain}`}
                      target="_blank"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Siteyi Görüntüle →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
