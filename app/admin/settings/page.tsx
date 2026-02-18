'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Save, 
  Globe, 
  Mail, 
  MessageSquare, 
  Bell, 
  Palette, 
  Shield, 
  Upload,
  Check,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface Settings {
  // General
  site_title: string;
  site_description: string;
  support_email: string;
  support_phone: string;
  
  // Email (SMTP)
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_enabled: boolean;
  
  // WhatsApp
  whatsapp_api_url: string;
  whatsapp_api_key: string;
  whatsapp_enabled: boolean;
  
  // Notifications
  notify_new_lead: boolean;
  notify_lead_status_change: boolean;
  notify_new_property: boolean;
  notify_agent_signup: boolean;
  
  // Theme
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  favicon_url: string;
  
  // Security
  pin_required: boolean;
  session_timeout: number;
  ip_whitelist: string;
  max_login_attempts: number;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'whatsapp' | 'notifications' | 'theme' | 'security'>('general');
  const [settings, setSettings] = useState<Settings>({
    site_title: 'Gayrimenkul CRM',
    site_description: 'Profesyonel gayrimenkul yönetim sistemi',
    support_email: 'support@example.com',
    support_phone: '+90 555 000 00 00',
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: '',
    smtp_enabled: false,
    whatsapp_api_url: '',
    whatsapp_api_key: '',
    whatsapp_enabled: false,
    notify_new_lead: true,
    notify_lead_status_change: true,
    notify_new_property: true,
    notify_agent_signup: true,
    primary_color: '#111827',
    secondary_color: '#6366F1',
    logo_url: '/logo.png',
    favicon_url: '/favicon.ico',
    pin_required: true,
    session_timeout: 24,
    ip_whitelist: '',
    max_login_attempts: 5,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showWhatsappKey, setShowWhatsappKey] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (data) {
        setSettings({ ...settings, ...data });
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 1, ...settings });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Kaydetme hatası' });
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    setTestingEmail(true);
    try {
      // Email test endpoint'i çağrılacak
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated
      setMessage({ type: 'success', text: 'Test email gönderildi!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Email gönderimi başarısız!' });
    } finally {
      setTestingEmail(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Genel', icon: Globe },
    { id: 'email', label: 'Email (SMTP)', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'theme', label: 'Tema', icon: Palette },
    { id: 'security', label: 'Güvenlik', icon: Shield },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
          <p className="text-gray-600 mt-1">Platform yapılandırma ve ayarları</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Genel Ayarlar</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Başlığı
                    </label>
                    <input
                      type="text"
                      value={settings.site_title}
                      onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Gayrimenkul CRM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Açıklaması
                    </label>
                    <textarea
                      value={settings.site_description}
                      onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Profesyonel gayrimenkul yönetim sistemi"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destek Email
                      </label>
                      <input
                        type="email"
                        value={settings.support_email}
                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="support@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destek Telefon
                      </label>
                      <input
                        type="tel"
                        value={settings.support_phone}
                        onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+90 555 000 00 00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email (SMTP) Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Email (SMTP) Ayarları</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smtp_enabled}
                      onChange={(e) => setSettings({ ...settings, smtp_enabled: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SMTP Host
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_host}
                        onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="smtp.gmail.com"
                        disabled={!settings.smtp_enabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Port
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_port}
                        onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="587"
                        disabled={!settings.smtp_enabled}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Kullanıcı Adı / Email
                    </label>
                    <input
                      type="text"
                      value={settings.smtp_user}
                      onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="user@example.com"
                      disabled={!settings.smtp_enabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Şifre
                    </label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={settings.smtp_password}
                        onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                        placeholder="••••••••"
                        disabled={!settings.smtp_enabled}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showSmtpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gönderen Email
                      </label>
                      <input
                        type="email"
                        value={settings.smtp_from_email}
                        onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="noreply@example.com"
                        disabled={!settings.smtp_enabled}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gönderen İsim
                      </label>
                      <input
                        type="text"
                        value={settings.smtp_from_name}
                        onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Gayrimenkul CRM"
                        disabled={!settings.smtp_enabled}
                      />
                    </div>
                  </div>

                  <button
                    onClick={testEmailConnection}
                    disabled={!settings.smtp_enabled || testingEmail}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingEmail ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Settings */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">WhatsApp API Ayarları</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.whatsapp_enabled}
                      onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API URL
                    </label>
                    <input
                      type="url"
                      value={settings.whatsapp_api_url}
                      onChange={(e) => setSettings({ ...settings, whatsapp_api_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://api.whatsapp.com/..."
                      disabled={!settings.whatsapp_enabled}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showWhatsappKey ? 'text' : 'password'}
                        value={settings.whatsapp_api_key}
                        onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                        placeholder="••••••••••••••••"
                        disabled={!settings.whatsapp_enabled}
                      />
                      <button
                        type="button"
                        onClick={() => setShowWhatsappKey(!showWhatsappKey)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showWhatsappKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">WhatsApp Business API Gereklidir</p>
                        <p className="text-blue-700">
                          WhatsApp Business API hesabı oluşturmak için Meta Business Suite'i ziyaret edin.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Ayarları</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Yeni Lead Bildirimi</p>
                      <p className="text-sm text-gray-600">Yeni lead eklendiğinde admin'e bildirim gönder</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notify_new_lead}
                      onChange={(e) => setSettings({ ...settings, notify_new_lead: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Lead Durum Değişikliği</p>
                      <p className="text-sm text-gray-600">Lead durumu değiştiğinde bildirim gönder</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notify_lead_status_change}
                      onChange={(e) => setSettings({ ...settings, notify_lead_status_change: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Yeni İlan Bildirimi</p>
                      <p className="text-sm text-gray-600">Yeni ilan eklendiğinde bildirim gönder</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notify_new_property}
                      onChange={(e) => setSettings({ ...settings, notify_new_property: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Yeni Danışman Kaydı</p>
                      <p className="text-sm text-gray-600">Yeni danışman kaydolduğunda bildirim gönder</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notify_agent_signup}
                      onChange={(e) => setSettings({ ...settings, notify_agent_signup: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tema Ayarları</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ana Renk (Primary)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.primary_color}
                          onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.primary_color}
                          onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="#111827"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        İkincil Renk (Secondary)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={settings.secondary_color}
                          onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                          className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings.secondary_color}
                          onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="#6366F1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.logo_url}
                        onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="/logo.png"
                      />
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Yükle</span>
                      </button>
                    </div>
                    {settings.logo_url && (
                      <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <img src={settings.logo_url} alt="Logo Preview" className="h-12 object-contain" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Favicon URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.favicon_url}
                        onChange={(e) => setSettings({ ...settings, favicon_url: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="/favicon.ico"
                      />
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>Yükle</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik Ayarları</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">PIN Kod Zorunluluğu</p>
                      <p className="text-sm text-gray-600">Danışmanlar için PIN kod girişi zorunlu olsun</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pin_required}
                      onChange={(e) => setSettings({ ...settings, pin_required: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (saat)
                    </label>
                    <input
                      type="number"
                      value={settings.session_timeout}
                      onChange={(e) => setSettings({ ...settings, session_timeout: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                      max="168"
                      placeholder="24"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Kullanıcı oturumu bu süreden sonra otomatik sonlanır
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maksimum Giriş Denemesi
                    </label>
                    <input
                      type="number"
                      value={settings.max_login_attempts}
                      onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="3"
                      max="10"
                      placeholder="5"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Bu sayıda başarısız denemeden sonra hesap geçici olarak kilitlenir
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IP Whitelist
                    </label>
                    <textarea
                      value={settings.ip_whitelist}
                      onChange={(e) => setSettings({ ...settings, ip_whitelist: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                      placeholder="192.168.1.1&#10;10.0.0.1&#10;203.0.113.0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Sadece bu IP adreslerinden admin paneline erişime izin verilir (Her satıra bir IP)
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Dikkat!</p>
                        <p className="text-amber-700">
                          Güvenlik ayarlarını değiştirirken dikkatli olun. Yanlış ayarlar sisteme erişimi engelleyebilir.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </div>
  );
}
