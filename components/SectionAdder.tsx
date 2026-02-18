'use client';

import { useState } from 'react';
import { Plus, Type, Layout, Grid, Image, Mail, Megaphone } from 'lucide-react';
import { SectionType, SECTION_TEMPLATES } from '@/types/sections';

interface SectionAdderProps {
  onAddSection: (type: SectionType) => void;
}

const SECTION_OPTIONS = [
  { type: 'hero' as SectionType, label: 'Hero Bölümü', icon: Layout, desc: 'Ana başlık ve CTA' },
  { type: 'text' as SectionType, label: 'Metin', icon: Type, desc: 'Paragraf ve başlık' },
  { type: 'features' as SectionType, label: 'Özellikler', icon: Grid, desc: 'Özellik kartları' },
  { type: 'properties' as SectionType, label: 'İlanlar', icon: Grid, desc: 'Portföy listesi' },
  { type: 'gallery' as SectionType, label: 'Galeri', icon: Image, desc: 'Fotoğraf galerisi' },
  { type: 'contact' as SectionType, label: 'İletişim', icon: Mail, desc: 'İletişim formu' },
  { type: 'cta' as SectionType, label: 'CTA', icon: Megaphone, desc: 'Harekete geçirici' }
];

export default function SectionAdder({ onAddSection }: SectionAdderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (type: SectionType) => {
    onAddSection(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-8 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition group"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Bölüm Ekle</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Bölüm Seç</h3>
              <p className="text-xs text-gray-600 mt-1">Sayfanıza eklemek istediğiniz bölümü seçin</p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-2">
              {SECTION_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleAdd(option.type)}
                    className="p-3 text-left hover:bg-blue-50 rounded-lg transition group border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded group-hover:bg-blue-100 transition">
                        <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
