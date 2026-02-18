'use client';

import { Layout, Type, Grid, Image, Mail, Megaphone, Home, Star, FileText } from 'lucide-react';
import { SectionType } from '@/types/sections';

interface ComponentsPanelProps {
  onAddComponent: (type: SectionType) => void;
}

const COMPONENTS = [
  {
    type: 'hero' as SectionType,
    icon: Layout,
    label: 'Hero Bölümü',
    description: 'Ana başlık, alt başlık ve CTA butonu',
    color: 'bg-blue-500',
    preview: '🎯'
  },
  {
    type: 'text' as SectionType,
    icon: FileText,
    label: 'Metin Bloğu',
    description: 'Paragraf ve başlık içeriği',
    color: 'bg-gray-500',
    preview: '📝'
  },
  {
    type: 'features' as SectionType,
    icon: Star,
    label: 'Özellikler',
    description: '3 veya 4 özellik kartı',
    color: 'bg-purple-500',
    preview: '⭐'
  },
  {
    type: 'properties' as SectionType,
    icon: Home,
    label: 'İlan Listesi',
    description: 'Portföy ilanları',
    color: 'bg-green-500',
    preview: '🏠'
  },
  {
    type: 'gallery' as SectionType,
    icon: Image,
    label: 'Fotoğraf Galerisi',
    description: 'Resim galerisi',
    color: 'bg-pink-500',
    preview: '📸'
  },
  {
    type: 'contact' as SectionType,
    icon: Mail,
    label: 'İletişim Formu',
    description: 'İletişim bilgileri ve form',
    color: 'bg-indigo-500',
    preview: '📧'
  },
  {
    type: 'cta' as SectionType,
    icon: Megaphone,
    label: 'Harekete Geçirici',
    description: 'Call-to-action bölümü',
    color: 'bg-orange-500',
    preview: '📢'
  }
];

export default function ComponentsPanel({ onAddComponent }: ComponentsPanelProps) {
  return (
    <div className="w-72 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold text-lg flex items-center gap-2">
          <Grid className="w-5 h-5" />
          Componentler
        </h2>
        <p className="text-gray-400 text-xs mt-1">Tıklayarak sayfanıza ekleyin</p>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {COMPONENTS.map((component) => {
          const Icon = component.icon;
          return (
            <button
              key={component.type}
              onClick={() => onAddComponent(component.type)}
              className="w-full group hover:bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg p-3 transition-all duration-200 text-left"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`${component.color} p-2 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{component.preview}</span>
                    <h3 className="text-white font-medium text-sm">{component.label}</h3>
                  </div>
                  <p className="text-gray-400 text-xs leading-tight">{component.description}</p>
                </div>
              </div>
              
              {/* Hover Effect */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="text-xs text-blue-400 flex items-center gap-1">
                  <span>+</span>
                  <span>Ekle</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Tips */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="text-xs text-gray-400 space-y-2">
          <p className="flex items-start gap-2">
            <span>💡</span>
            <span>Component'lere tıklayarak sayfanıza ekleyin</span>
          </p>
          <p className="flex items-start gap-2">
            <span>✏️</span>
            <span>"Düzenle" modunda içerikleri değiştirin</span>
          </p>
          <p className="flex items-start gap-2">
            <span>🗑️</span>
            <span>Silmek için component üzerine gelin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
