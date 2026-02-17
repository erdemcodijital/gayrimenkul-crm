import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <Search className="w-24 h-24 text-primary-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Danışman Bulunamadı
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Aradığınız danışman sayfası mevcut değil veya şu anda aktif değil.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            Bu sayfa şu nedenlerle görüntülenemeyebilir:
          </p>
          <ul className="text-left inline-block space-y-2 text-gray-600">
            <li>• Danışman hesabı henüz oluşturulmamış</li>
            <li>• Domain adresi yanlış yazılmış olabilir</li>
            <li>• Danışman hesabı şu anda pasif durumda</li>
          </ul>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
