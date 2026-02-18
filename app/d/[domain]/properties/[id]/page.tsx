import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];
type Property = Database['public']['Tables']['properties']['Row'];

interface PageProps {
  params: {
    domain: string;
    id: string;
  };
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getAgent(domain: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('domain', domain)
    .single();

  if (error || !data) return null;
  return data;
}

async function getProperty(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const agent = await getAgent(params.domain);
  const property = await getProperty(params.id);

  if (!agent || !property) {
    notFound();
  }

  const themeColor = agent.theme_color || '#111827';
  const whatsappNumber = agent.whatsapp_number || agent.phone || '';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba ${agent.name}, ${property.title} ilanı hakkında bilgi almak istiyorum.`)}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href={`/d/${params.domain}`} className="flex items-center space-x-3 hover:opacity-80 transition">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">{agent.name}</span>
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition" style={{ backgroundColor: themeColor }}>
              İletişime Geç
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol - Galeri & Detaylar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fotoğraf Galerisi */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              {property.images && property.images.length > 0 ? (
                <div className="aspect-video relative">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              {/* Küçük Fotoğraflar */}
              {property.images && property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {property.images.slice(1, 5).map((img: string, idx: number) => (
                    <div key={idx} className="aspect-video rounded overflow-hidden">
                      <img src={img} alt={`${property.title} ${idx + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Başlık ve Fiyat */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              {property.price && (
                <div className="text-4xl font-bold mb-4" style={{ color: themeColor }}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(property.price)}
                </div>
              )}
              
              {/* Özellikler */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-gray-200">
                {property.property_type && (
                  <div>
                    <div className="text-sm text-gray-600">İlan Türü</div>
                    <div className="font-semibold text-gray-900">{property.property_type}</div>
                  </div>
                )}
                {property.room_count && (
                  <div>
                    <div className="text-sm text-gray-600">Oda Sayısı</div>
                    <div className="font-semibold text-gray-900">{property.room_count}</div>
                  </div>
                )}
                {property.square_meters && (
                  <div>
                    <div className="text-sm text-gray-600">Metrekare</div>
                    <div className="font-semibold text-gray-900">{property.square_meters} m²</div>
                  </div>
                )}
                {property.status && (
                  <div>
                    <div className="text-sm text-gray-600">Durum</div>
                    <div className="font-semibold text-green-600">
                      {property.status === 'active' ? 'Aktif' : 'Pasif'}
                    </div>
                  </div>
                )}
              </div>

              {/* Lokasyon */}
              {property.location && (
                <div className="py-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Konum</h3>
                  <div className="flex items-start text-gray-600">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div>{property.location}</div>
                      {property.city && <div className="text-sm">{property.city}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* Açıklama */}
              {property.description && (
                <div className="py-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Açıklama</h3>
                  <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sağ - İletişim Kartı */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
                <p className="text-sm text-gray-600">Gayrimenkul Danışmanı</p>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center px-6 py-4 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                  style={{ backgroundColor: themeColor }}
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp ile İletişim
                </a>

                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="block w-full text-center px-6 py-4 bg-white border-2 text-gray-900 font-semibold rounded-lg transition hover:bg-gray-50"
                    style={{ borderColor: themeColor }}
                  >
                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {agent.phone}
                  </a>
                )}
              </div>

              {agent.city && (
                <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {agent.city}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
