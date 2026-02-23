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
  payment_method: string | null;
  currency: string | null;
  created_at: string;
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
  
  // Page border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);
  
  // Header Background
  doc.setFillColor(41, 128, 185); // Professional blue
  doc.rect(10, 10, 190, 35, 'F');
  
  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('GAYRIMENKUL CRM', 15, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Profesyonel Emlak Yonetim Sistemi', 15, 32);
  doc.text('www.gayrimenkulcrm.com', 15, 38);
  
  // Invoice type badge
  doc.setFillColor(231, 76, 60); // Red
  doc.roundedRect(155, 15, 40, 12, 2, 2, 'F');
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURA', 175, 23, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Company Information Box (Left)
  let y = 55;
  const leftX = 15;
  const rightX = 110;
  
  // Company Details Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(leftX, y, 85, 35, 2, 2, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(leftX, y, 85, 35, 2, 2, 'S');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text('FATURA VEREN:', leftX + 3, y + 5);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Gayrimenkul CRM', leftX + 3, y + 11);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Adres: Merkez Mah. Teknoloji Cad. No:123', leftX + 3, y + 16);
  doc.text('Istanbul / Turkiye', leftX + 3, y + 20);
  doc.text('Tel: +90 212 555 00 00', leftX + 3, y + 24);
  doc.text('Vergi No: 1234567890', leftX + 3, y + 28);
  doc.text('Email: info@gayrimenkulcrm.com', leftX + 3, y + 32);
  
  // Customer Details Box (Right)
  if (invoice.agents) {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(rightX, y, 85, 35, 2, 2, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(rightX, y, 85, 35, 2, 2, 'S');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 73, 94);
    doc.text('FATURA ALAN:', rightX + 3, y + 5);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.agents.name, rightX + 3, y + 11);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let customerY = y + 16;
    
    if (invoice.agents.domain) {
      doc.text(`Domain: ${invoice.agents.domain}`, rightX + 3, customerY);
      customerY += 4;
    }
    if (invoice.agents.city) {
      doc.text(`Sehir: ${invoice.agents.city}`, rightX + 3, customerY);
      customerY += 4;
    }
    if (invoice.agents.phone) {
      doc.text(`Tel: ${invoice.agents.phone}`, rightX + 3, customerY);
      customerY += 4;
    }
    doc.text(`Email: ${invoice.agents.email}`, rightX + 3, customerY);
  }
  
  // Invoice Information Box
  y = 95;
  doc.setFillColor(52, 152, 219);
  doc.rect(leftX, y, 180, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('FATURA BILGILERI', leftX + 3, y + 5);
  
  y += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Invoice details in grid
  const col1X = leftX + 3;
  const col2X = leftX + 65;
  const col3X = leftX + 125;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Fatura No:', col1X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_number, col1X + 22, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tarih:', col2X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.issue_date).toLocaleDateString('tr-TR'), col2X + 15, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Vade:', col3X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.due_date).toLocaleDateString('tr-TR'), col3X + 15, y);
  
  y += 5;
  const statusText = invoice.status === 'paid' ? 'ODENDI' : 
                     invoice.status === 'pending' ? 'BEKLEMEDE' : 'GECIKMIS';
  const statusColor = invoice.status === 'paid' ? [46, 204, 113] : 
                      invoice.status === 'pending' ? [241, 196, 15] : [231, 76, 60];
  
  doc.setFont('helvetica', 'bold');
  doc.text('Durum:', col1X, y);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(statusText, col1X + 22, y);
  doc.setTextColor(0, 0, 0);
  
  if (invoice.payment_method) {
    doc.setFont('helvetica', 'bold');
    doc.text('Odeme:', col2X, y);
    doc.setFont('helvetica', 'normal');
    const paymentMethod = invoice.payment_method === 'bank_transfer' ? 'Banka Havalesi' :
                          invoice.payment_method === 'credit_card' ? 'Kredi Karti' : 'Nakit';
    doc.text(paymentMethod, col2X + 15, y);
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Para Birimi:', col3X, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.currency || 'TRY', col3X + 22, y);
  
  // Items Table
  y = 120;
  
  // Table Header
  doc.setFillColor(52, 152, 219);
  doc.rect(leftX, y, 180, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('HIZMET / URUN ACIKLAMASI', leftX + 3, y + 6);
  doc.text('MIKTAR', leftX + 120, y + 6);
  doc.text('TUTAR', leftX + 150, y + 6);
  
  y += 10;
  doc.setTextColor(0, 0, 0);
  
  // Table row
  doc.setFillColor(250, 250, 250);
  doc.rect(leftX, y, 180, 12, 'F');
  doc.setDrawColor(220, 220, 220);
  doc.rect(leftX, y, 180, 12, 'S');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const serviceDescription = invoice.description || 'Aylık Lisans Ucreti';
  const wrappedDescription = doc.splitTextToSize(serviceDescription, 110);
  doc.text(wrappedDescription, leftX + 3, y + 7);
  
  doc.text('1', leftX + 125, y + 7);
  doc.text(invoice.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }), leftX + 175, y + 7, { align: 'right' });
  
  y += 12;
  
  // Summary Box
  y += 10;
  const summaryX = leftX + 105;
  const summaryWidth = 90;
  
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(summaryX, y, summaryWidth, 30, 2, 2, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(summaryX, y, summaryWidth, 30, 2, 2, 'S');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Subtotal
  let summaryY = y + 6;
  doc.text('Ara Toplam:', summaryX + 3, summaryY);
  doc.text(invoice.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL', summaryX + summaryWidth - 3, summaryY, { align: 'right' });
  
  // Tax
  summaryY += 6;
  doc.text(`KDV (%${invoice.tax_rate}):`, summaryX + 3, summaryY);
  doc.text((invoice.tax_amount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL', summaryX + summaryWidth - 3, summaryY, { align: 'right' });
  
  // Line separator
  summaryY += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(summaryX + 3, summaryY, summaryX + summaryWidth - 3, summaryY);
  
  // Total
  summaryY += 6;
  doc.setFillColor(46, 204, 113);
  doc.roundedRect(summaryX, summaryY - 4, summaryWidth, 10, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('GENEL TOPLAM:', summaryX + 3, summaryY + 2);
  doc.text(invoice.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' TL', summaryX + summaryWidth - 3, summaryY + 2, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  
  // Notes section
  if (invoice.notes) {
    y += 50;
    doc.setFillColor(255, 243, 205);
    doc.roundedRect(leftX, y, 180, 25, 2, 2, 'F');
    doc.setDrawColor(255, 193, 7);
    doc.roundedRect(leftX, y, 180, 25, 2, 2, 'S');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(52, 73, 94);
    doc.text('NOTLAR:', leftX + 3, y + 5);
    
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(invoice.notes, 170);
    doc.text(splitNotes, leftX + 3, y + 10);
  }
  
  // Payment instructions
  y = 230;
  doc.setFillColor(236, 240, 241);
  doc.roundedRect(leftX, y, 180, 25, 2, 2, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 73, 94);
  doc.text('ODEME BILGILERI:', leftX + 3, y + 5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Banka: Turkiye Is Bankasi', leftX + 3, y + 10);
  doc.text('IBAN: TR00 0000 0000 0000 0000 0000 00', leftX + 3, y + 14);
  doc.text('Hesap Adi: Gayrimenkul CRM Ltd. Sti.', leftX + 3, y + 18);
  doc.text('Lutfen odeme aciklamasina fatura numarasini yaziniz.', leftX + 3, y + 22);
  
  // Footer
  y = 270;
  doc.setFillColor(52, 73, 94);
  doc.rect(10, y, 190, 17, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Bu fatura elektronik ortamda olusturulmustur ve gecerlidir.', 105, y + 6, { align: 'center' });
  doc.text('Gayrimenkul CRM - Profesyonel Emlak Yonetim Sistemi', 105, y + 10, { align: 'center' });
  doc.text(`Olusturma Tarihi: ${new Date(invoice.created_at).toLocaleString('tr-TR')}`, 105, y + 14, { align: 'center' });
  
  // Save PDF
  doc.save(`Fatura_${invoice.invoice_number}.pdf`);
};
