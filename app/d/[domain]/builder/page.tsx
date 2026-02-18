'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Save, Eye, X } from 'lucide-react';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import ClientLandingPage from '../ClientLandingPage';

type Agent = Database['public']['Tables']['agents']['Row'];

export default function VisualBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;

  return (
    <EditorProvider>
      <BuilderContent domain={domain} router={router} />
    </EditorProvider>
  );
}

function BuilderContent({ domain, router }: any) {
  const { setEditMode, getSaveData } = useEditor();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadAgent();
  }, [domain]);

  // Sync mode with EditorContext
  useEffect(() => {
    setEditMode(mode === 'edit');
  }, [mode, setEditMode]);

  const loadAgent = async () => {
    const { data } = await supabase
      .from('agents')
      .select('*')
      .eq('domain', domain)
      .single();

    if (data) {
      setAgent(data);
    }
    setLoading(false);
  };

  const saveChanges = async () => {
    if (!agent) return;
    
    setSaving(true);
    try {
      const sections = getSaveData();
      
      console.log('Saving all sections:', sections);
      
      const updateData: any = {};
      
      // Hero section
      if (sections['hero']?.title) updateData.hero_title = sections['hero'].title;
      if (sections['hero']?.subtitle) updateData.hero_subtitle = sections['hero'].subtitle;
      
      // Features section
      if (sections['features']?.title) updateData.features_title = sections['features'].title;
      
      // Properties section
      if (sections['properties']?.title) updateData.properties_title = sections['properties'].title;
      
      // CTA section
      if (sections['cta']?.title) updateData.cta_title = sections['cta'].title;
      
      if (Object.keys(updateData).length === 0) {
        alert('⚠️ Değişiklik yapılmadı!');
        setSaving(false);
        return;
      }
      
      console.log('Updating with:', updateData);
      
      const { error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', agent.id);

      if (error) {
        console.error('Save error:', error);
        alert('❌ Kaydetme hatası: ' + error.message);
      } else {
        alert('✅ Tüm değişiklikler kaydedildi!');
        // Reload agent data
        loadAgent();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert('❌ Bir hata oluştu: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/d/${domain}/dashboard`)}
            className="text-gray-400 hover:text-white transition"
            title="Panele Dön"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="h-6 w-px bg-gray-700" />
          
          <div className="text-sm font-semibold text-white">🎨 Sayfa Düzenleyici</div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'edit' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ✏️ Düzenle
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              👁️ Önizle
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/d/${domain}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
          >
            <Eye className="w-4 h-4" />
            🌐 Canlı Görüntüle
          </button>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? '💾 Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>
      </div>

      {/* Canvas - Landing Page Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        {agent && <ClientLandingPage agent={agent} />}
      </div>

      {/* Right Panel - Properties (when section is selected) */}
      {mode === 'edit' && (
        <div className="fixed right-0 top-[57px] bottom-0 w-96 bg-white border-l border-gray-200 shadow-2xl overflow-y-auto z-40">
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Düzenleyici</h3>
            <p className="text-xs text-gray-500 mb-4">Değişiklikler otomatik kaydedilir</p>
            
            <div className="space-y-4">
              {/* Quick Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 İpucu</h4>
                <p className="text-xs text-blue-700">
                  Başlıklara tıklayarak düzenleyebilirsiniz. 
                  Değişiklikler yapınca "Save" butonuna tıklayın.
                </p>
              </div>

              {/* Section Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">📄 Bölümler</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Hero - Ana başlık ve açıklama</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    <span>Features - Özellikler listesi</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>Properties - İlanlar</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">📝 Nasıl Kullanılır?</h4>
                <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Düzenlemek istediğiniz metne tıklayın</li>
                  <li>Yeni metni yazın</li>
                  <li>Başka bir yere tıklayın</li>
                  <li>Save butonuna tıklayın</li>
                  <li>View Live ile kontrol edin</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
