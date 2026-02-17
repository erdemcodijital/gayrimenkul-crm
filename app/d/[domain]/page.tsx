import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];

interface PageProps {
  params: {
    domain: string;
  };
}

async function getAgent(domain: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('domain', domain)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps) {
  const agent = await getAgent(params.domain);

  if (!agent) {
    return {
      title: 'Danışman Bulunamadı',
    };
  }

  return {
    title: `${agent.name} - Gayrimenkul Danışmanı`,
    description: `${agent.city ? agent.city + ' ' : ''}Gayrimenkul Danışmanı ${agent.name}. Size en uygun gayrimenkul seçeneklerini bulmak için buradayım.`,
  };
}

export default async function AgentPage({ params }: PageProps) {
  const agent = await getAgent(params.domain);

  if (!agent) {
    notFound();
  }

  // Agent'ın portföy ilanlarını çek
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .eq('agent_id', agent.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6);

  // Aktif mi kontrolü
  if (!agent.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Devre Dışı</h1>
          <p className="text-gray-600 mb-6">Bu danışman hesabı şu anda devre dışı bırakılmış durumda.</p>
        </div>
      </div>
    );
  }

  // Lisans kontrolü
  if (agent.license_status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lisans Süresi Dolmuş</h1>
          <p className="text-gray-600 mb-6">Bu danışman hesabının lisansı aktif değil.</p>
        </div>
      </div>
    );
  }

  const whatsappNumber = agent.whatsapp_number || agent.phone || '';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba ${agent.name}, gayrimenkul danışmanlığı hakkında bilgi almak istiyorum.`)}`;
  
  const themeColor = agent.theme_color || '#111827';

  return (
    <div className="min-h-screen bg-white antialiased">
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

      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Hayalinizdeki Evi<br />
              <span className="text-gray-500">Birlikte Bulalım</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Profesyonel gayrimenkul danışmanlığı ile size en uygun satılık ve kiralık seçenekleri sunuyoruz.
            </p>
            
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-8 py-4 text-white font-medium rounded-lg shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              Ücretsiz Görüşme
            </a>
          </div>
        </div>
      </section>

      {properties && properties.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Portföyümden Seçmeler</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property: any) => (
                <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition">
                  <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{property.title}</h3>
                    {property.price && (
                      <div className="text-2xl font-bold mb-4" style={{ color: themeColor }}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(property.price)}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mb-4">
                      {property.room_count && <span>🛏️ {property.room_count}</span>}
                      {property.square_meters && <span className="ml-3">📐 {property.square_meters} m²</span>}
                    </div>
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 border-2 rounded-lg font-medium"
                      style={{ borderColor: themeColor, color: themeColor }}
                    >
                      İletişime Geç
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">© {new Date().getFullYear()} {agent.name}. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
