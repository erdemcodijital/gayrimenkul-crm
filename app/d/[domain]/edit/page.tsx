'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Save, X, Eye } from 'lucide-react';

type Agent = Database['public']['Tables']['agents']['Row'];

export default function LandingPageEdit() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');

  useEffect(() => {
    loadAgent();
  }, [domain]);

  const loadAgent = async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('domain', domain)
      .single();

    if (data) {
      setAgent(data);
      setHeroTitle(data.hero_title || data.name);
      setHeroSubtitle(data.hero_subtitle || 'Gayrimenkul Danışmanı');
      setHeroDescription(data.about_text || 'Size en uygun gayrimenkul seçeneklerini bulmak için buradayım.');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!agent) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('agents')
      .update({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        about_text: heroDescription,
      })
      .eq('id', agent.id);

    if (!error) {
      alert('✅ Kaydedildi! Landing sayfanızı görmek için önizlemeye tıklayın.');
    } else {
      alert('❌ Hata oluştu!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-lg font-bold text-sm">
              ✏️ DÜZENLEME MODU
            </div>
            <h1 className="text-xl font-bold text-gray-900">Landing Sayfası Editor</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(`/d/${domain}`, '_blank')}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Önizle
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              onClick={() => router.push(`/d/${domain}/dashboard`)}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section Editor */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Hero Bölümü</h2>
            <p className="text-gray-600">Landing sayfanızın üst kısmındaki ana mesajlar</p>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ana Başlık
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-4 py-3 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="İsminiz veya şirket adınız"
              />
              <p className="mt-2 text-sm text-gray-500">Bu metin büyük ve kalın görünecek</p>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Alt Başlık
              </label>
              <input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full px-4 py-3 text-xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unvanınız veya sloganınız"
              />
              <p className="mt-2 text-sm text-gray-500">Örn: "Gayrimenkul Danışmanı"</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Açıklama Metni
              </label>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kendinizi tanıtın..."
              />
              <p className="mt-2 text-sm text-gray-500">Ziyaretçilere kendinizi kısaca tanıtın</p>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-12 text-white text-center">
          <div className="mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏠</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{heroTitle || 'Başlık Buraya'}</h1>
          <p className="text-2xl mb-6 opacity-90">{heroSubtitle || 'Alt başlık buraya'}</p>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">{heroDescription || 'Açıklama metni buraya'}</p>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>İpucu:</strong> Değişikliklerinizi görmek için yukarıdaki <strong>"Kaydet"</strong> butonuna tıklayın, 
            ardından <strong>"Önizle"</strong> ile landing sayfanızı görüntüleyin.
          </p>
        </div>
      </div>
    </div>
  );
}
