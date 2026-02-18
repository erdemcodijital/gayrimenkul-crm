'use client';

import { useState } from 'react';
import { Plus, Home, FileText, Settings, Eye, EyeOff, Trash2 } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  is_home: boolean;
  visible: boolean;
  order_index: number;
}

interface BuilderSidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onPageSelect: (pageId: string) => void;
  onNewPage: () => void;
  onDeletePage: (pageId: string) => void;
  onToggleVisibility: (pageId: string, visible: boolean) => void;
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  sectionVisibility: {
    show_stats: boolean;
    show_features: boolean;
    show_properties: boolean;
    show_cta: boolean;
  };
  onSectionVisibilityChange: (section: string, visible: boolean) => void;
}

export default function BuilderSidebar({
  pages,
  currentPageId,
  onPageSelect,
  onNewPage,
  onDeletePage,
  onToggleVisibility,
  themeColor,
  onThemeColorChange,
  sectionVisibility,
  onSectionVisibilityChange,
}: BuilderSidebarProps) {
  const [activeTab, setActiveTab] = useState<'pages' | 'settings'>('pages');

  return (
    <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Site Düzenleyici</h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'pages'
              ? 'bg-gray-800 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Sayfalar
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition ${
            activeTab === 'settings'
              ? 'bg-gray-800 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Ayarlar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'pages' ? (
          <div className="p-2">
            {/* Pages List */}
            <div className="space-y-1">
              {pages
                .sort((a, b) => a.order_index - b.order_index)
                .map((page) => (
                  <div
                    key={page.id}
                    className={`group relative flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition ${
                      currentPageId === page.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                    onClick={() => onPageSelect(page.id)}
                  >
                    {page.is_home ? (
                      <Home className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <span className="flex-1 text-sm truncate">{page.title}</span>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(page.id, !page.visible);
                        }}
                        className="p-1 hover:bg-gray-700 rounded"
                        title={page.visible ? 'Gizle' : 'Göster'}
                      >
                        {page.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </button>
                      {!page.is_home && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
                              onDeletePage(page.id);
                            }
                          }}
                          className="p-1 hover:bg-red-600 rounded"
                          title="Sil"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* New Page Button */}
            <button
              onClick={onNewPage}
              className="w-full mt-3 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center justify-center gap-2 text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Yeni Sayfa Ekle
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Theme Color */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tema Rengi
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={themeColor}
                  onChange={(e) => onThemeColorChange(e.target.value)}
                  className="w-12 h-10 rounded border border-gray-600 cursor-pointer bg-gray-800"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Butonlar ve vurgular</p>
                  <p className="text-xs text-gray-500 mt-1">{themeColor}</p>
                </div>
              </div>
            </div>

            {/* Section Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bölümleri Göster/Gizle
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-750 cursor-pointer">
                  <span className="text-sm text-gray-300">İstatistikler</span>
                  <input
                    type="checkbox"
                    checked={sectionVisibility.show_stats}
                    onChange={(e) => onSectionVisibilityChange('show_stats', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-750 cursor-pointer">
                  <span className="text-sm text-gray-300">Özellikler</span>
                  <input
                    type="checkbox"
                    checked={sectionVisibility.show_features}
                    onChange={(e) => onSectionVisibilityChange('show_features', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-750 cursor-pointer">
                  <span className="text-sm text-gray-300">İlanlar</span>
                  <input
                    type="checkbox"
                    checked={sectionVisibility.show_properties}
                    onChange={(e) => onSectionVisibilityChange('show_properties', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600"
                  />
                </label>
                <label className="flex items-center justify-between p-2 bg-gray-800 rounded hover:bg-gray-750 cursor-pointer">
                  <span className="text-sm text-gray-300">CTA Bölümü</span>
                  <input
                    type="checkbox"
                    checked={sectionVisibility.show_cta}
                    onChange={(e) => onSectionVisibilityChange('show_cta', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600"
                  />
                </label>
              </div>
            </div>

            {/* Info */}
            <div className="bg-gray-800 rounded p-3">
              <h4 className="text-sm font-semibold mb-2">Bilgi</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Sol panelden sayfalarınızı yönetin. Yeni sayfa ekleyin, 
                düzenleyin veya silin. Değişiklikleri kaydetmeyi unutmayın.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
