'use client';

import { Section } from '@/types/sections';
import HeroSection from './sections/HeroSection';
import TextSection from './sections/TextSection';
import FeaturesSection from './sections/FeaturesSection';
import CTASection from './sections/CTASection';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  sections: Section[];
  onUpdateSection: (id: string, data: any) => void;
  onDeleteSection?: (id: string) => void;
  onSectionClick?: (section: Section) => void;
  onReorderSections?: (sections: Section[]) => void;
  editMode?: boolean;
}

export default function SectionRenderer({ sections, onUpdateSection, onDeleteSection, onSectionClick, onReorderSections, editMode = false }: Props) {
  const moveSection = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || !onReorderSections) return;

    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const newSections = [...sortedSections];
    const [removed] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, removed);

    // Update order values
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));

    onReorderSections(reorderedSections);
  };

  const renderSection = (section: Section) => {
    const onUpdate = (data: any) => onUpdateSection(section.id, data);

    switch (section.type) {
      case 'hero':
        return <HeroSection section={section} onUpdate={onUpdate} editMode={editMode} />;
      case 'text':
        return <TextSection section={section} onUpdate={onUpdate} editMode={editMode} />;
      case 'features':
        return <FeaturesSection section={section} onUpdate={onUpdate} editMode={editMode} />;
      case 'cta':
        return <CTASection section={section} onUpdate={onUpdate} editMode={editMode} />;
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

  const sortedSections = (sections || []).sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedSections.map((section, index) => (
        <div 
          key={section.id}
          className="relative group hover:ring-2 hover:ring-blue-400 transition-all"
          onDoubleClick={() => editMode && onSectionClick && onSectionClick(section)}
        >
          {/* Control Buttons */}
          {editMode && (
            <div className="absolute top-2 right-2 z-50 flex gap-2">
              {/* Move Up Button */}
              {onReorderSections && index > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(index, index - 1);
                  }}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg"
                  title="Yukarı Taşı"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
              
              {/* Move Down Button */}
              {onReorderSections && index < sortedSections.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(index, index + 1);
                  }}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg"
                  title="Aşağı Taşı"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
              
              {/* Delete Button */}
              {onDeleteSection && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.id);
                  }}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-lg"
                  title="Bölümü Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          {renderSection(section)}
        </div>
      ))}
    </>
  );
}
