'use client';

import { Layout, Type, Grid, Image, Mail, Megaphone, Home, Star, FileText, GripVertical, MessageSquare, BarChart3, HelpCircle, Video, Users } from 'lucide-react';
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
  },
  {
    type: 'testimonials' as SectionType,
    icon: MessageSquare,
    label: 'Müşteri Yorumları',
    description: 'Müşteri referansları gösterin',
    details: 'İsim, rol, yorum ve puanlama',
    category: 'Sosyal Kanıt'
  },
  {
    type: 'stats' as SectionType,
    icon: BarChart3,
    label: 'İstatistikler',
    description: 'Rakamlarla başarınızı gösterin',
    details: 'Değer ve etiket çiftleri',
    category: 'Sosyal Kanıt'
  },
  {
    type: 'faq' as SectionType,
    icon: HelpCircle,
    label: 'Sık Sorulan Sorular',
    description: 'Soru ve cevaplar ekleyin',
    details: 'Accordion tarzı S.S.S. bölümü',
    category: 'Bilgi'
  },
  {
    type: 'video' as SectionType,
    icon: Video,
    label: 'Video',
    description: 'YouTube veya Vimeo videosu',
    details: 'Video URL ve başlık eklenebilir',
    category: 'Medya'
  },
  {
    type: 'team' as SectionType,
    icon: Users,
    label: 'Ekip',
    description: 'Ekip üyelerinizi tanıtın',
    details: 'İsim, rol, fotoğraf ve bio',
    category: 'Bilgi'
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
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold text-sm flex items-center gap-2">
          <Grid className="w-4 h-4" />
          Bölümler
        </h2>
        <p className="text-gray-400 text-xs mt-1">Tıklayarak ekleyin</p>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedComponents).map(([category, components]) => (
          <div key={category} className="mb-1">
            {/* Category Header */}
            <div className="px-3 py-2 bg-gray-800/50">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {category}
              </h3>
            </div>
            
            {/* Category Components */}
            <div className="p-2 space-y-1">
              {components.map((component) => {
                const Icon = component.icon;
                return (
                  <button
                    key={component.type}
                    onClick={() => onAddComponent(component.type)}
                    className={`
                      w-full group cursor-pointer hover:bg-gray-800 border border-gray-700 hover:border-blue-500 
                      rounded-md p-2.5 transition-all duration-150 text-left
                      ${draggedType === component.type ? 'opacity-50 scale-95' : ''}
                    `}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <div className="flex-shrink-0 p-1.5 bg-gray-800 group-hover:bg-blue-600 rounded">
                        <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-white group-hover:text-blue-400">
                          {component.label}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                          {component.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50">
        <div className="text-xs text-gray-400 space-y-1.5">
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
            <span>Tıklayarak ekleyin</span>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
            <span>Bölüme tıklayarak düzenleyin</span>
          </p>
        </div>
      </div>
    </div>
  );
}
