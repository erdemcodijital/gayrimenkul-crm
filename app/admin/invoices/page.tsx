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
  const [createForm, setCreateForm] = useState({
    agent_id: '',
    amount: '',
    description: '',
    due_days: '30',
    notes: ''
  });
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

  const createInvoice = async () => {
    if (!createForm.agent_id || !createForm.amount) {
      toast.error('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      // Get invoice number
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number');

      if (!invoiceNumber) {
        throw new Error('Fatura numarası oluşturulamadı');
      }

      const amount = parseFloat(createForm.amount);
      const taxRate = 20; // %20 KDV
      const taxAmount = amount * (taxRate / 100);
      const totalAmount = amount + taxAmount;

      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(createForm.due_days));

      const { error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          agent_id: createForm.agent_id,
          issue_date: issueDate.toISOString(),
          due_date: dueDate.toISOString(),
          amount: amount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          currency: 'TRY',
          status: 'pending',
          description: createForm.description || null,
          notes: createForm.notes || null
        });

      if (error) throw error;

      toast.success('Fatura başarıyla oluşturuldu');
      setShowCreateModal(false);
      setCreateForm({
        agent_id: '',
        amount: '',
        description: '',
        due_days: '30',
        notes: ''
      });
      await loadInvoices();
    } catch (error: any) {
      console.error('Create invoice error:', error);
      toast.error('Fatura oluşturulamadı: ' + (error.message || ''));
    }
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

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Yeni Fatura Oluştur</h3>
              <p className="text-sm text-gray-600 mt-1">Fatura bilgilerini girin</p>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Agent Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Danışman <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.agent_id}
                  onChange={(e) => setCreateForm({ ...createForm, agent_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                >
                  <option value="">Danışman seçin</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {agent.domain}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tutar (KDV Hariç) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                  <input
                    type="number"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="5000"
                    required
                  />
                </div>
                {createForm.amount && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Tutar (KDV Hariç):</span>
                      <span className="font-medium">₺{parseFloat(createForm.amount).toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">KDV (%20):</span>
                      <span className="font-medium">₺{(parseFloat(createForm.amount) * 0.2).toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-900">Toplam (KDV Dahil):</span>
                        <span className="text-lg font-bold text-blue-600">
                          ₺{(parseFloat(createForm.amount) * 1.2).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Due Days */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Vade Süresi (Gün)
                </label>
                <select
                  value={createForm.due_days}
                  onChange={(e) => setCreateForm({ ...createForm, due_days: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="7">7 gün</option>
                  <option value="15">15 gün</option>
                  <option value="30">30 gün</option>
                  <option value="60">60 gün</option>
                  <option value="90">90 gün</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Örn: Aylık lisans ücreti"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notlar
                </label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Ek notlar..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    agent_id: '',
                    amount: '',
                    description: '',
                    due_days: '30',
                    notes: ''
                  });
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                İptal
              </button>
              <button
                onClick={createInvoice}
                className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition shadow-lg"
              >
                Fatura Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

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
