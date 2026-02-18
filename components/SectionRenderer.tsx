'use client';

import { Section } from '@/types/sections';
import HeroSection from './sections/HeroSection';
import TextSection from './sections/TextSection';
import FeaturesSection from './sections/FeaturesSection';
import CTASection from './sections/CTASection';
import { Trash2, GripVertical } from 'lucide-react';
import { useEditor } from '@/contexts/EditorContext';

interface Props {
  sections: Section[];
  onUpdateSection: (id: string, data: any) => void;
  onDeleteSection?: (id: string) => void;
}

export default function SectionRenderer({ sections, onUpdateSection, onDeleteSection }: Props) {
  const editorContext = useEditor();
  const editMode = editorContext?.editMode || false;

  const renderSection = (section: Section) => {
    const onUpdate = (data: any) => onUpdateSection(section.id, data);

    switch (section.type) {
      case 'hero':
        return <HeroSection section={section} onUpdate={onUpdate} />;
      case 'text':
        return <TextSection section={section} onUpdate={onUpdate} />;
      case 'features':
        return <FeaturesSection section={section} onUpdate={onUpdate} />;
      case 'cta':
        return <CTASection section={section} onUpdate={onUpdate} />;
      case 'properties':
        return <div className="py-16 bg-white"><div className="max-w-6xl mx-auto px-4"><h2 className="text-3xl font-bold">İlanlar (Gelecek)</h2></div></div>;
      case 'gallery':
        return <div className="py-16 bg-gray-50"><div className="max-w-6xl mx-auto px-4"><h2 className="text-3xl font-bold">Galeri (Gelecek)</h2></div></div>;
      case 'contact':
        return <div className="py-16 bg-white"><div className="max-w-6xl mx-auto px-4"><h2 className="text-3xl font-bold">İletişim (Gelecek)</h2></div></div>;
      default:
        return null;
    }
  };

  return (
    <>
      {sections.sort((a, b) => a.order - b.order).map((section) => (
        <div key={section.id} className="relative group">
          {editMode && onDeleteSection && (
            <div className="absolute top-2 right-2 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => onDeleteSection(section.id)}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-lg"
                title="Bölümü Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          {renderSection(section)}
        </div>
      ))}
    </>
  );
}
