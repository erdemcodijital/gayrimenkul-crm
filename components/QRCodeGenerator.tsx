'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, QrCode, MessageCircle, Home as HomeIcon } from 'lucide-react';

interface QRCodeGeneratorProps {
  agent: {
    name: string;
    domain: string;
    whatsapp_number: string;
  };
  properties?: Array<{
    id: string;
    title: string;
  }>;
}

export default function QRCodeGenerator({ agent, properties = [] }: QRCodeGeneratorProps) {
  const [selectedType, setSelectedType] = useState<'landing' | 'whatsapp' | 'property'>('landing');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const qrTypes = [
    {
      id: 'landing',
      label: 'Landing Page',
      icon: QrCode,
      description: 'Kişisel sayfanıza yönlendirir'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageCircle,
      description: 'Direkt WhatsApp görüşmesi'
    },
    {
      id: 'property',
      label: 'İlan',
      icon: HomeIcon,
      description: 'Belirli bir ilana yönlendirir'
    }
  ];

  useEffect(() => {
    generateQR();
  }, [selectedType, selectedProperty]);

  const getQRData = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    switch (selectedType) {
      case 'landing':
        return `${baseUrl}/d/${agent.domain}`;
      case 'whatsapp':
        const phone = agent.whatsapp_number?.replace(/\D/g, '') || '';
        const message = encodeURIComponent(`Merhaba ${agent.name}, size ilanlarınız hakkında bilgi almak istiyorum.`);
        return `https://wa.me/${phone}?text=${message}`;
      case 'property':
        if (!selectedProperty) return `${baseUrl}/d/${agent.domain}`;
        return `${baseUrl}/d/${agent.domain}/property/${selectedProperty}`;
      default:
        return `${baseUrl}/d/${agent.domain}`;
    }
  };

  const generateQR = async () => {
    const data = getQRData();
    
    try {
      const url = await QRCode.toDataURL(data, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(url);

      // Canvas'a çiz (download için)
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, data, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
    }
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (format === 'png' && canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${agent.name}-${selectedType}-qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    } else if (format === 'svg') {
      const data = getQRData();
      QRCode.toString(data, { type: 'svg' }, (err, svg) => {
        if (err) {
          console.error('SVG oluşturma hatası:', err);
          return;
        }
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${agent.name}-${selectedType}-qr.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const shareQR = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        const blob = await (await fetch(qrDataUrl)).blob();
        const file = new File([blob], `${agent.name}-qr.png`, { type: 'image/png' });
        
        await navigator.share({
          title: `${agent.name} - QR Kod`,
          text: 'QR kodu tarayarak bana ulaşabilirsiniz!',
          files: [file]
        });
      } catch (error) {
        console.error('Paylaşım hatası:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Kod Oluşturucu</h2>
        <p className="text-gray-600">Kartvizit, broşür ve tabelalarınız için QR kod oluşturun</p>
      </div>

      {/* QR Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {qrTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as any)}
              className={`p-6 border-2 rounded-xl transition-all duration-200 text-left ${
                selectedType === type.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                selectedType === type.id ? 'bg-primary-600' : 'bg-gray-100'
              }`}>
                <Icon className={`w-6 h-6 ${selectedType === type.id ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          );
        })}
      </div>

      {/* Property Selection (if property type selected) */}
      {selectedType === 'property' && properties.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İlan Seçin
          </label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">-- İlan Seçin --</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* QR Code Display */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
        <div className="flex flex-col items-center">
          <div className="bg-white p-8 rounded-xl shadow-lg border-4 border-gray-100 mb-6">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-80 h-80" />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {selectedType === 'landing' && 'Kişisel Landing Page'}
              {selectedType === 'whatsapp' && 'WhatsApp Direkt İletişim'}
              {selectedType === 'property' && 'İlan Detay Sayfası'}
            </p>
            <p className="text-sm text-gray-600 break-all max-w-md">
              {getQRData()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => downloadQR('png')}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              PNG İndir
            </button>
            <button
              onClick={() => downloadQR('svg')}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              SVG İndir
            </button>
            {navigator.share && (
              <button
                onClick={shareQR}
                className="flex items-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg font-medium transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Paylaş
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Kullanım Önerileri
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span><strong>Kartvizit:</strong> Kartınızın arka yüzüne QR kod bastırın</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span><strong>Broşür:</strong> İlan broşürlerinize QR kod ekleyin</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span><strong>Tabela:</strong> Ofis tabelanıza QR kod yerleştirin</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span><strong>Sosyal Medya:</strong> Instagram story veya post'larınızda kullanın</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span><strong>Email İmzası:</strong> Email imzanıza QR kod ekleyin</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
