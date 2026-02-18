'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin, Video, Phone, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PublicAppointmentPage() {
  const params = useParams();
  const domain = params.domain as string;

  const [agent, setAgent] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [meetingType, setMeetingType] = useState('in_person');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [themeColor, setThemeColor] = useState('#111827');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    loadAgent();
  }, [domain]);

  const loadAgent = async () => {
    try {
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('domain', domain)
        .single();

      if (agentData) {
        setAgent(agentData);
        setThemeColor(agentData.theme_color || '#111827');
        await loadAvailability(agentData.id);
      }
    } catch (error) {
      console.error('Agent yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async (agentId: string) => {
    try {
      const { data } = await supabase
        .from('agent_availability')
        .select('*')
        .eq('agent_id', agentId)
        .eq('is_active', true);

      setAvailability(data || []);
    } catch (error) {
      console.error('Müsaitlik yüklenemedi:', error);
    }
  };

  const getAvailableTimeSlotsForDate = (date: Date) => {
    // Eğer availability tanımlanmamışsa, default saatler döndür (09:00 - 18:00)
    if (!availability || availability.length === 0) {
      const slots: string[] = [];
      for (let hour = 9; hour < 18; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
        slots.push(`${String(hour).padStart(2, '0')}:30`);
      }
      return slots;
    }

    const dayOfWeek = date.getDay();
    const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);

    // Bu gün için availability yoksa, default saatler
    if (!dayAvailability.length) {
      const slots: string[] = [];
      for (let hour = 9; hour < 18; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`);
        slots.push(`${String(hour).padStart(2, '0')}:30`);
      }
      return slots;
    }

    // Generate time slots (her 30 dakikada bir)
    const slots: string[] = [];
    dayAvailability.forEach(avail => {
      const [startHour, startMin] = avail.start_time.split(':').map(Number);
      const [endHour, endMin] = avail.end_time.split(':').map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        slots.push(timeString);

        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour++;
        }
      }
    });

    return slots;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (day: number) => {
    // Eğer availability tanımlanmamışsa, tüm günleri müsait kabul et
    if (!availability || availability.length === 0) return true;
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayOfWeek = date.getDay();
    return availability.some(a => a.day_of_week === dayOfWeek && a.is_active);
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = isDateAvailable(day);
      const isPast = isPastDate(day);
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => {
            if (isAvailable && !isPast) {
              setSelectedDate(date);
              setSelectedTime('');
            }
          }}
          disabled={!isAvailable || isPast}
          className={`h-16 border border-gray-200 rounded-lg flex items-center justify-center text-sm font-medium transition ${
            isSelected
              ? 'text-white border-transparent'
              : isAvailable && !isPast
              ? 'hover:bg-gray-50 hover:border-gray-300 text-gray-900'
              : 'text-gray-300 bg-gray-50 cursor-not-allowed'
          }`}
          style={isSelected ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const submitAppointment = async () => {
    if (!selectedDate || !selectedTime || !formData.name || !formData.phone) {
      alert('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setSubmitting(true);
    try {
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('appointments')
        .insert({
          agent_id: agent.id,
          title: `${formData.name} - Randevu`,
          appointment_date: appointmentDateTime.toISOString(),
          duration: selectedDuration,
          meeting_type: meetingType,
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_email: formData.email,
          notes: formData.notes,
          status: 'pending'
        });

      if (error) throw error;

      setSuccess(true);
    } catch (error) {
      console.error('Randevu oluşturulamadı:', error);
      alert('Randevu oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Danışman bulunamadı</h1>
          <p className="text-gray-600">Bu domain için kayıtlı danışman yok.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Randevu Talebiniz Alındı!</h2>
          <p className="text-gray-600 mb-6">
            Randevu talebiniz başarıyla oluşturuldu. {agent.name} en kısa sürede sizinle iletişime geçecektir.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium">
                {selectedDate?.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{selectedTime} ({selectedDuration} dakika)</span>
            </div>
          </div>
          <button
            onClick={() => window.location.href = `/d/${domain}`}
            className="w-full px-6 py-3 text-white rounded-lg font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const availableTimeSlots = selectedDate ? getAvailableTimeSlotsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => window.location.href = `/d/${domain}`}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri Dön
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {agent.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              <p className="text-gray-600">Randevu Al</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar & Time Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Date */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Tarih Seçin</h2>
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            </div>

            {/* Step 2: Select Time */}
            {selectedDate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Saat Seçin</h2>
                {availableTimeSlots.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">Bu tarih için uygun saat yok</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {availableTimeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-3 px-4 border-2 rounded-lg font-medium transition ${
                          selectedTime === time
                            ? 'text-white'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={selectedTime === time ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Meeting Type & Duration */}
            {selectedTime && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Görüşme Detayları</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görüşme Tipi
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setMeetingType('in_person')}
                        className={`py-3 px-4 border-2 rounded-lg font-medium transition flex flex-col items-center gap-2 ${
                          meetingType === 'in_person'
                            ? 'text-white'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={meetingType === 'in_person' ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                      >
                        <MapPin className="w-5 h-5" />
                        <span className="text-xs">Yüz Yüze</span>
                      </button>
                      <button
                        onClick={() => setMeetingType('video_call')}
                        className={`py-3 px-4 border-2 rounded-lg font-medium transition flex flex-col items-center gap-2 ${
                          meetingType === 'video_call'
                            ? 'text-white'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={meetingType === 'video_call' ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                      >
                        <Video className="w-5 h-5" />
                        <span className="text-xs">Video</span>
                      </button>
                      <button
                        onClick={() => setMeetingType('phone_call')}
                        className={`py-3 px-4 border-2 rounded-lg font-medium transition flex flex-col items-center gap-2 ${
                          meetingType === 'phone_call'
                            ? 'text-white'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        style={meetingType === 'phone_call' ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
                      >
                        <Phone className="w-5 h-5" />
                        <span className="text-xs">Telefon</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Süre
                    </label>
                    <select
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    >
                      <option value={30}>30 dakika</option>
                      <option value={60}>1 saat</option>
                      <option value={90}>1.5 saat</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">İletişim Bilgileri</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ focusRingColor: themeColor } as any}
                    placeholder="Adınız"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    placeholder="Görüşmek istediğiniz konular..."
                  />
                </div>

                <button
                  onClick={submitAppointment}
                  disabled={!selectedDate || !selectedTime || !formData.name || !formData.phone || submitting}
                  className="w-full px-6 py-4 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: themeColor }}
                >
                  {submitting ? 'Gönderiliyor...' : 'Randevu Al'}
                </button>

                {selectedDate && selectedTime && (
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: `${themeColor}15` }}>
                    <p className="text-sm font-medium mb-2" style={{ color: themeColor }}>Seçiminiz:</p>
                    <div className="text-sm space-y-1" style={{ color: themeColor }}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {selectedTime} ({selectedDuration} dk)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
