'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Video, 
  MapPin,
  User,
  Mail,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2
} from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  description: string;
  appointment_date: string;
  duration: number;
  location: string;
  meeting_type: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  notes: string;
  meeting_link: string;
  lead_id: string | null;
}

interface AppointmentManagerProps {
  agentId: string;
}

export default function AppointmentManager({ agentId }: AppointmentManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointment_date: '',
    appointment_time: '',
    duration: 60,
    meeting_type: 'in_person',
    location: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    notes: '',
    meeting_link: ''
  });

  useEffect(() => {
    loadAppointments();
  }, [agentId, selectedDate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Seçili ayın tüm randevularını çek
      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('agent_id', agentId)
        .gte('appointment_date', startOfMonth.toISOString())
        .lte('appointment_date', endOfMonth.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Randevular yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async () => {
    try {
      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`);

      const { error } = await supabase
        .from('appointments')
        .insert({
          agent_id: agentId,
          title: formData.title,
          description: formData.description,
          appointment_date: appointmentDateTime.toISOString(),
          duration: formData.duration,
          meeting_type: formData.meeting_type,
          location: formData.location,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email,
          notes: formData.notes,
          meeting_link: formData.meeting_link,
          status: 'pending'
        });

      if (error) throw error;

      // Form'u temizle
      setFormData({
        title: '',
        description: '',
        appointment_date: '',
        appointment_time: '',
        duration: 60,
        meeting_type: 'in_person',
        location: '',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        notes: '',
        meeting_link: ''
      });

      setShowNewAppointment(false);
      loadAppointments();
      alert('Randevu başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Randevu oluşturulamadı:', error);
      alert('Randevu oluşturulamadı!');
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      loadAppointments();
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadAppointments();
    } catch (error) {
      console.error('Randevu silinemedi:', error);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const getAppointmentsForDay = (day: number) => {
    const dateToCheck = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.getDate() === day &&
             aptDate.getMonth() === selectedDate.getMonth() &&
             aptDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Bekliyor' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Onaylandı' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'İptal' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Tamamlandı' },
    no_show: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Gelmedi' }
  };

  const meetingTypeIcons: Record<string, any> = {
    in_person: MapPin,
    video_call: Video,
    phone_call: Phone
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedDate);
    const firstDay = getFirstDayOfMonth(selectedDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-gray-50"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppointments = getAppointmentsForDay(day);
      const isToday = new Date().getDate() === day &&
                     new Date().getMonth() === selectedDate.getMonth() &&
                     new Date().getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`h-28 border border-gray-200 p-2 hover:bg-gray-50 transition ${
            isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-16">
            {dayAppointments.map((apt) => {
              const status = statusColors[apt.status];
              return (
                <button
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className={`w-full text-left text-xs px-2 py-1 rounded ${status.bg} ${status.text} hover:opacity-80 transition truncate`}
                >
                  {new Date(apt.appointment_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - {apt.title}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    return aptDate > today && apt.status !== 'cancelled';
  }).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Randevu Yönetimi</h2>
          <p className="text-gray-600 mt-1">Randevularınızı görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setShowNewAppointment(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Randevu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Bugün</div>
          <div className="text-2xl font-bold text-gray-900">{todayAppointments.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Yaklaşan</div>
          <div className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Bekleyen</div>
          <div className="text-2xl font-bold text-yellow-600">
            {appointments.filter(a => a.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Toplam (Bu Ay)</div>
          <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === 'calendar'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Takvim
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            viewMode === 'list'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Liste
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0">
            {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map((day) => (
              <div key={day} className="text-center p-2 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Yaklaşan Randevular</h3>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Yaklaşan randevu yok</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.map((apt) => {
                const status = statusColors[apt.status];
                const Icon = meetingTypeIcons[apt.meeting_type];
                return (
                  <div key={apt.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <h4 className="font-semibold text-gray-900">{apt.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 ml-8">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {new Date(apt.appointment_date).toLocaleString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} ({apt.duration} dk)
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {apt.customer_name}
                          </div>
                          {apt.customer_phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {apt.customer_phone}
                            </div>
                          )}
                          {apt.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {apt.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Onayla"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="İptal Et"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Detay"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteAppointment(apt.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Yeni Randevu Oluştur</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Örn: Konut Görüşmesi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarih *
                  </label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saat *
                  </label>
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Süre (Dakika)
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={30}>30 dakika</option>
                    <option value={60}>1 saat</option>
                    <option value={90}>1.5 saat</option>
                    <option value={120}>2 saat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Görüşme Tipi
                  </label>
                  <select
                    value={formData.meeting_type}
                    onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="in_person">Yüz Yüze</option>
                    <option value="video_call">Video Görüşme</option>
                    <option value="phone_call">Telefon</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konum / Adres
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Örn: Ofis, veya adres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Müşteri Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {formData.meeting_type === 'video_call' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Görüşme Linki
                    </label>
                    <input
                      type="url"
                      value={formData.meeting_link}
                      onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Randevu hakkında notlar..."
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowNewAppointment(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                İptal
              </button>
              <button
                onClick={createAppointment}
                disabled={!formData.title || !formData.appointment_date || !formData.appointment_time || !formData.customer_name}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Randevu Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Randevu Detayı</h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedAppointment.title}</h4>
                {selectedAppointment.description && (
                  <p className="text-gray-600 mt-1">{selectedAppointment.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Tarih & Saat</div>
                  <div className="font-medium text-gray-900">
                    {new Date(selectedAppointment.appointment_date).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Süre</div>
                  <div className="font-medium text-gray-900">{selectedAppointment.duration} dakika</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Müşteri</div>
                  <div className="font-medium text-gray-900">{selectedAppointment.customer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Durum</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedAppointment.status].bg} ${statusColors[selectedAppointment.status].text}`}>
                      {statusColors[selectedAppointment.status].label}
                    </span>
                  </div>
                </div>
                {selectedAppointment.customer_phone && (
                  <div>
                    <div className="text-sm text-gray-600">Telefon</div>
                    <div className="font-medium text-gray-900">{selectedAppointment.customer_phone}</div>
                  </div>
                )}
                {selectedAppointment.customer_email && (
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium text-gray-900">{selectedAppointment.customer_email}</div>
                  </div>
                )}
                {selectedAppointment.location && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">Konum</div>
                    <div className="font-medium text-gray-900">{selectedAppointment.location}</div>
                  </div>
                )}
                {selectedAppointment.meeting_link && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">Görüşme Linki</div>
                    <a
                      href={selectedAppointment.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {selectedAppointment.meeting_link}
                    </a>
                  </div>
                )}
                {selectedAppointment.notes && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-600">Notlar</div>
                    <div className="font-medium text-gray-900">{selectedAppointment.notes}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => deleteAppointment(selectedAppointment.id)}
                className="px-6 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Sil
              </button>
              <div className="flex items-center gap-3">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, 'cancelled');
                        setSelectedAppointment(null);
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      İptal Et
                    </button>
                    <button
                      onClick={() => {
                        updateAppointmentStatus(selectedAppointment.id, 'confirmed');
                        setSelectedAppointment(null);
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Onayla
                    </button>
                  </>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      updateAppointmentStatus(selectedAppointment.id, 'completed');
                      setSelectedAppointment(null);
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Tamamlandı İşaretle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
