'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Save, Eye, X } from 'lucide-react';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import ClientLandingPage from '../ClientLandingPage';
import BuilderSidebar from '@/components/BuilderSidebar';

type Agent = Database['public']['Tables']['agents']['Row'];

interface Page {
  id: string;
  agent_id: string;
  title: string;
  slug: string;
  is_home: boolean;
  visible: boolean;
  order_index: number;
  content: any;
}

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
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadAgent();
    loadPages();
  }, [domain]);

  // Sync mode with EditorContext
  useEffect(() => {
    setEditMode(mode === 'edit');
  }, [mode, setEditMode]);

  const loadAgent = async () => {
    const { data } = await supabase
      .from('agents')
      .eq('domain', domain)
      .single();

    if (data) {
      setAgent(data);
    }
    setLoading(false);
  };

  const loadPages = async () => {
    if (!agent) return;
    
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('agent_id', agent.id)
      .order('order_index', { ascending: true });

    if (data && data.length > 0) {
      setPages(data as Page[]);
      // Set first page or home page as current
      const homePage = data.find((p: any) => p.is_home);
      setCurrentPageId(homePage?.id || data[0].id);
    } else {
      // Create default home page if none exists
      await createDefaultHomePage();
    }
  };

  const createDefaultHomePage = async () => {
    if (!agent) return;

    const { data } = await supabase
      .from('pages')
      .insert({
        agent_id: agent.id,
        title: 'Ana Sayfa',
        slug: 'home',
        is_home: true,
        visible: true,
        order_index: 0,
        content: {}
      })
      .select()
      .single();

    if (data) {
      setPages([data as Page]);
      setCurrentPageId(data.id);
    }
  };

  const handleNewPage = async () => {
    if (!agent) return;

    const title = prompt('Sayfa başlığı:', 'Yeni Sayfa');
    if (!title) return;

    const slug = title.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-');

    const { data } = await supabase
      .from('pages')
      .insert({
        agent_id: agent.id,
        title,
        slug,
        is_home: false,
        visible: true,
        order_index: pages.length,
        content: {}
      })
      .select()
      .single();

    if (data) {
      setPages([...pages, data as Page]);
      setCurrentPageId(data.id);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    await supabase.from('pages').delete().eq('id', pageId);
    setPages(pages.filter(p => p.id !== pageId));
    if (currentPageId === pageId) {
      setCurrentPageId(pages[0]?.id || null);
    }
  };

  const handleToggleVisibility = async (pageId: string, visible: boolean) => {
    await supabase
      .from('pages')
      .update({ visible })
      .eq('id', pageId);
    
    setPages(pages.map(p => p.id === pageId ? { ...p, visible } : p));
  };

  const handleThemeColorChange = async (color: string) => {
    if (!agent) return;
    
    await supabase
      .from('agents')
      .update({ theme_color: color })
      .eq('id', agent.id);
    
    loadAgent();
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
      if (sections['hero']?.buttonText) updateData.hero_button_text = sections['hero'].buttonText;
      if (sections['hero']?.stats) updateData.stats_list = sections['hero'].stats;
      
      // Features section
      if (sections['features']?.title) updateData.features_title = sections['features'].title;
      if (sections['features']?.subtitle) updateData.features_subtitle = sections['features'].subtitle;
      if (sections['features']?.list) updateData.features_list = sections['features'].list;
      
      // Properties section
      if (sections['properties']?.title) updateData.properties_title = sections['properties'].title;
      
      // CTA section
      if (sections['cta']?.title) updateData.cta_title = sections['cta'].title;
      if (sections['cta']?.description) updateData.cta_description = sections['cta'].description;
      
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
    <div className="h-screen flex bg-gray-900">
      {/* Left Sidebar */}
      <BuilderSidebar
        pages={pages}
        currentPageId={currentPageId}
        onPageSelect={setCurrentPageId}
        onNewPage={handleNewPage}
        onDeletePage={handleDeletePage}
        onToggleVisibility={handleToggleVisibility}
        themeColor={agent.theme_color || '#111827'}
        onThemeColorChange={handleThemeColorChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
            
            <div className="text-sm font-semibold text-white">Sayfa Düzenleyici</div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'edit' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Düzenle
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'preview' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Önizle
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/d/${domain}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
          >
            <Eye className="w-4 h-4" />
            Canlı Görüntüle
          </button>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

        {/* Canvas - Landing Page Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          {agent && <ClientLandingPage agent={agent} />}
        </div>
      </div>
    </div>
  );
}
