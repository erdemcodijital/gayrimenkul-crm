'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Database } from '@/lib/database.types';
import { Phone, MessageCircle, Building2, MapPin, CheckCircle, Home, Maximize, Bed, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { formatPhone } from '@/lib/utils';
import LeadForm from './LeadForm';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Agent = Database['public']['Tables']['agents']['Row'];
type Property = Database['public']['Tables']['properties']['Row'];

interface Props {
  agent: Agent;
}

export default function AgentLandingPage({ agent }: Props) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [editableTitle, setEditableTitle] = useState(agent.hero_title || agent.name);
  const [editableSubtitle, setEditableSubtitle] = useState(agent.hero_subtitle || 'Gayrimenkul Danışmanı');
  const [editableDescription, setEditableDescription] = useState(agent.about_text || 'Size en uygun gayrimenkul seçeneklerini bulmak için buradayım.');
  const [filters, setFilters] = useState({
    search: '',
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    roomCount: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleWhatsAppClick = () => {
    const whatsappNumber = agent.whatsapp_number || formatPhone(agent.phone || '');
    const message = encodeURIComponent(`Merhaba ${agent.name}, gayrimenkul danışmanlığı hakkında bilgi almak istiyorum.`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleFormSuccess = () => {
    setFormSubmitted(true);
    setShowForm(false);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  useEffect(() => {
    loadProperties();
  }, [agent.id]);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', agent.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...properties];

    // Arama
    if (filters.search) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.location?.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.city?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // İlan türü
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(p => p.property_type === filters.propertyType);
    }

    // Fiyat aralığı
    if (filters.minPrice) {
      filtered = filtered.filter(p => (p.price || 0) >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => (p.price || 0) <= parseInt(filters.maxPrice));
    }

    // Oda sayısı
    if (filters.roomCount !== 'all') {
      filtered = filtered.filter(p => p.room_count === filters.roomCount);
    }

    setFilteredProperties(filtered);
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Success Message */}
      {formSubmitted && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-slide-in">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">Başvurunuz alındı!</p>
            <p className="text-sm">En kısa sürede size dönüş yapılacaktır.</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 opacity-90"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div 
              className="mb-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                variants={scaleIn}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.1, rotate: 360 }}
              >
                <Building2 className="w-12 h-12 text-primary-600" />
              </motion.div>
              
              <motion.h1 
                className={`text-4xl md:text-6xl font-bold mb-4 ${isEditMode ? 'cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-yellow-400 rounded px-2 py-1' : ''}`}
                variants={fadeInUp}
                transition={{ duration: 0.6 }}
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (isEditMode) {
                    const newTitle = e.currentTarget.textContent || '';
                    setEditableTitle(newTitle);
                    window.parent.postMessage({ type: 'UPDATE_HERO', field: 'title', value: newTitle }, '*');
                  }
                }}
              >
                {editableTitle}
              </motion.h1>
              
              <motion.div 
                className="flex items-center justify-center space-x-2 text-xl mb-6"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <MapPin className="w-6 h-6" />
                <span>{agent.city || 'Türkiye'}</span>
              </motion.div>
              
              <motion.p 
                className={`text-xl md:text-2xl mb-8 text-primary-50 ${isEditMode ? 'cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-yellow-400 rounded px-2 py-1' : ''}`}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                contentEditable={isEditMode}
                suppressContentEditableWarning
                onBlur={(e) => {
                  if (isEditMode) {
                    const newSubtitle = e.currentTarget.textContent || '';
                    setEditableSubtitle(newSubtitle);
                    window.parent.postMessage({ type: 'UPDATE_HERO', field: 'subtitle', value: newSubtitle }, '*');
                  }
                }}
              >
                {editableSubtitle}
              </motion.p>
            </motion.div>
            
            <motion.p 
              className={`text-lg md:text-xl mb-10 text-primary-50 max-w-2xl mx-auto ${isEditMode ? 'cursor-text hover:outline hover:outline-2 hover:outline-dashed hover:outline-yellow-400 rounded px-2 py-1' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              contentEditable={isEditMode}
              suppressContentEditableWarning
              onBlur={(e) => {
                if (isEditMode) {
                  const newDescription = e.currentTarget.textContent || '';
                  setEditableDescription(newDescription);
                  window.parent.postMessage({ type: 'UPDATE_HERO', field: 'description', value: newDescription }, '*');
                }
              }}
            >
              {editableDescription}
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                onClick={() => setShowForm(true)}
                className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg transition-all shadow-lg text-lg"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.95 }}
              >
                Ücretsiz Danışmanlık Al
              </motion.button>
              {agent.whatsapp_number && (
                <motion.button
                  onClick={handleWhatsAppClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2 text-lg"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>WhatsApp ile İletişim</span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Properties Section */}
      {agent.show_properties !== false && (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              İlanlarımız
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Size en uygun gayrimenkul seçeneklerini inceleyin
            </p>
          </motion.div>

          {/* Search & Filters */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Şehir, mahalle veya başlık ara..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span>Filtrele</span>
                </button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t">
                  <select
                    value={filters.propertyType}
                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Tüm İlanlar</option>
                    <option value="Satılık">Satılık</option>
                    <option value="Kiralık">Kiralık</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Min Fiyat"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Fiyat"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={filters.roomCount}
                    onChange={(e) => setFilters({ ...filters, roomCount: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">Tüm Odalar</option>
                    <option value="1+0">1+0</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+1">5+1</option>
                  </select>
                </div>
              )}
            </div>

            {/* Results Count */}
            <div className="text-center mt-4 text-gray-600">
              {filteredProperties.length} ilan bulundu
            </div>
          </div>

          {/* Properties Grid */}
          {filteredProperties.length === 0 ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Henüz ilan bulunmuyor</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
            >
              {filteredProperties.map((property, index) => (
                <PropertyCard key={property.id} property={property} agentDomain={agent.domain} index={index} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
      )}

      {/* Why Choose Me Section */}
      {agent.show_features !== false && (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Neden Benimle Çalışmalısınız?
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              'Geniş gayrimenkul portföyü',
              'Profesyonel ve güvenilir hizmet',
              'Piyasa koşullarına uygun fiyatlandırma',
              'Hızlı ve etkili çözümler',
              'Müşteri memnuniyeti odaklı yaklaşım',
              '7/24 iletişim desteği'
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm"
                variants={fadeInUp}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-800 text-lg">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      {agent.show_cta !== false && (
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Hayalinizdeki Evi Birlikte Bulalım
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-primary-50 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Size özel gayrimenkul seçenekleri için hemen iletişime geçin
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg shadow-lg text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Formu Doldur
            </motion.button>
            {agent.phone && (
              <motion.a
                href={`tel:${formatPhone(agent.phone)}`}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg flex items-center justify-center space-x-2 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-6 h-6" />
                <span>Hemen Ara</span>
              </motion.a>
            )}
          </motion.div>
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {agent.name} - Gayrimenkul Danışmanı
          </p>
          {agent.email && (
            <p className="text-gray-400 mt-2">
              <a href={`mailto:${agent.email}`} className="hover:text-primary-400">
                {agent.email}
              </a>
            </p>
          )}
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      {agent.whatsapp_number && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5, type: 'spring' }}
        >
          <motion.button
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(34, 197, 94, 0.4)',
                '0 0 40px rgba(34, 197, 94, 0.6)',
                '0 0 20px rgba(34, 197, 94, 0.4)',
              ]
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }
            }}
          >
            <MessageCircle className="w-8 h-8" />
            <motion.span
              className="ml-0 overflow-hidden whitespace-nowrap max-w-0 group-hover:max-w-xs group-hover:ml-3"
              initial={{ width: 0 }}
              whileHover={{ width: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              WhatsApp
            </motion.span>
          </motion.button>
        </motion.div>
      )}

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          agentId={agent.id}
          agentName={agent.name}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

// Property Card Component with Image Slider
function PropertyCard({ property, agentDomain, index }: { property: Property; agentDomain: string | null; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = Array.isArray(property.images) ? property.images : [];

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Fiyat Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      variants={cardVariants}
    >
      <Link 
        href={`/d/${agentDomain}/property/${property.id}`}
        className="block bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300"
      >
        <motion.div
          whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          transition={{ duration: 0.3 }}
        >
          {/* Image Slider */}
          <div className="relative h-64 bg-gray-200 overflow-hidden group">
            {images.length > 0 ? (
              <>
                <motion.img
                  src={images[currentImageIndex]}
                  alt={property.title || 'İlan'}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {/* Image Indicators */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <Building2 className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {/* Property Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            {property.property_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {property.title || 'Başlık Yok'}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location || property.city || 'Konum belirtilmemiş'}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description || 'Açıklama eklenmemiş'}
        </p>

        {/* Features */}
        <div className="flex gap-4 mb-4 text-sm text-gray-700">
          {property.room_count && (
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              <span>{property.room_count}</span>
            </div>
          )}
          {property.square_meters && (
            <div className="flex items-center">
              <Maximize className="w-4 h-4 mr-1" />
              <span>{property.square_meters} m²</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-2xl font-bold text-primary-600">
            {formatPrice(property.price)}
          </span>
          <span className="text-primary-600 font-semibold hover:underline">
            Detaylar →
          </span>
        </div>
      </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
