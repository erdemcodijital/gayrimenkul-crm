import Link from 'next/link';
import { Building2, Users, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Gayrimenkul Danışman Yönetim Sistemi
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Modern, etkili ve kullanımı kolay lead toplama platformu
          </p>
          <Link
            href="/admin/login"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
          >
            Admin Girişi
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Özel Landing Sayfaları</h3>
            <p className="text-gray-600">
              Her danışman için özelleştirilmiş, profesyonel landing sayfaları
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Lead Yönetimi</h3>
            <p className="text-gray-600">
              Tüm leadlerinizi tek bir yerden kolayca yönetin ve takip edin
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Analitik & Raporlama</h3>
            <p className="text-gray-600">
              Performansınızı analiz edin ve veri odaklı kararlar alın
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Demo danışman sayfası:{' '}
            <Link
              href="/d/demo"
              className="text-primary-600 hover:text-primary-700 font-semibold underline"
            >
              /d/demo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
