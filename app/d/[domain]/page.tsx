import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
// import AgentLandingPage from './AgentLandingPage';

type Agent = Database['public']['Tables']['agents']['Row'];

interface PageProps {
  params: {
    domain: string;
  };
}

async function getAgent(domain: string): Promise<Agent | null> {
  console.log('🔍 Aranan domain:', domain);
  
  // is_active kontrolünü KALDIRDIK - sayfada kontrol edeceğiz
  // CACHE'i KAPATTIK - her zaman fresh data çek
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('domain', domain)
    .single();

  console.log('📊 Supabase yanıtı:', { data, error });

  if (error || !data) {
    console.log('❌ Danışman bulunamadı:', error?.message);
    return null;
  }

  console.log('✅ Danışman bulundu:', data.name);
  return data;
}

// Cache'i kapat - her zaman fresh data
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

  // Aktif mi kontrolü
  if (!agent.is_active) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Devre Dışı</h1>
          <p className="text-gray-600 mb-6">
            Bu danışman hesabı şu anda devre dışı bırakılmış durumda.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p><strong>Danışman:</strong> {agent.name}</p>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Hesabınızı aktifleştirmek için yönetici ile iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Lisans kontrolü
  if (agent.license_status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lisans Süresi Dolmuş</h1>
          <p className="text-gray-600 mb-6">
            Bu danışman hesabının lisansı {agent.license_status === 'suspended' ? 'askıya alınmış' : agent.license_status === 'expired' ? 'süresi dolmuş' : 'aktif değil'}.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p><strong>Danışman:</strong> {agent.name}</p>
            <p><strong>Durum:</strong> {agent.license_status === 'suspended' ? 'Askıda' : agent.license_status === 'expired' ? 'Süresi Dolmuş' : 'İnaktif'}</p>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Lisansınızı yenilemek için admin paneline giriş yapın veya destek ekibiyle iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const whatsappNumber = agent.whatsapp_number || agent.phone || '';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba ${agent.name}, gayrimenkul danışmanlığı hakkında bilgi almak istiyorum.`)}`;
  
  // Tema rengi
  const themeColor = agent.theme_color || '#111827';

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Navigation - Clean & Minimal */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
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
              <a href={`tel:${agent.phone}`} className="hidden sm:inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition">
                {agent.phone}
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md transition" style={{ backgroundColor: themeColor }}>
                İletişim
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean SaaS Style */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {agent.city} Gayrimenkul Danışmanı
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Hayalinizdeki Evi<br />
              <span className="text-gray-500">Birlikte Bulalım</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Profesyonel gayrimenkul danışmanlığı ile size en uygun satılık ve kiralık seçenekleri sunuyoruz.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: themeColor }}
              >
                Ücretsiz Görüşme
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
            
            {/* Stats - Clean inline */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">200+</div>
                <div className="text-sm text-gray-600 mt-1">Mutlu Müşteri</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">150+</div>
                <div className="text-sm text-gray-600 mt-1">Başarılı Satış</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">10+</div>
                <div className="text-sm text-gray-600 mt-1">Yıl Tecrübe</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Why Choose */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Neden Benimle Çalışmalısınız?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Profesyonel gayrimenkul danışmanlığı ile hedeflerinize ulaşın</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Güvenilir Hizmet', desc: 'Şeffaf ve dürüst iletişim' },
              { title: 'Hızlı Çözümler', desc: 'En uygun seçenekleri hızlıca buluyoruz' },
              { title: 'Rekabetçi Fiyat', desc: 'Piyasa koşullarına uygun fiyatlar' },
              { title: 'Uzman Destek', desc: 'Deneyimli danışmanlık ekibi' }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-24 bg-gray-50 border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Hayalinizdeki Evi Bulun
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Size özel gayrimenkul danışmanlığı için hemen iletişime geçin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center px-8 py-4 text-white font-medium rounded-lg transition"
              style={{ backgroundColor: themeColor }}
            >
              WhatsApp
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a 
              href={`tel:${agent.phone}`} 
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 transition"
            >
              {agent.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">{agent.name}</span>
              </div>
              <p className="text-sm text-gray-600">Gayrimenkul danışmanlığı</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">İletişim</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {agent.phone && <div>{agent.phone}</div>}
                {agent.email && <div>{agent.email}</div>}
                {agent.city && <div>{agent.city}</div>}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Bağlantılar</h3>
              <div className="space-y-2 text-sm">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block text-gray-600 hover:text-gray-900">WhatsApp</a>
                <a href={`tel:${agent.phone}`} className="block text-gray-600 hover:text-gray-900">Telefon</a>
                <a href={`mailto:${agent.email}`} className="block text-gray-600 hover:text-gray-900">E-posta</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            © {new Date().getFullYear()} {agent.name}. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
