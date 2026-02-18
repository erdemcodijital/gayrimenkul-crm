'use client';

import { Layout, Type, Grid, Image, Mail, Megaphone, Home, Star, FileText, GripVertical } from 'lucide-react';
import { SectionType } from '@/types/sections';
import { useState } from 'react';

interface ComponentsPanelProps {
  onAddComponent: (type: SectionType) => void;
}

const COMPONENTS = [
  {
    type: 'hero' as SectionType,
    icon: Layout,
    label: 'Ana Başlık',
    description: 'Büyük başlık, alt başlık ve eylem butonu',
    details: 'İstatistikler, buton linki eklenebilir',
    category: 'Başlık'
  },
  {
    type: 'text' as SectionType,
    icon: FileText,
    label: 'Metin Bloğu',
    description: 'Düz metin içeriği ve paragraflar',
    details: 'Başlık ve açıklama metni eklenebilir',
    category: 'İçerik'
  },
  {
    type: 'features' as SectionType,
    icon: Star,
    label: 'Özellikler',
    description: 'Hizmetlerinizi veya özelliklerinizi gösterin',
    details: 'Başlık, açıklama ve özellik kartları',
    category: 'İçerik'
  },
  {
    type: 'properties' as SectionType,
    icon: Home,
    label: 'İlan Listesi',
    description: 'Portföyünüzdeki ilanları gösterin',
    details: 'Otomatik olarak ilanlarınızı listeler',
    category: 'Dinamik'
  },
  {
    type: 'gallery' as SectionType,
    icon: Image,
    label: 'Fotoğraf Galerisi',
    description: 'Görselleri grid düzeninde gösterin',
    details: 'Büyütme özelliği ile fotoğraf galerisi',
    category: 'Medya'
  },
  {
    type: 'contact' as SectionType,
    icon: Mail,
    label: 'İletişim Formu',
    description: 'İletişim bilgileriniz ve form',
    details: 'E-posta, telefon, adres ve mesaj formu',
    category: 'Formlar'
  },
  {
    type: 'cta' as SectionType,
    icon: Megaphone,
    label: 'Harekete Geçirici',
    description: 'Ziyaretçileri yönlendirin',
    details: 'Başlık, açıklama ve eylem butonu',
    category: 'Pazarlama'
  }
];

export default function ComponentsPanel({ onAddComponent }: ComponentsPanelProps) {
  const [draggedType, setDraggedType] = useState<SectionType | null>(null);

  const handleDragStart = (type: SectionType) => {
    setDraggedType(type);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
  };

  // Group components by category
  const groupedComponents = COMPONENTS.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, typeof COMPONENTS>);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-gray-900 font-semibold text-base flex items-center gap-2">
          <Grid className="w-4 h-4 text-gray-600" />
          Bölümler
        </h2>
        <p className="text-gray-500 text-xs mt-1">Sayfanıza eklemek için tıklayın</p>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div key={category} className="mb-1">
            {/* Category Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {category}
              </h3>
            </div>
            
            {/* Category Components */}
            <div className="p-2 space-y-1">
              {components.map((component) => {
                const Icon = component.icon;
                return (
                  <div
                    key={component.type}
                    draggable
                    onDragStart={() => handleDragStart(component.type)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onAddComponent(component.type)}
                    className={`
                      group cursor-move hover:bg-blue-50 border border-gray-200 hover:border-blue-300 
                      rounded-md p-3 transition-all duration-150
                      ${draggedType === component.type ? 'opacity-50 scale-95' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Drag Handle */}
                      <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      
                      {/* Icon */}
                      <div className="flex-shrink-0 p-1.5 bg-gray-100 group-hover:bg-blue-100 rounded">
                        <Icon className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                          {component.label}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                          {component.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 leading-tight italic">
                          {component.details}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1.5">
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            <span><strong>Tıklayın</strong> - Hemen ekleyin</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            <span><strong>Düzenleyin</strong> - Metinlere tıklayarak</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            <span><strong>Silin</strong> - Üzerine gelip çöp kutusu ikonu</span>
          </p>
        </div>
      </div>
    </div>
  );
}
