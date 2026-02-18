'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { ArrowLeft, MapPin, Maximize, Bed, Phone, MessageCircle, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { formatPhone } from '@/lib/utils';
import Link from 'next/link';

type Property = Database['public']['Tables']['properties']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const domain = params.domain as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    loadProperty();
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      // Load property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError || !propertyData) {
        router.push(`/d/${domain}`);
        return;
      }

      setProperty(propertyData);

      // Load agent
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('id', propertyData.agent_id)
        .single();

      if (agentData) setAgent(agentData);
    } catch (error) {
      console.error('İlan yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!agent) return;
    const whatsappNumber = agent.whatsapp_number || formatPhone(agent.phone || '');
    const message = encodeURIComponent(
      `Merhaba ${agent.name}, "${property?.title}" ilanı hakkında bilgi almak istiyorum.`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">İlan bulunamadı</p>
        </div>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];

  const formatPrice = (price: number | null) => {
    if (!price) return 'Fiyat Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe && images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/d/${domain}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Geri Dön
          </Link>
        </div>
      </header>

      {/* Image Gallery */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8">
          {images.length > 0 ? (
            <div className="relative">
              <div 
                className="relative h-96 md:h-[600px] rounded-xl overflow-hidden bg-gray-200 group touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={property.title || 'İlan'}
                  className="w-full h-full object-cover select-none"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </>
                )}
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex ? 'border-primary-600' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 md:h-[600px] rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <Building2 className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                {/* Title & Price */}
                <div className="mb-6">
                  <div className="mb-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold inline-block mb-3">
                      {property.property_type}
                    </span>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                      {property.title}
                    </h1>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600 mb-4">
                    {formatPrice(property.price)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-base sm:text-lg">{property.location || property.city}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8 pb-8 border-b">
                  {property.room_count && (
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                      <Bed className="w-6 h-6 text-primary-600" />
                      <div>
                        <div className="text-sm text-gray-600">Oda Sayısı</div>
                        <div className="font-semibold">{property.room_count}</div>
                      </div>
                    </div>
                  )}
                  {property.square_meters && (
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                      <Maximize className="w-6 h-6 text-primary-600" />
                      <div>
                        <div className="text-sm text-gray-600">Metrekare</div>
                        <div className="font-semibold">{property.square_meters} m²</div>
                      </div>
                    </div>
                  )}
                  {property.city && (
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                      <MapPin className="w-6 h-6 text-primary-600" />
                      <div>
                        <div className="text-sm text-gray-600">Şehir</div>
                        <div className="font-semibold">{property.city}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Açıklama</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {property.description || 'Açıklama eklenmemiş'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 lg:sticky lg:top-24">
                {agent && (
                  <>
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-10 h-10 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
                      <p className="text-gray-600">Gayrimenkul Danışmanı</p>
                    </div>

                    <div className="space-y-3">
                      {agent.phone && (
                        <a
                          href={`tel:${formatPhone(agent.phone)}`}
                          className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition"
                        >
                          <Phone className="w-5 h-5" />
                          Hemen Ara
                        </a>
                      )}
                      {agent.whatsapp_number && (
                        <button
                          onClick={handleWhatsAppClick}
                          className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                        >
                          <MessageCircle className="w-5 h-5" />
                          WhatsApp
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
