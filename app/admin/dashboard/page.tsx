'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, FileText, TrendingUp, Building2 } from 'lucide-react';

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalLeads: number;
  newLeadsToday: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0,
    activeAgents: 0,
    totalLeads: 0,
    newLeadsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Toplam danışman sayısı
      const { count: totalAgents } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true });

      // Aktif danışman sayısı
      const { count: activeAgents } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Toplam lead sayısı
      const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Bugünkü leadler
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newLeadsToday } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setStats({
        totalAgents: totalAgents || 0,
        activeAgents: activeAgents || 0,
        totalLeads: totalLeads || 0,
        newLeadsToday: newLeadsToday || 0,
      });
    } catch (error) {
      console.error('Stats yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Toplam Danışman',
      value: stats.totalAgents,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Aktif Danışman',
      value: stats.activeAgents,
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Toplam Lead',
      value: stats.totalLeads,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Bugünkü Leadler',
      value: stats.newLeadsToday,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Sistem istatistiklerine genel bakış</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/agents"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Danışman Yönetimi</h3>
            <p className="text-sm text-gray-600">Yeni danışman ekle veya mevcut danışmanları düzenle</p>
          </a>
          <a
            href="/admin/leads"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Lead Görüntüle</h3>
            <p className="text-sm text-gray-600">Tüm leadleri görüntüle ve filtrele</p>
          </a>
          <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-2">Raporlar</h3>
            <p className="text-sm text-gray-600">Yakında eklenecek...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
