'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { FileText, DollarSign, Calendar, Filter, Download, Plus, Check, Clock, AlertCircle, XCircle, Eye, CreditCard } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type Agent = Database['public']['Tables']['agents']['Row'];

interface Invoice {
  id: string;
  invoice_number: string;
  agent_id: string;
  license_id: string | null;
  issue_date: string;
  due_date: string;
  amount: number;
  tax_rate: number;
  tax_amount: number | null;
  total_amount: number;
  currency: string | null;
  status: string;
  payment_method: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  agents?: Agent;
}

interface InvoiceStats {
  total: number;
  pending: number;
  paid: number;
  overdue: number;
  totalRevenue: number;
  pendingAmount: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState<InvoiceStats>({
    total: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
    totalRevenue: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    loadInvoices();
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Agents load error:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          agents (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const invoicesData = data || [];
      setInvoices(invoicesData);

      // Calculate stats
      const stats: InvoiceStats = {
        total: invoicesData.length,
        pending: invoicesData.filter(i => i.status === 'pending').length,
        paid: invoicesData.filter(i => i.status === 'paid').length,
        overdue: invoicesData.filter(i => i.status === 'overdue').length,
        totalRevenue: invoicesData
          .filter(i => i.status === 'paid')
          .reduce((sum, i) => sum + i.total_amount, 0),
        pendingAmount: invoicesData
          .filter(i => i.status === 'pending' || i.status === 'overdue')
          .reduce((sum, i) => sum + i.total_amount, 0)
      };

      setStats(stats);
    } catch (error) {
      console.error('Invoices load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, {label: string, color: string, bg: string, icon: any}> = {
      pending: { label: 'Beklemede', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
      paid: { label: 'Ödendi', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: Check },
      overdue: { label: 'Gecikmiş', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertCircle },
      cancelled: { label: 'İptal', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: XCircle }
    };
    return configs[status] || configs.pending;
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    return invoice.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fatura Yönetimi</h1>
            <p className="text-sm text-gray-600 mt-1">Faturaları ve ödemeleri yönetin</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Fatura
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Invoices */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Toplam Fatura</span>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Tüm kayıtlar</div>
          </div>

          {/* Pending */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Beklemede</span>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">₺{stats.pendingAmount.toLocaleString('tr-TR')}</div>
          </div>

          {/* Paid */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Ödendi</span>
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
            <div className="text-xs text-gray-500 mt-1">₺{stats.totalRevenue.toLocaleString('tr-TR')}</div>
          </div>

          {/* Overdue */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Gecikmiş</span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-xs text-gray-500 mt-1">Ödeme bekleniyor</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtrele:</span>
        {[
          { key: 'all', label: 'Tümü' },
          { key: 'pending', label: 'Beklemede' },
          { key: 'paid', label: 'Ödendi' },
          { key: 'overdue', label: 'Gecikmiş' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filterStatus === key
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Fatura No</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Danışman</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Vade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Tutar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Durum</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                    Fatura bulunamadı
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  const StatusIcon = statusConfig.icon;
                  const daysUntilDue = getDaysUntilDue(invoice.due_date);

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{invoice.invoice_number}</div>
                        {invoice.description && (
                          <div className="text-xs text-gray-500 truncate max-w-xs">{invoice.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.agents?.name || 'Bilinmiyor'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoice.agents?.domain}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(invoice.issue_date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {new Date(invoice.due_date).toLocaleDateString('tr-TR')}
                        </div>
                        {invoice.status === 'pending' && (
                          <div className={`text-xs mt-0.5 ${daysUntilDue < 0 ? 'text-red-600' : daysUntilDue <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                            {daysUntilDue < 0 
                              ? `${Math.abs(daysUntilDue)} gün geçti`
                              : `${daysUntilDue} gün kaldı`
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">
                          ₺{invoice.total_amount.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          KDV Dahil
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md border ${statusConfig.bg} ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition"
                            title="PDF İndir"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {invoice.status === 'pending' && (
                            <button
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                              title="Ödeme Kaydet"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
