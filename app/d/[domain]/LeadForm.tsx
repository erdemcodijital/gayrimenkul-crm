'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Send } from 'lucide-react';

interface Props {
  agentId: string;
  agentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LeadForm({ agentId, agentName, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    budget: '',
    room_count: '',
    district: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('leads')
        .insert([
          {
            agent_id: agentId,
            ...formData,
            source: 'landing_page',
            status: 'new',
          },
        ]);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err: any) {
      console.error('Form gönderme hatası:', err);
      setError('Form gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Ücretsiz Danışmanlık Formu
          </h2>
          <p className="text-gray-600">
            {agentName} size en kısa sürede dönüş yapacaktır
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="label">
              Adınız Soyadınız *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Ahmet Yılmaz"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="label">
              Telefon Numaranız *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="05XX XXX XX XX"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="budget" className="label">
                Bütçeniz
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="input"
              >
                <option value="">Seçiniz</option>
                <option value="0-1M">0 - 1M TL</option>
                <option value="1M-2M">1M - 2M TL</option>
                <option value="2M-3M">2M - 3M TL</option>
                <option value="3M-5M">3M - 5M TL</option>
                <option value="5M+">5M+ TL</option>
              </select>
            </div>

            <div>
              <label htmlFor="room_count" className="label">
                Oda Sayısı
              </label>
              <select
                id="room_count"
                name="room_count"
                value={formData.room_count}
                onChange={handleChange}
                className="input"
              >
                <option value="">Seçiniz</option>
                <option value="1+0">1+0</option>
                <option value="1+1">1+1</option>
                <option value="2+1">2+1</option>
                <option value="3+1">3+1</option>
                <option value="4+1">4+1</option>
                <option value="5+1+">5+1 ve üzeri</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="district" className="label">
              İlçe
            </label>
            <input
              id="district"
              name="district"
              type="text"
              value={formData.district}
              onChange={handleChange}
              className="input"
              placeholder="Örn: Kadıköy, Beşiktaş"
            />
          </div>

          <div>
            <label htmlFor="notes" className="label">
              Not / Ek Bilgiler
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input min-h-[100px] resize-y"
              placeholder="İhtiyaçlarınız hakkında daha fazla bilgi..."
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Gönder</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center pt-2">
            Formunuzu göndererek, bilgilerinizin iletişim amacıyla kullanılmasını kabul etmiş olursunuz.
          </p>
        </form>
      </div>
    </div>
  );
}
