'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Save, Eye, X } from 'lucide-react';
import { EditorProvider, useEditor } from '@/contexts/EditorContext';
import ClientLandingPage from '../ClientLandingPage';
import BuilderSidebar from '@/components/BuilderSidebar';
import PropertiesPanel from '@/components/PropertiesPanel';
import ComponentsPanel from '@/components/ComponentsPanel';
import SectionAdder from '@/components/SectionAdder';
import { Section, SectionType, SECTION_TEMPLATES } from '@/types/sections';

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
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Memoize currentPage to ensure React sees state changes
  // Use JSON.stringify to detect deep changes in sections
  const currentPage = useMemo(() => {
    const page = pages.find(p => p.id === currentPageId);
    if (page) {
      console.log('📄 Builder: Current page memoized', page.content?.sections?.map((s: any) => `${s.id} (order: ${s.order})`));
    }
    return page;
  }, [JSON.stringify(pages.find(p => p.id === currentPageId)?.content?.sections), currentPageId]);

  useEffect(() => {
    loadAgent();
  }, [domain]);

  useEffect(() => {
    if (agent) {
      loadPages();
    }
  }, [agent]);

  // Update URL when page changes
  useEffect(() => {
    if (currentPageId && pages.length > 0) {
      const currentPage = pages.find(p => p.id === currentPageId);
      if (currentPage) {
        const url = new URL(window.location.href);
        url.searchParams.set('page', currentPage.slug);
        window.history.pushState({}, '', url.toString());
        
        // Load page content into editor
        loadPageContent(currentPage);
      }
    }
  }, [currentPageId]); // Only reload when page ID changes, NOT when pages array updates

  const loadPageContent = (page: Page) => {
    console.log('📄 Loading page content:', page.title, page.content);
    
    // If page has content, we'll use it
    // Otherwise editor will use default values from ClientLandingPage
    if (page.content && Object.keys(page.content).length > 0) {
      console.log('✅ Page has custom content');
      // Content will be loaded by ClientLandingPage from page prop
    } else {
      console.log('ℹ️ Page has no custom content, using defaults');
    }
  };

  // Sync mode with EditorContext
  useEffect(() => {
    // For home page, enable edit mode for contentEditable
    // For custom pages, enable edit mode in edit mode
    const currentPage = pages.find(p => p.id === currentPageId);
    const isHomePage = currentPage?.is_home ?? false;
    
    console.log('🔄 Edit mode sync:', { isHomePage, mode, currentPageId });
    
    if (isHomePage) {
      console.log('🏠 Home page - ENABLING edit mode for contentEditable');
      setEditMode(mode === 'edit'); // ON for contentEditable
    } else {
      console.log('📄 Custom page - edit mode:', mode === 'edit');
      setEditMode(mode === 'edit'); // ON for custom pages in edit mode
    }
  }, [mode, setEditMode, currentPageId, pages]);

  const loadAgent = async () => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('domain', domain)
      .single();

    if (error) {
      console.error('Agent load error:', error);
    }

    if (data) {
      setAgent(data);
    }
    setLoading(false);
  };

  const loadPages = async () => {
    if (!agent) return;
    
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('agent_id', agent.id)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Pages load error:', error);
        // If pages table doesn't exist yet, just continue without pages
        setPages([]);
        return;
      }

      if (data && data.length > 0) {
        console.log('📥 LOADED FROM DATABASE:', data.map((p: any) => ({
          title: p.title,
          sections: p.content?.sections?.map((s: any) => `${s.id} (order: ${s.order})`)
        })));
        
        // NO AUTO-ADDING! Just use what's in the database!
        setPages(data as Page[]);
        
        // Check if there's a page in URL
        const urlParams = new URLSearchParams(window.location.search);
        const pageSlug = urlParams.get('page');
        
        if (pageSlug) {
          const page = data.find((p: any) => p.slug === pageSlug);
          if (page) {
            setCurrentPageId(page.id);
            return;
          }
        }
        
        // Otherwise set first page or home page as current
        const homePage = data.find((p: any) => p.is_home);
        setCurrentPageId(homePage?.id || data[0].id);
      } else {
        // Create default home page if none exists
        await createDefaultHomePage();
      }
    } catch (err) {
      console.error('Pages error:', err);
      setPages([]);
    }
  };

  const createDefaultHomePage = async () => {
    if (!agent) return;

    // Create EMPTY home page - user will add sections manually!
    const { data } = await supabase
      .from('pages')
      .insert({
        agent_id: agent.id,
        title: 'Ana Sayfa',
        slug: 'home',
        is_home: true,
        visible: true,
        order_index: 0,
        content: { sections: [] }
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

  const handleSectionVisibilityChange = async (section: string, visible: boolean) => {
    if (!agent) return;
    
    const updateData: any = { [section]: visible };
    
    await supabase
      .from('agents')
      .update(updateData)
      .eq('id', agent.id);
    
    loadAgent();
  };

  const handleAddSection = (type: SectionType) => {
    const currentPage = pages.find(p => p.id === currentPageId);
    if (!currentPage) return;

    const template = SECTION_TEMPLATES[type];
    const newSection: Section = {
      ...template,
      id: `section-${Date.now()}`,
      order: (currentPage.content?.sections?.length || 0)
    } as Section;

    const existingSections = currentPage.content?.sections || [];
    const updatedSections = [...existingSections, newSection];

    // Update local state immediately
    setPages(prevPages => prevPages.map(p =>
      p.id === currentPageId
        ? { ...p, content: { ...p.content, sections: updatedSections } }
        : p
    ));

    // Save to database
    const updatedContent = { ...currentPage.content, sections: updatedSections };
    supabase
      .from('pages')
      .update({ content: updatedContent })
      .eq('id', currentPageId)
      .then(() => {
        console.log('✅ Section added and saved to database');
      });
  };

  const handleUpdateSection = (id: string, data: any) => {
    const currentPage = pages.find(p => p.id === currentPageId);
    if (!currentPage || !currentPage.content?.sections) return;

    const updatedSections = currentPage.content.sections.map((section: Section) =>
      section.id === id ? { ...section, data } : section
    );

    // Update local state immediately for instant UI update
    setPages(pages.map(p => 
      p.id === currentPageId 
        ? { ...p, content: { ...p.content, sections: updatedSections } }
        : p
    ));

    // Save to database
    const updatedContent = { ...currentPage.content, sections: updatedSections };
    supabase
      .from('pages')
      .update({ content: updatedContent })
      .eq('id', currentPageId);
  };

  const handleDeleteSection = (id: string) => {
    if (!currentPage || !currentPage.content?.sections) return;

    const updatedSections = currentPage.content.sections.filter((section: Section) => section.id !== id);

    // Update local state immediately with prevPages pattern
    setPages(prevPages => prevPages.map(p => 
      p.id === currentPageId 
        ? { ...p, content: { ...p.content, sections: updatedSections } }
        : p
    ));

    // Save to database
    const updatedContent = { ...currentPage.content, sections: updatedSections };
    supabase
      .from('pages')
      .update({ content: updatedContent })
      .eq('id', currentPageId)
      .then(() => {
        console.log('✅ Section deleted and saved to database');
      });
  };

  const handleReorderSections = useCallback((reorderedSections: Section[]) => {
    if (!currentPage) return;

    console.log('🔄 Reordering sections BEFORE:', currentPage.content.sections.map((s: any) => `${s.id} (order: ${s.order})`));
    console.log('🔄 Reordering sections AFTER:', reorderedSections.map(s => `${s.id} (order: ${s.order})`));

    // Update local state immediately with DEEP COPY to force React re-render
    setPages(prevPages => {
      const newPages = prevPages.map(p => {
        if (p.id === currentPageId) {
          return {
            ...p,
            content: {
              ...p.content,
              sections: [...reorderedSections] // NEW array reference
            }
          };
        }
        return p;
      });
      
      console.log('🔄 NEW PAGES sections:', newPages.find(p => p.id === currentPageId)?.content.sections.map((s: any) => `${s.id} (order: ${s.order})`));
      return [...newPages];
    });

    // Save to database
    const updatedContent = { ...currentPage.content, sections: reorderedSections };
    console.log('💾 SAVING TO DATABASE:', updatedContent.sections.map((s: any) => `${s.id} (order: ${s.order})`));
    supabase
      .from('pages')
      .update({ content: updatedContent })
      .eq('id', currentPageId)
      .then(() => {
        console.log('✅ Section order saved to database');
      });
  }, [currentPage, currentPageId]);

  const saveChanges = async () => {
    if (!agent) return;
    
    setSaving(true);
    try {
      console.log('💾 Saving changes...');

      // If we have a current page with sections system, already saved via handleUpdateSection
      if (currentPageId && pages.length > 0) {
        const currentPage = pages.find(p => p.id === currentPageId);
        
        // Ana sayfa (is_home) için hem agents hem pages kaydet
        if (currentPage?.is_home) {
          console.log('💾 Saving home page - Agent state:', agent);
          
          // For home page, agent state is already updated via onUpdateAgent callbacks
          // Just save custom sections to pages table
          if (currentPage.content?.sections) {
            await supabase
              .from('pages')
              .update({ 
                content: { 
                  sections: currentPage.content.sections 
                } 
              })
              .eq('id', currentPageId);
          }
          
          alert('✅ Ana sayfa kaydedildi!');
          setSaving(false);
          return;
        }
        
        // Custom page - sections already auto-saved via handleUpdateSection
        if (currentPage && currentPage.content?.sections) {
          alert('✅ Değişiklikler otomatik kaydedildi!');
          setSaving(false);
          return;
        }
      }
      
      alert('⚠️ Kaydedilecek değişiklik bulunamadı!');
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
      {/* Left Sidebar - Only show if pages system is working */}
      {pages.length > 0 && (
        <BuilderSidebar
          pages={pages}
          currentPageId={currentPageId}
          onPageSelect={setCurrentPageId}
          onNewPage={handleNewPage}
          onDeletePage={handleDeletePage}
          onToggleVisibility={handleToggleVisibility}
          themeColor={agent.theme_color || '#111827'}
          onThemeColorChange={handleThemeColorChange}
          sectionVisibility={{
            show_stats: (agent as any).show_stats ?? true,
            show_features: (agent as any).show_features ?? true,
            show_properties: (agent as any).show_properties ?? true,
            show_cta: (agent as any).show_cta ?? true,
          }}
          onSectionVisibilityChange={handleSectionVisibilityChange}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Components Panel - Show in edit mode */}
        <div className="flex flex-1 h-full min-h-0">
          {mode === 'edit' && currentPageId && pages.length > 0 && (() => {
            const currentPage = pages.find(p => p.id === currentPageId);
            // Show components panel for ALL pages (including home)
            const showComponentsPanel = !!currentPage;
            return showComponentsPanel ? <ComponentsPanel onAddComponent={handleAddSection} /> : null;
          })()}
          
          {/* Canvas Area + Properties Panel Wrapper */}
          <div className="flex-1 flex min-h-0">
            {/* Canvas Area */}
            <div className="flex-1 flex flex-col min-h-0">
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
            
            <div className="text-sm font-semibold text-white">
              {pages.length > 0 && currentPageId ? (
                <>
                  Sayfa: {pages.find(p => p.id === currentPageId)?.title || 'Sayfa Düzenleyici'}
                </>
              ) : (
                'Sayfa Düzenleyici'
              )}
            </div>
          
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
        <div className="flex-1 overflow-y-auto bg-gray-100 min-h-0">
          {agent && currentPageId && pages.length > 0 && currentPage && (() => {
            const isEmptyPage = !currentPage.content || !currentPage.content.sections || currentPage.content.sections.length === 0;
            
            // Ana sayfa - agent data + sections render
            if (currentPage?.is_home) {
              return (
                <ClientLandingPage 
                  agent={agent} 
                  currentPage={currentPage}
                  onUpdateSection={handleUpdateSection}
                  onDeleteSection={handleDeleteSection}
                  onSectionClick={setSelectedSection}
                  onReorderSections={handleReorderSections}
                  editMode={mode === 'edit'}
                  onUpdateAgent={async (updates: any) => {
                    // Update agent immediately for preview
                    setAgent({ ...agent, ...updates });
                    
                    // Save to database
                    const { error } = await supabase
                      .from('agents')
                      .update(updates)
                      .eq('id', agent.id);
                    
                    if (error) {
                      console.error('Failed to update agent:', error);
                    }
                  }}
                />
              );
            }
            
            // SECTIONS SYSTEM - UNDER MAINTENANCE
            return (
              <>
                <ClientLandingPage 
                  agent={agent} 
                  currentPage={currentPage}
                  onUpdateSection={handleUpdateSection}
                  onDeleteSection={handleDeleteSection}
                  onSectionClick={(section) => mode === 'edit' && setSelectedSection(section)}
                  onReorderSections={handleReorderSections}
                  editMode={mode === 'edit'}
                />
                {mode === 'edit' && (
                  <div className="p-8 bg-gradient-to-r from-orange-50 to-orange-100 border-t-4 border-orange-500">
                    <div className="max-w-4xl mx-auto text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Bölümler Sistemi Geçici Olarak Bakımda</h3>
                      <p className="text-gray-700 mb-4">Sayfa bölümlerini ekleme, silme ve sıralama özellikleri şu anda bakımdadır. En kısa sürede aktif hale getirilecektir.</p>
                      <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm">
                        <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Lütfen daha sonra tekrar kontrol ediniz</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
            </div>
            
            {/* Properties Panel - DISABLED IN MAINTENANCE MODE */}
            {mode === 'edit' && false && (() => {
              const currentPage = pages.find(p => p.id === currentPageId);
              
              // Show PropertiesPanel when section selected
              if (selectedSection) {
                return (
                  <PropertiesPanel
                    selectedSection={selectedSection}
                    onUpdate={(data: any) => {
                      if (selectedSection) {
                        handleUpdateSection(selectedSection.id, data);
                        setSelectedSection({ ...selectedSection, data });
                      }
                    }}
                    onClose={() => setSelectedSection(null)}
                  />
                );
              }
              
              return null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
