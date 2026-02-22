'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity, 
  Clock,
  Home,
  Globe,
  MapPin,
  UserPlus,
  Eye,
  PieChart,
  DollarSign,
  Award,
  Target
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalLeads: number;
  totalProperties: number;
  totalDomains: number;
  newLeadsToday: number;
  weeklyGrowth: number;
}

interface DailyLeads {
  date: string;
  count: number;
}

interface LeadStatus {
  status: string;
  count: number;
  color: string;
}

interface CityStats {
  city: string;
  count: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0,
    activeAgents: 0,
    totalLeads: 0,
    totalProperties: 0,
    totalDomains: 0,
    newLeadsToday: 0,
    weeklyGrowth: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentAgents, setRecentAgents] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<DailyLeads[]>([]);
  const [leadStatusData, setLeadStatusData] = useState<LeadStatus[]>([]);
  const [cityData, setCityData] = useState<CityStats[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState({
    monthly: 0,
    yearly: 0,
    growth: 0
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

      // Toplam ilan sayısı
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Toplam domain sayısı
      const { count: totalDomains } = await supabase
        .from('agents')
        .select('domain', { count: 'exact', head: true })
        .not('domain', 'is', null);

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

      // Son 5 lead
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentLeads(leads || []);

      // Son 5 agent
      const { data: agents } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentAgents(agents || []);

      // Son 30 gün lead trend
      const dailyData: DailyLeads[] = [];
      for (let i = 29; i >= 0; i--) {
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
          date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
          count: count || 0
        });
      }

      setWeeklyData(dailyData);

      // Lead status dağılımı
      const statusMapping: Record<string, {color: string, label: string}> = {
        'new': { color: '#3B82F6', label: 'Yeni' },
        'contacted': { color: '#8B5CF6', label: 'İletişimde' },
        'meeting': { color: '#F59E0B', label: 'Görüşme' },
        'successful': { color: '#10B981', label: 'Başarılı' },
        'cancelled': { color: '#EF4444', label: 'İptal' }
      };

      const statusData: LeadStatus[] = [];
      for (const [status, info] of Object.entries(statusMapping)) {
        const { count } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', status);

        if (count && count > 0) {
          statusData.push({
            status: info.label,
            count: count,
            color: info.color
          });
        }
      }

      setLeadStatusData(statusData);

      // Şehir bazlı dağılım (Top 5)
      const { data: cityLeads } = await supabase
        .from('leads')
        .select('district');

      const cityCounts: Record<string, number> = {};
      cityLeads?.forEach((lead: any) => {
        if (lead.district) {
          cityCounts[lead.district] = (cityCounts[lead.district] || 0) + 1;
        }
      });

      const topCities: CityStats[] = Object.entries(cityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([city, count]) => ({ city, count }));

      setCityData(topCities);

      // Top 5 Performers (Agent'lara göre lead sayısı)
      const { data: agentLeads } = await supabase
        .from('leads')
        .select('agent_id, agents(name, domain)');

      const agentCounts: Record<string, {name: string, domain: string, count: number}> = {};
      agentLeads?.forEach((lead: any) => {
        if (lead.agent_id && lead.agents) {
          const key = lead.agent_id;
          if (!agentCounts[key]) {
            agentCounts[key] = {
              name: lead.agents.name,
              domain: lead.agents.domain,
              count: 0
            };
          }
          agentCounts[key].count++;
        }
      });

      const topPerformersData = Object.values(agentCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopPerformers(topPerformersData);

      // Conversion Funnel
      const newCount = leadStatusData.find(s => s.status === 'Yeni')?.count || 0;
      const contactedCount = leadStatusData.find(s => s.status === 'İletişimde')?.count || 0;
      const meetingCount = leadStatusData.find(s => s.status === 'Görüşme')?.count || 0;
      const successfulCount = leadStatusData.find(s => s.status === 'Başarılı')?.count || 0;

      setConversionFunnel([
        { stage: 'Yeni Leadler', value: newCount, fill: '#3b82f6' },
        { stage: 'İletişimde', value: contactedCount, fill: '#8b5cf6' },
        { stage: 'Görüşme', value: meetingCount, fill: '#f59e0b' },
        { stage: 'Başarılı', value: successfulCount, fill: '#10b981' },
      ]);

      // Revenue Data (Licenses'tan)
      const { data: licenses } = await supabase
        .from('licenses')
        .select('price, billing_cycle, status')
        .eq('status', 'active');

      const monthlyRevenue = licenses?.reduce((sum, lic) => {
        const price = lic.price || 0;
        return sum + (lic.billing_cycle === 'monthly' ? price : price / 12);
      }, 0) || 0;

      const yearlyRevenue = monthlyRevenue * 12;

      setRevenueData({
        monthly: monthlyRevenue,
        yearly: yearlyRevenue,
        growth: stats.weeklyGrowth
      });

      setStats({
        totalAgents: totalAgents || 0,
        activeAgents: activeAgents || 0,
        totalLeads: totalLeads || 0,
        totalProperties: totalProperties || 0,
        totalDomains: totalDomains || 0,
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
      subtitle: `${stats.activeAgents} aktif`,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      link: '/admin/agents'
    },
    {
      title: 'Toplam Lead',
      value: stats.totalLeads,
      subtitle: `${stats.newLeadsToday} bugün`,
      icon: FileText,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      link: '/admin/leads'
    },
    {
      title: 'Toplam İlan',
      value: stats.totalProperties,
      subtitle: 'Aktif ilanlar',
      icon: Home,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      link: '#'
    },
    {
      title: 'Aktif Domain',
      value: stats.totalDomains,
      subtitle: 'Bağlı domainler',
      icon: Globe,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      link: '/admin/domains'
    },
  ];

  const revenueCards = [
    {
      title: 'Aylık Gelir (MRR)',
      value: `₺${revenueData.monthly.toLocaleString('tr-TR')}`,
      subtitle: 'Tekrarlayan',
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: revenueData.growth,
      changeType: revenueData.growth > 0 ? 'up' : 'down'
    },
    {
      title: 'Yıllık Gelir Projesi',
      value: `₺${revenueData.yearly.toLocaleString('tr-TR')}`,
      subtitle: 'Tahmini',
      icon: TrendingUp,
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
  ];

  const quickActions = [
    { icon: UserPlus, label: 'Yeni Danışman', link: '/admin/agents', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Eye, label: 'Leadleri Görüntüle', link: '/admin/leads', color: 'bg-purple-600 hover:bg-purple-700' },
    { icon: Globe, label: 'Domain Yönetimi', link: '/admin/domains', color: 'bg-green-600 hover:bg-green-700' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  const maxLeads = Math.max(...weeklyData.map(d => d.count), 1);
  const totalLeadStatus = leadStatusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Hoş geldiniz! İşte sistemin genel durumu.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.link}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  {stat.title === 'Toplam Lead' && stats.weeklyGrowth > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                      <ArrowUpRight className="w-4 h-4" />
                      {stats.weeklyGrowth}%
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.title}</div>
                  <div className="text-xs text-gray-400">{stat.subtitle}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.link}>
                <button className={`w-full ${action.color} text-white px-6 py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 transform shadow-md`}>
                  <Icon className="w-5 h-5" />
                  {action.label}
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lead Trend</h2>
              <p className="text-sm text-gray-500 mt-1">Son 30 günlük lead akışı</p>
            </div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            {weeklyData.map((day, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-xs text-gray-600 font-medium">{day.date}</div>
                <div className="flex-1">
                  <div className="h-10 bg-gray-50 rounded-lg relative overflow-hidden hover:bg-gray-100 transition">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${Math.max((day.count / maxLeads) * 100, 3)}%` }}
                    ></div>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-700">
                      {day.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Status Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lead Durumları</h2>
              <p className="text-sm text-gray-500 mt-1">Durum dağılımı</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          {leadStatusData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="space-y-4">
              {leadStatusData.map((status, i) => {
                const percentage = totalLeadStatus > 0 ? Math.round((status.count / totalLeadStatus) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                        <span className="text-sm font-medium text-gray-700">{status.status}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{status.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: status.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Distribution */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Şehir Dağılımı</h2>
              <p className="text-sm text-gray-500 mt-1">Top 5 şehir</p>
            </div>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          
          {cityData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="space-y-4">
              {cityData.map((city, i) => {
                const maxCount = Math.max(...cityData.map(c => c.count));
                const percentage = (city.count / maxCount) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{city.city}</span>
                      <span className="text-sm font-bold text-gray-900">{city.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Son Leadler</h2>
              <p className="text-sm text-gray-500 mt-1">En son 5 lead</p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentLeads.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Henüz lead yok</p>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{lead.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{lead.phone}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(lead.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recentLeads.length > 0 && (
            <Link 
              href="/admin/leads"
              className="mt-6 block text-center text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              Tümünü Görüntüle →
            </Link>
          )}
        </div>

        {/* Recent Agents */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Son Danışmanlar</h2>
              <p className="text-sm text-gray-500 mt-1">Yeni katılanlar</p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          
          {recentAgents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Henüz danışman yok</p>
          ) : (
            <div className="space-y-4">
              {recentAgents.map((agent: any) => (
                <div key={agent.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{agent.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{agent.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(agent.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  {agent.is_active && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {recentAgents.length > 0 && (
            <Link 
              href="/admin/agents"
              className="mt-6 block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Tümünü Görüntüle →
            </Link>
          )}
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {revenueCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                {card.change !== undefined && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${card.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.changeType === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">{card.value}</div>
                <div className="text-sm text-gray-500">{card.title}</div>
                <div className="text-xs text-gray-400">{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Table */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
              <p className="text-sm text-gray-500 mt-1">En çok lead alan danışmanlar</p>
            </div>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          
          {topPerformers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{performer.name}</div>
                    <div className="text-xs text-gray-500 truncate">{performer.domain}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-bold text-gray-900">{performer.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Lead Dönüşüm Hunisi</h2>
              <p className="text-sm text-gray-500 mt-1">Satış hunisi analizi</p>
            </div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          
          {conversionFunnel.every(item => item.value === 0) ? (
            <p className="text-sm text-gray-500 text-center py-8">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {conversionFunnel.map((stage, index) => {
                const total = conversionFunnel[0].value || 1;
                const percentage = ((stage.value / total) * 100).toFixed(0);
                const prevValue = index > 0 ? conversionFunnel[index - 1].value : stage.value;
                const dropoff = prevValue > 0 ? ((prevValue - stage.value) / prevValue * 100).toFixed(0) : 0;
                
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                        {index > 0 && dropoff > 0 && (
                          <span className="text-xs text-red-600 font-medium">-{dropoff}%</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{stage.value}</span>
                        <span className="text-xs text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-10 rounded-lg overflow-hidden bg-gray-100">
                      <div
                        className="h-full flex items-center justify-center text-white text-sm font-semibold transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: stage.fill,
                          minWidth: stage.value > 0 ? '40px' : '0'
                        }}
                      >
                        {stage.value > 0 && stage.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
    </div>
  );
}
