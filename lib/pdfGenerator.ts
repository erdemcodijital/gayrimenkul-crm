import jsPDF from 'jspdf';

interface Invoice {
  invoice_number: string;
  issue_date: string;
  due_date: string;
  amount: number;
  tax_rate: number;
  tax_amount: number | null;
  total_amount: number;
  status: string;
  description: string | null;
  notes: string | null;
  agents?: {
    name: string;
    email: string;
    phone: string | null;
    city: string | null;
    domain: string | null;
  };
}

export const generateInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('GAYRIMENKUL CRM', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Emlak Yonetim Sistemi', 105, 27, { align: 'center' });
  doc.text('www.gayrimenkulcrm.com', 105, 32, { align: 'center' });
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURA', 105, 45, { align: 'center' });
  
  // Invoice Details Box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Left side - Invoice Info
  const leftX = 20;
  let y = 60;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Fatura Bilgileri:', leftX, y);
  y += 7;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Fatura No: ${invoice.invoice_number}`, leftX, y);
  y += 6;
  doc.text(`Tarih: ${new Date(invoice.issue_date).toLocaleDateString('tr-TR')}`, leftX, y);
  y += 6;
  doc.text(`Vade: ${new Date(invoice.due_date).toLocaleDateString('tr-TR')}`, leftX, y);
  y += 6;
  doc.text(`Durum: ${invoice.status === 'paid' ? 'Odendi' : invoice.status === 'pending' ? 'Beklemede' : 'Gecikmis'}`, leftX, y);
  
  // Right side - Customer Info
  const rightX = 120;
  y = 60;
  
  if (invoice.agents) {
    doc.setFont('helvetica', 'bold');
    doc.text('Musteri Bilgileri:', rightX, y);
    y += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Ad: ${invoice.agents.name}`, rightX, y);
    y += 6;
    doc.text(`Email: ${invoice.agents.email}`, rightX, y);
    y += 6;
    if (invoice.agents.phone) {
      doc.text(`Tel: ${invoice.agents.phone}`, rightX, y);
      y += 6;
    }
    if (invoice.agents.city) {
      doc.text(`Sehir: ${invoice.agents.city}`, rightX, y);
      y += 6;
    }
  }
  
  // Description
  y = 110;
  if (invoice.description) {
    doc.setFont('helvetica', 'bold');
    doc.text('Aciklama:', leftX, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    
    const splitDescription = doc.splitTextToSize(invoice.description, 170);
    doc.text(splitDescription, leftX, y);
    y += splitDescription.length * 5 + 5;
  }
  
  // Table Header
  y = Math.max(y, 130);
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, 170, 8, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Hizmet / Urun', 25, y + 5);
  doc.text('Tutar (TL)', 140, y + 5);
  
  y += 10;
  
  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.description || 'Lisans Ucreti', 25, y);
  doc.text(invoice.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }), 140, y);
  
  // Divider
  y += 8;
  doc.line(20, y, 190, y);
  
  // Subtotal
  y += 8;
  doc.text('Ara Toplam:', 120, y);
  doc.text(invoice.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL', 160, y, { align: 'right' });
  
  // Tax
  y += 6;
  doc.text(`KDV (%${invoice.tax_rate}):`, 120, y);
  doc.text((invoice.tax_amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL', 160, y, { align: 'right' });
  
  // Total
  y += 8;
  doc.setFillColor(240, 240, 240);
  doc.rect(115, y - 5, 75, 10, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOPLAM:', 120, y + 2);
  doc.text(invoice.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL', 185, y + 2, { align: 'right' });
  
  // Notes
  if (invoice.notes) {
    y += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notlar:', leftX, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, leftX, y);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Bu fatura elektronik olarak olusturulmustur.', 105, 280, { align: 'center' });
  doc.text('Gayrimenkul CRM - Profesyonel Emlak Yonetim Sistemi', 105, 285, { align: 'center' });
  
  // Save PDF
  doc.save(`Fatura_${invoice.invoice_number}.pdf`);
};
