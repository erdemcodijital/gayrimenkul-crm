'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  agent: any;
  onUpdate: (updates: any) => void;
  onChange?: (updates: any) => void; // Live preview
  onClose: () => void;
}

export default function HomePageEditor({ agent, onUpdate, onChange, onClose }: Props) {
  const [heroTitle, setHeroTitle] = useState(agent.hero_title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(agent.hero_subtitle || '');
  const [ctaTitle, setCTATitle] = useState((agent as any).cta_title || '');
  const [ctaDescription, setCTADescription] = useState((agent as any).cta_description || '');
  const [featuresTitle, setFeaturesTitle] = useState((agent as any).features_title || 'Neden Benimle Çalışmalısınız?');
  const [featuresList, setFeaturesList] = useState((agent as any).features_list || []);

  // Live preview - debounced update (500ms delay)
  useEffect(() => {
    if (!onChange) return;
    
    const timeoutId = setTimeout(() => {
      onChange({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        cta_title: ctaTitle,
        cta_description: ctaDescription,
        features_title: featuresTitle,
        features_list: featuresList,
      });
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [heroTitle, heroSubtitle, ctaTitle, ctaDescription, featuresTitle, featuresList, onChange]);

  const handleSave = () => {
    onUpdate({
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      cta_title: ctaTitle,
      cta_description: ctaDescription,
      features_title: featuresTitle,
      features_list: featuresList,
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <h3 className="font-semibold text-gray-900">Ana Sayfa Düzenle</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div>
          <h4 className="font-semibold text-sm text-gray-900 mb-3">Hero Bölümü</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hayalinizdeki Evi Bulun"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Başlık
              </label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Profesyonel gayrimenkul danışmanlığı"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div>
          <h4 className="font-semibold text-sm text-gray-900 mb-3">Özellikler Bölümü</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık
              </label>
              <input
                type="text"
                value={featuresTitle}
                onChange={(e) => setFeaturesTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Neden Benimle Çalışmalısınız?"
              />
            </div>
            {featuresList.map((feature: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <input
                  type="text"
                  value={feature.title || ''}
                  onChange={(e) => {
                    const newList = [...featuresList];
                    newList[index] = { ...feature, title: e.target.value };
                    setFeaturesList(newList);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded mb-2 text-sm"
                  placeholder="Başlık"
                />
                <input
                  type="text"
                  value={feature.description || ''}
                  onChange={(e) => {
                    const newList = [...featuresList];
                    newList[index] = { ...feature, description: e.target.value };
                    setFeaturesList(newList);
                  }}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Açıklama"
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div>
          <h4 className="font-semibold text-sm text-gray-900 mb-3">CTA Bölümü</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık
              </label>
              <input
                type="text"
                value={ctaTitle}
                onChange={(e) => setCTATitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hayalinizdeki Evi Birlikte Bulalım"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={ctaDescription}
                onChange={(e) => setCTADescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Size en uygun gayrimenkulleri bulmak için..."
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}
