'use client';

import { Section } from '@/types/sections';
import HeroSection from './sections/HeroSection';
import TextSection from './sections/TextSection';
import FeaturesSection from './sections/FeaturesSection';
import CTASection from './sections/CTASection';
import { Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';

interface Props {
  sections: Section[];
  onUpdateSection: (id: string, data: any) => void;
  onDeleteSection?: (id: string) => void;
  onSectionClick?: (section: Section) => void;
  onReorderSections?: (sections: Section[]) => void;
  editMode?: boolean;
}

export default function SectionRenderer({ sections, onUpdateSection, onDeleteSection, onSectionClick, onReorderSections, editMode = false }: Props) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex || !onReorderSections) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    const newSections = [...sortedSections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, removed);

    // Update order values
    const reorderedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));

    onReorderSections(reorderedSections);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
          draggable={editMode && !!onReorderSections}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative group transition-all ${
            editMode && onSectionClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
          } ${
            draggedIndex === index ? 'opacity-50 scale-95' : ''
          } ${
            dragOverIndex === index && draggedIndex !== index ? 'border-t-4 border-blue-500' : ''
          }`}
          onClick={() => editMode && onSectionClick && onSectionClick(section)}
        >
          {/* Drag Handle & Delete Button */}
          {editMode && (
            <div className="absolute top-2 left-2 right-2 z-50 flex justify-between opacity-100 transition">
              {/* Drag Handle */}
              {onReorderSections && (
                <div 
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg cursor-grab active:cursor-grabbing"
                  title="Sürükle & Taşı"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <GripVertical className="w-4 h-4" />
                </div>
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
