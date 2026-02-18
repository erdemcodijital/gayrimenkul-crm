'use client';

import { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Type, Palette, Image as ImageIcon, Layout } from 'lucide-react';
import { Section } from '@/types/sections';

interface PropertiesPanelProps {
  selectedSection: Section | null;
  onUpdate: (data: any) => void;
  onClose: () => void;
}

export default function PropertiesPanel({ selectedSection, onUpdate, onClose }: PropertiesPanelProps) {
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    if (selectedSection) {
      setLocalData({ ...selectedSection.data });
    }
  }, [selectedSection]);

  if (!selectedSection || !localData) {
    return (
      <div className="w-80 bg-gray-900 border-l border-gray-700 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Layout className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-white font-semibold text-sm mb-2">Özellikler Paneli</h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
              Bir bölüme tıklayarak başlık, buton linki ve diğer özellikleri düzenleyin
            </p>
          </div>
          
          <div className="space-y-3 text-left max-w-xs mx-auto">
            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-white text-xs font-medium mb-1">Canvas'ta bölüme tıklayın</p>
                <p className="text-gray-500 text-xs">Hero, Text, Features gibi</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-white text-xs font-medium mb-1">Özellikleri düzenleyin</p>
                <p className="text-gray-500 text-xs">Burada tüm detaylar görünür</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    const updated = { ...localData, [key]: value };
    setLocalData(updated);
    onUpdate(updated);
  };

  const handleNestedChange = (parentKey: string, index: number, key: string, value: any) => {
    const updated = { ...localData };
    if (!updated[parentKey]) updated[parentKey] = [];
    updated[parentKey][index] = { ...updated[parentKey][index], [key]: value };
    setLocalData(updated);
    onUpdate(updated);
  };

  const getSectionTitle = (type: string) => {
    const titles: Record<string, string> = {
      hero: 'Ana Başlık',
      text: 'Metin Bloğu',
      features: 'Özellikler',
      cta: 'Harekete Geçirici',
      properties: 'İlan Listesi',
      gallery: 'Fotoğraf Galerisi',
      contact: 'İletişim Formu'
    };
    return titles[type] || type;
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Bölüm Özellikleri</h3>
          <p className="text-xs text-gray-500 mt-0.5">{getSectionTitle(selectedSection.type)}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition"
          title="Kapat"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Properties Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* HERO SECTION PROPERTIES */}
        {selectedSection.type === 'hero' && (
          <>
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                Başlık
              </label>
              <input
                type="text"
                value={localData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ana başlık metni"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                Alt Başlık
              </label>
              <textarea
                value={localData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Alt başlık metni"
              />
            </div>

            {/* Button */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" />
                Eylem Butonu
              </h4>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Buton Metni</label>
                  <input
                    type="text"
                    value={localData.buttonText || ''}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Örn: Hemen İletişime Geçin"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Buton Linki</label>
                  <input
                    type="text"
                    value={localData.buttonLink || ''}
                    onChange={(e) => handleChange('buttonLink', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="https://wa.me/... veya #iletisim"
                  />
                  <p className="text-xs text-gray-400 mt-1">WhatsApp linki veya sayfa içi anchor</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {localData.stats && Array.isArray(localData.stats) && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">İstatistikler</h4>
                {localData.stats.map((stat: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={stat.value || ''}
                        onChange={(e) => handleNestedChange('stats', index, 'value', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="Değer (örn: 200+)"
                      />
                      <input
                        type="text"
                        value={stat.label || ''}
                        onChange={(e) => handleNestedChange('stats', index, 'label', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="Etiket (örn: Mutlu Müşteri)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TEXT SECTION PROPERTIES */}
        {selectedSection.type === 'text' && (
          <>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                Başlık
              </label>
              <input
                type="text"
                value={localData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                İçerik
              </label>
              <textarea
                value={localData.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* FEATURES SECTION PROPERTIES */}
        {selectedSection.type === 'features' && (
          <>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                Başlık
              </label>
              <input
                type="text"
                value={localData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                Alt Başlık
              </label>
              <input
                type="text"
                value={localData.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Features List */}
            {localData.features && Array.isArray(localData.features) && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Özellikler</h4>
                {localData.features.map((feature: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0">
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={feature.title || ''}
                        onChange={(e) => handleNestedChange('features', index, 'title', e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm font-medium"
                        placeholder="Özellik başlığı"
                      />
                      <textarea
                        value={feature.description || ''}
                        onChange={(e) => handleNestedChange('features', index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        placeholder="Özellik açıklaması"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA SECTION PROPERTIES */}
        {selectedSection.type === 'cta' && (
          <>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                Başlık
              </label>
              <input
                type="text"
                value={localData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                <Type className="w-3.5 h-3.5" />
                Açıklama
              </label>
              <textarea
                value={localData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Button */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" />
                Eylem Butonu
              </h4>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Buton Metni</label>
                  <input
                    type="text"
                    value={localData.buttonText || ''}
                    onChange={(e) => handleChange('buttonText', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Buton Linki</label>
                  <input
                    type="text"
                    value={localData.buttonLink || ''}
                    onChange={(e) => handleChange('buttonLink', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="https://wa.me/..."
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
