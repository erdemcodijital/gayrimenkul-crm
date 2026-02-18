import Link from 'next/link';
import { Building2, Users, BarChart3, Sparkles, Globe, Shield, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-16 sm:h-20 w-auto object-contain transform hover:scale-105 transition-transform duration-500"
              style={{ filter: 'brightness(0) saturate(100%)' }}
            />
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Gayrimenkul CRM
              </h1>
              <p className="text-sm sm:text-base text-gray-600 font-light italic max-w-md">
                "Profesyonel emlak çözümleriyle geleceği inşa edin"
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 py-24 sm:py-40">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-900/5 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge with pulse animation */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium mb-10 opacity-0 animate-slide-up shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Türkiye'nin En Modern Gayrimenkul CRM'i</span>
            </div>
            
            {/* Main heading with stagger animation */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold text-gray-900 mb-8 leading-[1.1] opacity-0 animate-slide-up-delay-1">
              Gayrimenkul İşinizi
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 animate-gradient">
                Dijitalleştirin
              </span>
            </h1>
            
            {/* Description with fade in */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed opacity-0 animate-slide-up-delay-2">
              Her danışman için özel landing sayfası, güçlü lead yönetimi ve detaylı analitik araçları. 
              Tek platformda tüm ihtiyaçlarınız.
            </p>
            
            {/* CTA Buttons with slide up */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-slide-up-delay-3">
              <Link
                href="/admin/login"
                className="group px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                Hemen Başla
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl font-semibold transition-all duration-300 text-lg transform hover:scale-105"
              >
                Özellikleri Keşfet
              </a>
            </div>

            {/* Floating cards preview */}
            <div className="mt-20 grid grid-cols-3 gap-4 max-w-3xl mx-auto opacity-0 animate-slide-up-delay-4">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform">
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600 mt-1">Danışman</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600 mt-1">Lead</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform">
                <div className="text-3xl font-bold text-gray-900">%98</div>
                <div className="text-sm text-gray-600 mt-1">Memnuniyet</div>
              </div>
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
            {[
              {
                icon: Building2,
                title: 'Özel Landing Sayfaları',
                description: 'Her danışman için özelleştirilmiş, SEO uyumlu ve mobil responsive landing sayfaları. Kendi domain\'inizle kullanın.',
                delay: '0ms'
              },
              {
                icon: Users,
                title: 'Lead Yönetimi',
                description: 'Tüm leadlerinizi tek bir yerden yönetin. Durum takibi, not ekleme ve WhatsApp entegrasyonu.',
                delay: '100ms'
              },
              {
                icon: BarChart3,
                title: 'Analitik & Raporlar',
                description: 'Detaylı performans analizi, lead dönüşüm oranları ve trend grafikleri ile veri odaklı kararlar alın.',
                delay: '200ms'
              },
              {
                icon: Globe,
                title: 'Çoklu Domain Desteği',
                description: 'Her danışman kendi domain\'ini kullanabilir. Otomatik SSL sertifikası ve domain yönetimi.',
                delay: '300ms'
              },
              {
                icon: Shield,
                title: 'Güvenli & Hızlı',
                description: 'SSL sertifikası, veri şifreleme ve düzenli yedekleme ile verileriniz her zaman güvende.',
                delay: '400ms'
              },
              {
                icon: Zap,
                title: 'Kolay Kullanım',
                description: 'Sezgisel arayüz, hızlı onboarding ve 7/24 teknik destek. Dakikalar içinde başlayın.',
                delay: '500ms'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="group bg-white border-2 border-gray-100 hover:border-gray-900 rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 transform opacity-0 animate-fade-in-up"
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-gray-700 transition-colors">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
                Neden Gayrimenkul CRM?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Rakiplerinizden bir adım önde olun, işinizi kolayca büyütün
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
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
                <div 
                  key={index} 
                  className="group flex items-start gap-4 bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-gray-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-lg text-gray-700 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gray-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-800 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-800 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl sm:text-7xl font-bold mb-8">
            Bugün Başlayın
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Gayrimenkul işinizi dijitalleştirin, daha fazla müşteriye ulaşın ve satışlarınızı artırın
          </p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white hover:bg-gray-100 text-gray-900 rounded-2xl font-bold transition-all duration-300 text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transform"
          >
            Ücretsiz Deneyin
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
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
