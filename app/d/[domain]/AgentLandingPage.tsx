'use client';

import { useState } from 'react';
import { Database } from '@/lib/database.types';
import { Phone, MessageCircle, Building2, MapPin, CheckCircle } from 'lucide-react';
import { formatPhone } from '@/lib/utils';
import LeadForm from './LeadForm';

type Agent = Database['public']['Tables']['agents']['Row'];

interface Props {
  agent: Agent;
}

export default function AgentLandingPage({ agent }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

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
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-800 opacity-90"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Building2 className="w-12 h-12 text-primary-600" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {agent.name}
              </h1>
              <div className="flex items-center justify-center space-x-2 text-xl mb-6">
                <MapPin className="w-6 h-6" />
                <span>{agent.city || 'Türkiye'}</span>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-primary-50">
                Gayrimenkul Danışmanı
              </p>
            </div>
            
            <p className="text-lg md:text-xl mb-10 text-primary-50 max-w-2xl mx-auto">
              Size en uygun gayrimenkul seçeneklerini bulmak için buradayım. 
              Hayalinizdeki evi birlikte bulalım!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                Ücretsiz Danışmanlık Al
              </button>
              {agent.whatsapp_number && (
                <button
                  onClick={handleWhatsAppClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>WhatsApp ile İletişim</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Hizmetlerimiz
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Satılık Gayrimenkuller</h3>
              <p className="text-gray-600">
                Bütçenize ve ihtiyaçlarınıza uygun satılık ev, daire ve arsa seçenekleri
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Kiralık Gayrimenkuller</h3>
              <p className="text-gray-600">
                Size özel kiralık konut ve işyeri seçenekleri ile hizmetinizdeyiz
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Profesyonel Danışmanlık</h3>
              <p className="text-gray-600">
                Gayrimenkul alım-satım sürecinizde size rehberlik ediyoruz
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Me Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Neden Benimle Çalışmalısınız?
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              'Geniş gayrimenkul portföyü',
              'Profesyonel ve güvenilir hizmet',
              'Piyasa koşullarına uygun fiyatlandırma',
              'Hızlı ve etkili çözümler',
              'Müşteri memnuniyeti odaklı yaklaşım',
              '7/24 iletişim desteği'
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-800 text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hayalinizdeki Evi Birlikte Bulalım
          </h2>
          <p className="text-xl mb-8 text-primary-50 max-w-2xl mx-auto">
            Size özel gayrimenkul seçenekleri için hemen iletişime geçin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              Formu Doldur
            </button>
            {agent.phone && (
              <a
                href={`tel:${formatPhone(agent.phone)}`}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 text-lg"
              >
                <Phone className="w-6 h-6" />
                <span>Hemen Ara</span>
              </a>
            )}
          </div>
        </div>
      </section>

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
