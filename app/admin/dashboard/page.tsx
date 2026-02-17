'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, FileText, TrendingUp, Building2, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react';
import { Database } from '@/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalLeads: number;
  newLeadsToday: number;
  weeklyGrowth: number;
}

interface DailyLeads {
  date: string;
  count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0,
    activeAgents: 0,
    totalLeads: 0,
    newLeadsToday: 0,
    weeklyGrowth: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyLeads[]>([]);
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

      // Geçen hafta leadler (growth hesapla)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const { count: lastWeekLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString());

      const weeklyGrowth = lastWeekLeads && lastWeekLeads > 0 
        ? Math.round(((newLeadsToday || 0) / lastWeekLeads) * 100) 
        : 0;

      // Son 10 lead
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentLeads(leads || []);

      // Son 7 gün data
      const dailyData: DailyLeads[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDay.toISOString());

        dailyData.push({
          date: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
          count: count || 0
        });
      }

      setWeeklyData(dailyData);

      setStats({
        totalAgents: totalAgents || 0,
        activeAgents: activeAgents || 0,
        totalLeads: totalLeads || 0,
        newLeadsToday: newLeadsToday || 0,
        weeklyGrowth,
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

  const maxLeads = Math.max(...weeklyData.map(d => d.count), 1);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Sistem performansı ve son aktiviteler</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isGrowth = stat.title === 'Bugünkü Leadler';
          return (
            <div key={stat.title} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-600">{stat.title}</span>
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                {isGrowth && stats.weeklyGrowth > 0 && (
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    <span>{stats.weeklyGrowth}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Haftalık Trend</h2>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex items-center">
                <div className="w-12 text-xs text-gray-600">{day.date}</div>
                <div className="flex-1 ml-4">
                  <div className="h-8 bg-gray-100 rounded relative overflow-hidden">
                    <div 
                      className="h-full bg-gray-900 transition-all duration-500"
                      style={{ width: `${(day.count / maxLeads) * 100}%` }}
                    ></div>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
                      {day.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900">Son Leadler</h2>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Henüz lead yok</p>
            ) : (
              recentLeads.slice(0, 8).map((lead) => (
                <div key={lead.id} className="pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{lead.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{lead.phone}</div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentLeads.length > 0 && (
            <a 
              href="/admin/leads"
              className="mt-4 block text-center text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Tümünü Görüntüle →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
