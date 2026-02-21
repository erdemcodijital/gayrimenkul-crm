'use client';

import { useEffect, useState } from 'react';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import EditableSectionWrapper from '@/components/EditableSectionWrapper';
import { useEditor } from '@/contexts/EditorContext';
import SectionRenderer from '@/components/SectionRenderer';
import { Section } from '@/types/sections';

type Agent = Database['public']['Tables']['agents']['Row'];
type Property = Database['public']['Tables']['properties']['Row'];

interface PageContent {
  id: string;
  agent_id: string;
  title: string;
  slug: string;
  is_home: boolean;
  visible: boolean;
  order_index: number;
  content: any;
}

interface Props {
  agent: Agent;
  currentPage?: PageContent;
  onUpdateSection?: (id: string, data: any) => void;
  onDeleteSection?: (id: string) => void;
  onSectionClick?: (section: Section) => void;
  onUpdateAgent?: (updates: any) => void;
  onReorderSections?: (sections: Section[]) => void;
  searchParams?: {
    success?: string;
    error?: string;
  };
}

export default function ClientLandingPage({ agent, currentPage, onUpdateSection, onDeleteSection, onSectionClick, onUpdateAgent, onReorderSections, searchParams }: Props) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [heroTitle, setHeroTitle] = useState(agent.hero_title || 'Hayalinizdeki Evi');
  const [heroSubtitle, setHeroSubtitle] = useState(agent.hero_subtitle || 'Profesyonel gayrimenkul danışmanlığı ile size en uygun satılık ve kiralık seçenekleri sunuyoruz.');
  const [heroSecondaryTitle, setHeroSecondaryTitle] = useState((agent as any).hero_secondary_title || 'Birlikte Bulalım');
  const [heroButtonText, setHeroButtonText] = useState('Ücretsiz Görüşme');
  const [featuresTitle, setFeaturesTitle] = useState((agent as any).features_title || 'Neden Benimle Çalışmalısınız?');
  const [featuresSubtitle, setFeaturesSubtitle] = useState((agent as any).features_subtitle || 'Profesyonel gayrimenkul danışmanlığı ile hedeflerinize ulaşın');
  const [featuresList, setFeaturesList] = useState((agent as any).features_list || [
    { title: 'Güvenilir Hizmet', description: 'Şeffaf ve dürüst iletişim' },
    { title: 'Hızlı Çözümler', description: 'En uygun seçenekleri hızlıca buluyoruz' },
    { title: 'Rekabetçi Fiyat', description: 'Piyasa koşullarına uygun fiyatlar' },
    { title: 'Uzman Destek', description: 'Deneyimli danışmanlık ekibi' }
  ]);
  const [propertiesTitle, setPropertiesTitle] = useState((agent as any).properties_title || 'Portföyümden Seçmeler');
  const [ctaTitle, setCtaTitle] = useState((agent as any).cta_title || 'Hayalinizdeki Evi Bulun');
  const [ctaDescription, setCtaDescription] = useState((agent as any).cta_description || 'Size özel gayrimenkul danışmanlığı için hemen iletişime geçin');
  const [statsList, setStatsList] = useState((agent as any).stats_list || [
    { value: '200+', label: 'Mutlu Müşteri' },
    { value: '150+', label: 'Başarılı Satış' },
    { value: '10+', label: 'Yıl Tecrübe' }
  ]);
  
  // Load content from currentPage when it changes
  useEffect(() => {
    if (currentPage && currentPage.content && Object.keys(currentPage.content).length > 0) {
      console.log('📄 Loading page content into state:', currentPage.content);
      
      const content = currentPage.content;
      
      // Hero section
      if (content.hero) {
        if (content.hero.title) setHeroTitle(content.hero.title);
        if (content.hero.subtitle) setHeroSubtitle(content.hero.subtitle);
        if (content.hero.buttonText) setHeroButtonText(content.hero.buttonText);
        if (content.hero.stats) setStatsList(content.hero.stats);
      }
      
      // Features section
      if (content.features) {
        if (content.features.title) setFeaturesTitle(content.features.title);
        if (content.features.subtitle) setFeaturesSubtitle(content.features.subtitle);
        if (content.features.list) setFeaturesList(content.features.list);
      }
      
      // Properties section
      if (content.properties) {
        if (content.properties.title) setPropertiesTitle(content.properties.title);
      }
      
      // CTA section
      if (content.cta) {
        if (content.cta.title) setCtaTitle(content.cta.title);
        if (content.cta.description) setCtaDescription(content.cta.description);
      }
    } else {
      // Reset to defaults from agent or hardcoded
      console.log('📄 No page content, using agent data or defaults');
      setHeroTitle(agent.hero_title || 'Hayalinizdeki Evi');
      setHeroSubtitle(agent.hero_subtitle || 'Profesyonel gayrimenkul danışmanlığı ile size en uygun satılık ve kiralık seçenekleri sunuyoruz.');
      setHeroButtonText('Ücretsiz Görüşme');
      setFeaturesTitle((agent as any).features_title || 'Neden Benimle Çalışmalısınız?');
      setFeaturesSubtitle((agent as any).features_subtitle || 'Profesyonel gayrimenkul danışmanlığı ile hedeflerinize ulaşın');
      setFeaturesList((agent as any).features_list || [
        { title: 'Güvenilir Hizmet', description: 'Şeffaf ve dürüst iletişim' },
        { title: 'Hızlı Çözümler', description: 'En uygun seçenekleri hızlıca buluyoruz' },
        { title: 'Rekabetçi Fiyat', description: 'Piyasa koşullarına uygun fiyatlar' },
        { title: 'Uzman Destek', description: 'Deneyimli danışmanlık ekibi' }
      ]);
      setPropertiesTitle((agent as any).properties_title || 'Portföyümden Seçmeler');
      setCtaTitle((agent as any).cta_title || 'Hayalinizdeki Evi Bulun');
      setCtaDescription((agent as any).cta_description || 'Size özel gayrimenkul danışmanlığı için hemen iletişime geçin');
      setStatsList((agent as any).stats_list || [
        { value: '200+', label: 'Mutlu Müşteri' },
        { value: '150+', label: 'Başarılı Satış' },
        { value: '10+', label: 'Yıl Tecrübe' }
      ]);
    }
  }, [currentPage, agent]);
  
  // Editor context for old system
  let editorContext;
  try {
    editorContext = useEditor();
  } catch {
    editorContext = null;
  }
  
  const updateSection = onUpdateSection || editorContext?.updateSection;
  const editMode = editorContext?.editMode || false;

  useEffect(() => {
    loadProperties();
  }, [agent.id]);

  const loadProperties = async () => {
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', agent.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6);

    setProperties(data || []);
  };

  const whatsappNumber = agent.whatsapp_number || agent.phone || '';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba ${agent.name}, gayrimenkul danışmanlığı hakkında bilgi almak istiyorum.`)}`;
  const themeColor = agent.theme_color || '#111827';

  // Check if page uses new sections system
  const useSectionsSystem = currentPage?.content?.sections && Array.isArray(currentPage.content.sections);
  const hasCustomSections = useSectionsSystem && currentPage.content.sections.length > 0;
  const isHomePage = currentPage?.is_home;

  // CUSTOM PAGE (NON-HOME) - Only sections system
  if (useSectionsSystem && !isHomePage) {
    return (
      <div className="min-h-screen bg-white">
        <SectionRenderer 
          sections={currentPage.content.sections as Section[]}
          onUpdateSection={onUpdateSection || (() => {})}
          onDeleteSection={editMode && onDeleteSection ? onDeleteSection : undefined}
          onSectionClick={onSectionClick}
          onReorderSections={onReorderSections}
        />
      </div>
    );
  }

  // OLD STATE-BASED SYSTEM (Backward compatibility)
  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{agent.name}</div>
                {agent.city && <div className="text-xs text-gray-500">{agent.city}</div>}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition" style={{ backgroundColor: themeColor }}>
                İletişim
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <EditableSectionWrapper sectionId="hero" sectionType="hero">
        <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {agent.city} Gayrimenkul Danışmanı
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
                <span
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  style={{ 
                    outline: editMode ? '2px dashed #3b82f6' : 'none',
                    display: 'inline-block',
                    minWidth: '200px'
                  }}
                  onBlur={(e) => {
                    const newTitle = e.currentTarget.textContent || '';
                    setHeroTitle(newTitle);
                    if (onUpdateAgent) {
                      onUpdateAgent({ hero_title: newTitle });
                    } else if (updateSection) {
                      updateSection('hero', { title: newTitle });
                    }
                  }}
                >
                  {heroTitle}
                </span>
                <br />
                <span 
                  className="text-gray-500"
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  style={{ 
                    outline: editMode ? '2px dashed #3b82f6' : 'none',
                    display: 'inline-block',
                    minWidth: '200px'
                  }}
                  onBlur={(e) => {
                    const newSecondary = e.currentTarget.textContent || '';
                    setHeroSecondaryTitle(newSecondary);
                    if (onUpdateAgent) {
                      onUpdateAgent({ hero_secondary_title: newSecondary });
                    }
                  }}
                >
                  {heroSecondaryTitle}
                </span>
              </h1>
              
              <p 
                className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                onBlur={(e) => {
                  const newSubtitle = e.currentTarget.textContent || '';
                  setHeroSubtitle(newSubtitle);
                  if (onUpdateAgent) {
                    onUpdateAgent({ hero_subtitle: newSubtitle });
                  } else if (updateSection) {
                    updateSection('hero', { subtitle: newSubtitle });
                  }
                }}
              >
                {heroSubtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: themeColor }}
                >
                  <span
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    style={{ outline: editMode ? '2px dashed #fff' : 'none' }}
                    onBlur={(e) => {
                      const newText = e.currentTarget.textContent || '';
                      setHeroButtonText(newText);
                      if (updateSection) updateSection('hero', { buttonText: newText });
                    }}
                  >
                    {heroButtonText}
                  </span>
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a 
                  href={`tel:${agent.phone}`} 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {agent.phone}
                </a>
              </div>
              
              <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-200">
                {statsList.map((stat, i) => (
                  <div key={i}>
                    <div 
                      className="text-3xl font-bold text-gray-900"
                      contentEditable={editMode}
                      suppressContentEditableWarning
                      style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                      onBlur={(e) => {
                        const newValue = e.currentTarget.textContent || '';
                        const updatedList = [...statsList];
                        updatedList[i] = { ...updatedList[i], value: newValue };
                        setStatsList(updatedList);
                        if (onUpdateAgent) onUpdateAgent({ stats_list: updatedList });
                      }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-sm text-gray-600 mt-1"
                      contentEditable={editMode}
                      suppressContentEditableWarning
                      style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                      onBlur={(e) => {
                        const newLabel = e.currentTarget.textContent || '';
                        const updatedList = [...statsList];
                        updatedList[i] = { ...updatedList[i], label: newLabel };
                        setStatsList(updatedList);
                        if (onUpdateAgent) onUpdateAgent({ stats_list: updatedList });
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </EditableSectionWrapper>

      {/* Features Section */}
      <EditableSectionWrapper sectionId="features" sectionType="features">
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                <span
                  contentEditable={editMode}
                  suppressContentEditableWarning
                  style={{ 
                    outline: editMode ? '2px dashed #3b82f6' : 'none',
                    display: 'inline-block',
                    minWidth: '200px'
                  }}
                  onBlur={(e) => {
                    const newTitle = e.currentTarget.textContent || '';
                    setFeaturesTitle(newTitle);
                    if (onUpdateAgent) onUpdateAgent({ features_title: newTitle });
                  }}
                >
                  {featuresTitle}
                </span>
              </h2>
              <p 
                className="text-lg text-gray-600 max-w-2xl mx-auto"
                contentEditable={editMode}
                suppressContentEditableWarning
                style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                onBlur={(e) => {
                  const newSubtitle = e.currentTarget.textContent || '';
                  setFeaturesSubtitle(newSubtitle);
                  if (onUpdateAgent) onUpdateAgent({ features_subtitle: newSubtitle });
                }}
              >
                {featuresSubtitle}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuresList.map((feature, i) => (
                <div key={i} className="text-center relative group">
                  {editMode && (
                    <button
                      onClick={() => {
                        const updatedList = featuresList.filter((_, index) => index !== i);
                        setFeaturesList(updatedList);
                        if (onUpdateAgent) onUpdateAgent({ features_list: updatedList });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 
                    className="font-semibold text-gray-900 mb-2"
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                    onBlur={(e) => {
                      const newTitle = e.currentTarget.textContent || '';
                      const updatedList = [...featuresList];
                      updatedList[i] = { ...updatedList[i], title: newTitle };
                      setFeaturesList(updatedList);
                      if (onUpdateAgent) onUpdateAgent({ features_list: updatedList });
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-sm text-gray-600"
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
                    onBlur={(e) => {
                      const newDesc = e.currentTarget.textContent || '';
                      const updatedList = [...featuresList];
                      updatedList[i] = { ...updatedList[i], description: newDesc };
                      setFeaturesList(updatedList);
                      if (onUpdateAgent) onUpdateAgent({ features_list: updatedList });
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
              
              {editMode && (
                <div className="text-center flex items-center justify-center">
                  <button
                    onClick={() => {
                      const newFeature = { title: 'Yeni Özellik', description: 'Açıklama ekleyin' };
                      const updatedList = [...featuresList, newFeature];
                      setFeaturesList(updatedList);
                      if (updateSection) updateSection('features', { list: updatedList });
                    }}
                    className="w-full h-full min-h-[120px] border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-blue-500 transition-all"
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium">Yeni Özellik Ekle</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </EditableSectionWrapper>

      {/* Properties Section */}
      {properties && properties.length > 0 && (
        <EditableSectionWrapper sectionId="properties" sectionType="properties">
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <span
                    contentEditable={editMode}
                    suppressContentEditableWarning
                    style={{ 
                      outline: editMode ? '2px dashed #3b82f6' : 'none',
                      display: 'inline-block',
                      minWidth: '200px'
                    }}
                    onBlur={(e) => {
                      const newTitle = e.currentTarget.textContent || '';
                      setPropertiesTitle(newTitle);
                      if (onUpdateAgent) onUpdateAgent({ properties_title: newTitle });
                    }}
                  >
                    {propertiesTitle}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.slice(0, 3).map((property: any) => (
                  <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {property.images && property.images.length > 0 ? (
                      <div className="h-56 relative overflow-hidden">
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{property.title}</h3>
                      {property.price && (
                        <div className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
                          {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(property.price)}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        {property.room_count && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {property.room_count}
                          </span>
                        )}
                        {property.square_meters && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            {property.square_meters} m²
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </EditableSectionWrapper>
      )}

      {/* CTA Section */}
      <EditableSectionWrapper sectionId="cta" sectionType="cta">
        <section className="py-24 bg-gray-50 border-y border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              <span
                contentEditable={editMode}
                suppressContentEditableWarning
                style={{ 
                  outline: editMode ? '2px dashed #3b82f6' : 'none',
                  display: 'inline-block',
                  minWidth: '200px'
                }}
                onBlur={(e) => {
                  const newTitle = e.currentTarget.textContent || '';
                  setCtaTitle(newTitle);
                  if (onUpdateAgent) onUpdateAgent({ cta_title: newTitle });
                }}
              >
                {ctaTitle}
              </span>
            </h2>
            <p 
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
              contentEditable={editMode}
              suppressContentEditableWarning
              style={{ outline: editMode ? '2px dashed #3b82f6' : 'none' }}
              onBlur={(e) => {
                const newDesc = e.currentTarget.textContent || '';
                setCtaDescription(newDesc);
                if (onUpdateAgent) onUpdateAgent({ cta_description: newDesc });
              }}
            >
              {ctaDescription}
            </p>
          </div>
        </section>
      </EditableSectionWrapper>

      {/* CUSTOM SECTIONS - For home page with added sections */}
      {hasCustomSections && (
        <div className="bg-white">
          <SectionRenderer 
            sections={currentPage!.content.sections as Section[]}
            onUpdateSection={onUpdateSection || (() => {})}
            onDeleteSection={editMode && onDeleteSection ? onDeleteSection : undefined}
            onSectionClick={onSectionClick}
            onReorderSections={onReorderSections}
          />
        </div>
      )}

      {/* CONTACT FORM SECTION */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50" id="lead-form">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          {searchParams?.success === 'true' && (
            <div className="mb-8 p-6 bg-green-50 border-2 border-green-500 rounded-xl text-center">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Talebiniz Başarıyla Gönderildi!</h3>
              <p className="text-green-700">En kısa sürede size dönüş yapacağız. Teşekkür ederiz.</p>
            </div>
          )}

          {/* Error Message */}
          {searchParams?.error === 'true' && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-500 rounded-xl text-center">
              <div className="text-4xl mb-2">❌</div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Bir Hata Oluştu</h3>
              <p className="text-red-700">Lütfen tekrar deneyin veya telefon ile iletişime geçin.</p>
            </div>
          )}

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ücretsiz Danışmanlık İsteyin
            </h2>
            <p className="text-lg text-gray-600">
              Size en uygun gayrimenkul seçeneklerini bulmak için formu doldurun
            </p>
          </div>

          <form 
            action="/api/submit-lead" 
            method="POST"
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
          >
            <input type="hidden" name="agent_domain" value={agent.domain || ''} />
            <input type="hidden" name="agent_id" value={agent.id || ''} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adınız Soyadınız *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  placeholder="05XX XXX XX XX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                placeholder="ornek@email.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bütçeniz
                </label>
                <select
                  name="budget"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="0-1M">0 - 1M TL</option>
                  <option value="1M-2M">1M - 2M TL</option>
                  <option value="2M-3M">2M - 3M TL</option>
                  <option value="3M-5M">3M - 5M TL</option>
                  <option value="5M+">5M+ TL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oda Sayısı
                </label>
                <select
                  name="room_count"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                >
                  <option value="">Seçiniz</option>
                  <option value="1+0">1+0</option>
                  <option value="1+1">1+1</option>
                  <option value="2+1">2+1</option>
                  <option value="3+1">3+1</option>
                  <option value="4+1">4+1</option>
                  <option value="5+">5+1 ve üzeri</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlgilendiğiniz Bölge
              </label>
              <input
                type="text"
                name="district"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                placeholder="Örn: Kadıköy, Beşiktaş"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesajınız
              </label>
              <textarea
                name="notes"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                placeholder="İhtiyaçlarınız hakkında detaylı bilgi..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 text-white font-semibold rounded-lg transition shadow-lg hover:shadow-xl"
              style={{ backgroundColor: themeColor }}
            >
              Gönder
            </button>

            <p className="text-xs text-gray-500 text-center">
              Formunuzu göndererek, bilgilerinizin iletişim amacıyla kullanılmasını kabul etmiş olursunuz.
            </p>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">{agent.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                {(agent as any).description || 'Profesyonel Gayrimenkul Danışmanlığı'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">İletişim</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>{agent.phone}</li>
                <li>{agent.email}</li>
                <li>{agent.city}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Bağlantılar</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href={`tel:${agent.phone}`} className="text-gray-600 hover:text-gray-900">
                    Telefon
                  </a>
                </li>
                <li>
                  <a href={`mailto:${agent.email}`} className="text-gray-600 hover:text-gray-900">
                    E-posta
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} {agent.name}. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
