'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Eye, EyeOff, Settings, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Section {
  id: string;
  type: 'hero' | 'properties' | 'features' | 'cta' | 'custom';
  title: string;
  visible: boolean;
  config?: any;
}

interface Props {
  agent: any;
  onSave: () => void;
}

const AVAILABLE_SECTIONS = [
  { type: 'hero', title: 'Hero / Ana Bölüm', icon: '🎯' },
  { type: 'properties', title: 'İlanlar', icon: '🏠' },
  { type: 'features', title: 'Özellikler / Neden Ben', icon: '✨' },
  { type: 'cta', title: 'İletişim / CTA', icon: '📞' },
];

export default function LandingPageEditor({ agent, onSave }: Props) {
  const [sections, setSections] = useState<Section[]>([
    { id: 'hero', type: 'hero', title: 'Hero / Ana Bölüm', visible: true },
    { id: 'properties', type: 'properties', title: 'İlanlar', visible: agent?.show_properties !== false },
    { id: 'features', type: 'features', title: 'Özellikler', visible: agent?.show_features !== false },
    { id: 'cta', type: 'cta', title: 'İletişim', visible: agent?.show_cta !== false },
  ]);
  
  const [selectedSection, setSelectedSection] = useState<string | null>('hero');
  const [saving, setSaving] = useState(false);
  const [heroConfig, setHeroConfig] = useState({
    title: agent?.hero_title || agent?.name || '',
    subtitle: agent?.hero_subtitle || 'Gayrimenkul Danışmanı',
    description: agent?.about_text || 'Size en uygun gayrimenkul seçeneklerini bulmak için buradayım.',
  });
  const [showPreview, setShowPreview] = useState(true);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_HERO') {
        const { field, value } = event.data;
        if (field === 'title') {
          setHeroConfig({ ...heroConfig, title: value });
        } else if (field === 'subtitle') {
          setHeroConfig({ ...heroConfig, subtitle: value });
        } else if (field === 'description') {
          setHeroConfig({ ...heroConfig, description: value });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [heroConfig]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, visible: !s.visible } : s
    ));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          hero_title: heroConfig.title,
          hero_subtitle: heroConfig.subtitle,
          about_text: heroConfig.description,
          show_properties: sections.find(s => s.id === 'properties')?.visible,
          show_features: sections.find(s => s.id === 'features')?.visible,
          show_cta: sections.find(s => s.id === 'cta')?.visible,
          sections_order: sections.map(s => s.id),
        })
        .eq('id', agent.id);

      if (error) throw error;
      
      onSave();
      
      // Reload preview
      const previewFrame = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (previewFrame) {
        previewFrame.src = previewFrame.src;
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Kaydetme hatası!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Left Panel - Editor */}
      <div className="w-1/2 bg-white rounded-xl border-2 border-gray-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Visual Editor</h3>
            <p className="text-sm text-gray-600">Sürükle, düzenle, kaydet</p>
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sections">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white border-2 rounded-lg p-4 transition ${
                            snapshot.isDragging ? 'border-gray-900 shadow-2xl' : 'border-gray-200'
                          } ${selectedSection === section.id ? 'ring-2 ring-gray-900' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Drag Handle */}
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                            </div>

                            {/* Section Info */}
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => setSelectedSection(section.id)}
                            >
                              <h4 className="font-semibold text-gray-900">{section.title}</h4>
                              <p className="text-xs text-gray-500">{section.type}</p>
                            </div>

                            {/* Actions */}
                            <button
                              onClick={() => toggleSectionVisibility(section.id)}
                              className={`p-2 rounded-lg transition ${
                                section.visible ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => setSelectedSection(section.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                              <Settings className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          {/* Section Settings (when selected) */}
                          {selectedSection === section.id && section.type === 'hero' && (
                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Başlık</label>
                                <input
                                  type="text"
                                  value={heroConfig.title}
                                  onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Alt Başlık</label>
                                <input
                                  type="text"
                                  value={heroConfig.subtitle}
                                  onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea
                                  value={heroConfig.description}
                                  onChange={(e) => setHeroConfig({ ...heroConfig, description: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="w-1/2 bg-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden flex flex-col">
        {/* Preview Header */}
        <div className="px-6 py-4 border-b border-gray-300 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Canlı Önizleme</span>
          </div>
          <button
            onClick={() => window.open(`/d/${agent.domain}`, '_blank')}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Yeni Sekmede Aç
          </button>
        </div>

        {/* Preview iFrame */}
        <div className="flex-1 overflow-hidden bg-white">
          <iframe
            id="preview-iframe"
            src={`/d/${agent.domain}?edit=true`}
            className="w-full h-full border-0"
            title="Landing Page Preview"
          />
        </div>
      </div>
    </div>
  );
}
