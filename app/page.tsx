import Link from 'next/link';
import { Building2, Users, BarChart3, Sparkles, Globe, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-10 w-auto object-contain"
                style={{ filter: 'brightness(0) saturate(100%)' }}
              />
              <span className="text-xl font-bold text-gray-900">Gayrimenkul CRM</span>
            </div>
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition"
            >
              Admin Girişi
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20 sm:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Türkiye'nin En Modern Gayrimenkul CRM'i</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Gayrimenkul İşinizi
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                Dijitalleştirin
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Her danışman için özel landing sayfası, güçlü lead yönetimi ve detaylı analitik araçları. 
              Tek platformda tüm ihtiyaçlarınız.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/admin/login"
                className="group px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition flex items-center gap-2 text-lg shadow-lg hover:shadow-xl"
              >
                Hemen Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-lg font-semibold transition text-lg"
              >
                Özellikleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">500+</div>
              <div className="text-gray-400">Aktif Danışman</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">10K+</div>
              <div className="text-gray-400">Lead Toplandı</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">50+</div>
              <div className="text-gray-400">Şehir</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">%98</div>
              <div className="text-gray-400">Müşteri Memnuniyeti</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Güçlü Özellikler
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              İşinizi büyütmek için ihtiyacınız olan her şey, tek bir platformda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-8 transition hover:shadow-xl">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Özel Landing Sayfaları</h3>
              <p className="text-gray-600 leading-relaxed">
                Her danışman için özelleştirilmiş, SEO uyumlu ve mobil responsive landing sayfaları. 
                Kendi domain'inizle kullanın.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-8 transition hover:shadow-xl">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Lead Yönetimi</h3>
              <p className="text-gray-600 leading-relaxed">
                Tüm leadlerinizi tek bir yerden yönetin. Durum takibi, not ekleme ve WhatsApp entegrasyonu.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-8 transition hover:shadow-xl">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Analitik & Raporlar</h3>
              <p className="text-gray-600 leading-relaxed">
                Detaylı performans analizi, lead dönüşüm oranları ve trend grafikleri ile veri odaklı kararlar alın.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-8 transition hover:shadow-xl">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Çoklu Domain Desteği</h3>
              <p className="text-gray-600 leading-relaxed">
                Her danışman kendi domain'ini kullanabilir. Otomatik SSL sertifikası ve domain yönetimi.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-8 transition hover:shadow-xl">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Güvenli & Hızlı</h3>
              <p className="text-gray-600 leading-relaxed">
                SSL sertifikası, veri şifreleme ve düzenli yedekleme ile verileriniz her zaman güvende.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-8 transition hover:shadow-xl">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Kolay Kullanım</h3>
              <p className="text-gray-600 leading-relaxed">
                Sezgisel arayüz, hızlı onboarding ve 7/24 teknik destek. Dakikalar içinde başlayın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Neden Gayrimenkul CRM?
              </h2>
              <p className="text-xl text-gray-600">
                Rakiplerinizden bir adım önde olun
              </p>
            </div>

            <div className="space-y-6">
              {[
                'Her danışman için özelleştirilmiş landing sayfası',
                'Sınırsız lead toplama ve yönetimi',
                'WhatsApp ve email entegrasyonu',
                'Mobil uyumlu ve SEO optimize',
                'Detaylı performans raporları',
                'Kolay domain bağlama',
                '7/24 teknik destek',
                'Sürekli güncellenen özellikler'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-900 transition">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Bugün Başlayın
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Gayrimenkul işinizi dijitalleştirin ve daha fazla müşteriye ulaşın
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-bold transition text-lg shadow-xl"
          >
            Ücretsiz Deneyin
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-auto object-contain"
                style={{ filter: 'brightness(0) saturate(100%)' }}
              />
              <span className="font-semibold text-gray-900">Gayrimenkul CRM</span>
            </div>
            <div className="text-gray-600 text-sm">
              © 2026 Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
