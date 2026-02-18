'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { 
  Save, Eye, Plus, GripVertical, Settings, Trash2, 
  Type, Image as ImageIcon, Layout, Home, Check, Phone, X 
} from 'lucide-react';

type Agent = Database['public']['Tables']['agents']['Row'];
type Section = Database['public']['Tables']['page_sections']['Row'];

// Available block types
const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero', icon: Layout, color: 'bg-blue-500' },
  { type: 'text', label: 'Text', icon: Type, color: 'bg-green-500' },
  { type: 'features', label: 'Features', icon: Check, color: 'bg-purple-500' },
  { type: 'properties', label: 'Properties', icon: Home, color: 'bg-orange-500' },
  { type: 'contact', label: 'Contact', icon: Phone, color: 'bg-red-500' },
  { type: 'image', label: 'Image', icon: ImageIcon, color: 'bg-pink-500' },
];

export default function VisualBuilder() {
  const params = useParams();
  const router = useRouter();
  const domain = params.domain as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadData();
  }, [domain]);

  const loadData = async () => {
    // Load agent
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('domain', domain)
      .single();

    if (agentData) {
      setAgent(agentData);

      // Load sections
      const { data: sectionsData } = await supabase
        .from('page_sections')
        .select('*')
        .eq('agent_id', agentData.id)
        .order('section_order');

      setSections(sectionsData || []);
    }

    setLoading(false);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update section_order
    const updatedSections = items.map((item, index) => ({
      ...item,
      section_order: index,
    }));

    setSections(updatedSections);
  };

  const addSection = (type: string) => {
    const newSection: Partial<Section> = {
      id: `temp-${Date.now()}`,
      agent_id: agent?.id || null,
      section_type: type,
      section_order: sections.length,
      is_visible: true,
      props: getDefaultProps(type),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setSections([...sections, newSection as Section]);
    setSelectedSection(newSection as Section);
  };

  const getDefaultProps = (type: string) => {
    switch (type) {
      case 'hero':
        return { title: 'Başlık', subtitle: 'Alt Başlık', description: 'Açıklama' };
      case 'text':
        return { content: 'Metin içeriği buraya...' };
      case 'features':
        return { title: 'Özellikler', items: ['Özellik 1', 'Özellik 2', 'Özellik 3'] };
      case 'properties':
        return { title: 'İlanlar', show_filter: true };
      case 'contact':
        return { title: 'İletişim', show_form: true };
      case 'image':
        return { url: '', alt: '' };
      default:
        return {};
    }
  };

  const updateSectionProps = (sectionId: string, newProps: any) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, props: newProps } : s
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
    if (selectedSection?.id === sectionId) {
      setSelectedSection(null);
    }
  };

  const handleSave = async () => {
    if (!agent) return;

    setSaving(true);
    try {
      // Delete existing sections
      await supabase
        .from('page_sections')
        .delete()
        .eq('agent_id', agent.id);

      // Insert new sections
      const sectionsToInsert = sections.map(({ id, ...section }) => ({
        ...section,
        agent_id: agent.id,
      }));

      await supabase
        .from('page_sections')
        .insert(sectionsToInsert);

      alert('✅ Kaydedildi!');
    } catch (error) {
      alert('❌ Hata oluştu!');
      console.error(error);
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/d/${domain}/dashboard`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-sm font-semibold text-gray-700">Visual Builder</div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                mode === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open(`/d/${domain}`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Eye className="w-4 h-4" />
            View Live
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Blocks */}
        {mode === 'edit' && (
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Add Blocks</h3>
            <div className="space-y-2">
              {BLOCK_TYPES.map((block) => {
                const Icon = block.icon;
                return (
                  <button
                    key={block.type}
                    onClick={() => addSection(block.type)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group"
                  >
                    <div className={`w-8 h-8 rounded ${block.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                      {block.label}
                    </span>
                    <Plus className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-600" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Center Panel - Canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
          <div className="max-w-5xl mx-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`bg-white rounded-lg shadow-sm border-2 transition ${
                              selectedSection?.id === section.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200'
                            } ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                            onClick={() => setSelectedSection(section)}
                          >
                            {mode === 'edit' && (
                              <div className="flex items-center gap-2 p-2 border-b border-gray-100 bg-gray-50">
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-xs font-medium text-gray-600 capitalize">
                                  {section.section_type}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSection(section.id);
                                  }}
                                  className="ml-auto text-red-500 hover:bg-red-50 p-1 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            <div className="p-6">
                              <SectionRenderer section={section} mode={mode} onUpdate={updateSectionProps} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {sections.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No sections yet. Add blocks from the left panel.</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Right Panel - Properties */}
        {mode === 'edit' && selectedSection && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-900">Properties</h3>
            </div>
            
            <PropertiesPanel 
              section={selectedSection}
              onUpdate={(newProps) => updateSectionProps(selectedSection.id, newProps)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Section Renderer Component
function SectionRenderer({ section, mode, onUpdate }: any) {
  const props = section.props as any;

  switch (section.section_type) {
    case 'hero':
      return (
        <div className="text-center">
          <h1 
            className="text-4xl font-bold mb-4"
            contentEditable={mode === 'edit'}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(section.id, { ...props, title: e.currentTarget.textContent })}
          >
            {props.title || 'Title'}
          </h1>
          <p 
            className="text-xl text-gray-600 mb-4"
            contentEditable={mode === 'edit'}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(section.id, { ...props, subtitle: e.currentTarget.textContent })}
          >
            {props.subtitle || 'Subtitle'}
          </p>
          <p 
            className="text-gray-500"
            contentEditable={mode === 'edit'}
            suppressContentEditableWarning
            onBlur={(e) => onUpdate(section.id, { ...props, description: e.currentTarget.textContent })}
          >
            {props.description || 'Description'}
          </p>
        </div>
      );
    
    case 'text':
      return (
        <div 
          className="prose max-w-none"
          contentEditable={mode === 'edit'}
          suppressContentEditableWarning
          onBlur={(e) => onUpdate(section.id, { content: e.currentTarget.textContent })}
        >
          {props.content || 'Text content'}
        </div>
      );
    
    case 'features':
      return (
        <div>
          <h2 className="text-2xl font-bold mb-4">{props.title}</h2>
          <div className="grid grid-cols-3 gap-4">
            {props.items?.map((item: string, i: number) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                {item}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="text-gray-400">Section type: {section.section_type}</div>;
  }
}

// Properties Panel Component
function PropertiesPanel({ section, onUpdate }: any) {
  const props = section.props as any;

  switch (section.section_type) {
    case 'hero':
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={props.title || ''}
              onChange={(e) => onUpdate({ ...props, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={props.subtitle || ''}
              onChange={(e) => onUpdate({ ...props, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={props.description || ''}
              onChange={(e) => onUpdate({ ...props, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
          </div>
        </div>
      );

    default:
      return <div className="text-sm text-gray-500">No properties available</div>;
  }
}
