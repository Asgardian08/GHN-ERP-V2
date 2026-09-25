import { jsPDF } from 'jspdf';
import { DatabaseSchema, MonthlyReport, Sale } from '../types/database';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(val: number, decimals: number = 0): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

/**
 * Generates the Official Monthly Executive PDF Report
 * Structure matches prompt:
 * - Cover
 * - Page 1: Executive Summary
 * - Page 2: Production Details
 * - Page 3: Sales & Customer Summary
 * - Page 4: Finance & Expense Breakdown
 * - Verification / Signature Page
 */
export function generateMonthlyReportPdf(report: MonthlyReport, dbData: DatabaseSchema) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [15, 81, 50]; // #0F5132 Deep Green
  const goldColor: [number, number, number] = [212, 175, 55]; // #D4AF37 Gold
  const charcoalColor: [number, number, number] = [31, 41, 55];
  const creamBg: [number, number, number] = [250, 249, 246];

  // ================= PAGE 1: COVER =================
  doc.setFillColor(...creamBg);
  doc.rect(0, 0, 210, 297, 'F');

  // Decorative border
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(1.5);
  doc.rect(15, 15, 180, 267);
  doc.setLineWidth(0.4);
  doc.rect(18, 18, 174, 261);

  // Brand Header
  doc.setFillColor(...primaryColor);
  doc.rect(25, 45, 160, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GHN EGG FARM NUSANTARA', 105, 58, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('INTEGRATED FARM OPERATING SYSTEM - GHN ERP LITE', 105, 65, { align: 'center' });

  // Main Title
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('LAPORAN RESMI EKSEKUTIF', 105, 120, { align: 'center' });

  doc.setFontSize(18);
  doc.setTextColor(...charcoalColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Produksi, Penjualan & Keuangan Farm', 105, 132, { align: 'center' });

  // Month Badge
  doc.setFillColor(...goldColor);
  doc.roundedRect(55, 145, 100, 16, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`PERIODE: ${report.monthName.toUpperCase()}`, 105, 156, { align: 'center' });

  // Meta box
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Lokasi: ${dbData.settings.address}`, 105, 220, { align: 'center' });
  doc.text(`Kontak: ${dbData.settings.phone} | ${dbData.settings.email}`, 105, 226, { align: 'center' });
  doc.text(`Waktu Tutup Buku: ${new Date(report.closedAt).toLocaleString('id-ID')}`, 105, 232, { align: 'center' });

  // Footer Cover
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('DOKUMEN RESMI INTERNAL - RAHASIA & BERLISENSI', 105, 260, { align: 'center' });

  // ================= PAGE 2: EXECUTIVE SUMMARY =================
  doc.addPage();
  renderReportHeader(doc, '1. EXECUTIVE SUMMARY & IKHTISAR KINERJA', report.monthName);

  let y = 45;
  doc.setFontSize(12);
  doc.setTextColor(...charcoalColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Kinerja Utama Farm (KPI)', 20, y);

  y += 8;
  // KPI Table Box
  const kpis = [
    { label: 'Populasi Ayam Rata-rata', value: `${formatNumber(report.population)} Ekor`, note: 'Ayam fase layer produktif' },
    { label: 'Total Produksi Butir Telur', value: `${formatNumber(report.totalEggs)} Butir`, note: 'Hasil sortir telur segar' },
    { label: 'Total Produksi Berat Telur', value: `${formatNumber(report.totalKg, 2)} Kg`, note: 'Rata-rata 63 gr/butir' },
    { label: 'Rata-rata HDP (Hen Day)', value: `${report.avgHdp.toFixed(2)} %`, note: 'Target standar farm: > 82%' },
    { label: 'Total Pendapatan (Revenue)', value: formatRupiah(report.totalRevenue), note: 'Penjualan telur & produk' },
    { label: 'Total Pengeluaran (Beban)', value: formatRupiah(report.totalExpense), note: 'Pakan, vitamin, listrik, dll.' },
    { label: 'Laba Bersih Operasional (Net Profit)', value: formatRupiah(report.netProfit), note: 'Margin keuntungan farm', highlight: true },
    { label: 'Total Transaksi Kasir POS', value: `${report.salesCount} Transaksi`, note: 'Distribusi grosir & langganan' },
    { label: 'Total Pre Order Masuk', value: `${report.preorderCount} Pesanan`, note: 'Pesanan pesanan inden telur' },
  ];

  kpis.forEach((kpi) => {
    if (kpi.highlight) {
      doc.setFillColor(232, 245, 233); // light green
      doc.rect(20, y - 5, 170, 11, 'F');
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.rect(20, y - 5, 170, 11);
      doc.setTextColor(...primaryColor);
    } else {
      doc.setFillColor(248, 249, 250);
      doc.rect(20, y - 5, 170, 9, 'F');
      doc.setTextColor(...charcoalColor);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(kpi.label, 24, y + 1);

    doc.setFont('helvetica', kpi.highlight ? 'bold' : 'bold');
    doc.text(kpi.value, 120, y + 1);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(kpi.note, 185, y + 1, { align: 'right' });

    y += kpi.highlight ? 13 : 11;
  });

  // Notes Box
  y += 5;
  doc.setFillColor(254, 249, 231); // warm gold/cream
  doc.roundedRect(20, y, 170, 30, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Evaluasi Manajemen Farm:', 25, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoalColor);
  doc.text(
    `Bulan ${report.monthName} menunjukkan kinerja yang sangat memuaskan dengan capaian HDP rata-rata ${report.avgHdp.toFixed(2)}% ` +
    `dan Laba Bersih mencapai ${formatRupiah(report.netProfit)}. Rasio konversi pakan (FCR) terkontrol dengan baik dan ketersediaan stok telur ` +
    `mendukung kelancaran distribusi ke seluruh mitra grosir dan bakery binaan GHN Farm.`,
    25,
    y + 13,
    { maxWidth: 160 }
  );

  // ================= PAGE 3: PRODUCTION =================
  doc.addPage();
  renderReportHeader(doc, '2. DATA HARIAN PRODUKSI TELUR & HDP', report.monthName);

  const monthProds = dbData.production
    .filter((p) => p.date.startsWith(report.monthYear))
    .slice(0, 18); // Table items

  y = 45;
  // Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Tanggal', 24, y + 5.5);
  doc.text('Populasi Ayam', 50, y + 5.5);
  doc.text('Butir Telur', 82, y + 5.5);
  doc.text('Berat (Kg)', 110, y + 5.5);
  doc.text('HDP (%)', 135, y + 5.5);
  doc.text('Gram/Butir', 160, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...charcoalColor);

  monthProds.forEach((prod, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(245, 247, 245);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(8);
    doc.text(prod.date, 24, y + 4.8);
    doc.text(`${formatNumber(prod.chickenCount)} ekor`, 50, y + 4.8);
    doc.text(`${formatNumber(prod.eggsCount)} btr`, 82, y + 4.8);
    doc.text(`${formatNumber(prod.eggWeightKg, 2)} kg`, 110, y + 4.8);
    doc.text(`${prod.hdp.toFixed(2)}%`, 135, y + 4.8);
    doc.text(`${prod.avgGramPerEgg.toFixed(1)} gr`, 160, y + 4.8);

    y += 7;
  });

  // Production Summary Banner
  y += 8;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(20, y, 170, 22, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total Produksi Telur Terdata: ${formatNumber(report.totalEggs)} Butir (${formatNumber(report.totalKg, 2)} Kg)`, 25, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Rata-rata Hen Day Production (HDP): ${report.avgHdp.toFixed(2)}% | Status: Produktivitas Sangat Baik`, 25, y + 16);

  // ================= PAGE 4: SALES =================
  doc.addPage();
  renderReportHeader(doc, '3. ANALISIS PENJUALAN & PELANGGAN TERATAS', report.monthName);

  y = 45;
  doc.setFontSize(11);
  doc.setTextColor(...charcoalColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Daftar Pelanggan Teratas (Top Customers by Volume)', 20, y);

  y += 6;
  doc.setFillColor(...primaryColor);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Nama Pelanggan', 24, y + 5.5);
  doc.text('Tipe', 85, y + 5.5);
  doc.text('Volume (Kg)', 115, y + 5.5);
  doc.text('Total Transaksi', 145, y + 5.5);
  doc.text('Piutang Sisa', 188, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...charcoalColor);

  const topCustomers = [...dbData.customers].sort((a, b) => b.totalSpent - a.totalSpent);
  topCustomers.slice(0, 6).forEach((c, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(245, 247, 245);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(8);
    doc.text(c.name, 24, y + 4.8);
    doc.text(c.type, 85, y + 4.8);
    doc.text(`${formatNumber(c.totalKg, 1)} kg`, 115, y + 4.8);
    doc.text(formatRupiah(c.totalSpent), 145, y + 4.8);
    doc.text(c.outstandingReceivable > 0 ? formatRupiah(c.outstandingReceivable) : 'Lunas', 188, y + 4.8, { align: 'right' });

    y += 7;
  });

  // Recent Sales Table
  y += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Riwayat Penjualan Terakhir Periode Ini', 20, y);

  y += 6;
  doc.setFillColor(...primaryColor);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('No. Faktur', 24, y + 5.5);
  doc.text('Tanggal', 65, y + 5.5);
  doc.text('Pelanggan', 90, y + 5.5);
  doc.text('Kg', 140, y + 5.5);
  doc.text('Status', 158, y + 5.5);
  doc.text('Total (Rp)', 188, y + 5.5, { align: 'right' });

  y += 8;
  const periodSales = dbData.sales.filter((s) => s.date.startsWith(report.monthYear)).slice(0, 8);
  periodSales.forEach((s, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(245, 247, 245);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(8);
    doc.text(s.invoiceNumber, 24, y + 4.8);
    doc.text(s.date, 65, y + 4.8);
    doc.text(s.customerName.length > 22 ? s.customerName.substring(0, 20) + '...' : s.customerName, 90, y + 4.8);
    doc.text(`${s.totalKg} kg`, 140, y + 4.8);
    doc.text(s.paymentStatus.toUpperCase(), 158, y + 4.8);
    doc.text(formatRupiah(s.totalAmount), 188, y + 4.8, { align: 'right' });
    y += 7;
  });

  // ================= PAGE 5: FINANCE =================
  doc.addPage();
  renderReportHeader(doc, '4. KEUANGAN, ARUS KAS & BEBAN OPERASIONAL', report.monthName);

  y = 45;
  doc.setFontSize(11);
  doc.setTextColor(...charcoalColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Rincian Kategori Pengeluaran Farm (Beban Operasional)', 20, y);

  y += 6;
  const monthExps = dbData.expenses.filter((e) => e.date.startsWith(report.monthYear));
  const expenseCatMap: Record<string, number> = {};
  monthExps.forEach((e) => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });

  const catEntries = Object.entries(expenseCatMap);

  doc.setFillColor(...primaryColor);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Kategori Beban', 24, y + 5.5);
  doc.text('Deskripsi Alokasi', 85, y + 5.5);
  doc.text('Persentase', 140, y + 5.5);
  doc.text('Jumlah (Rp)', 188, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...charcoalColor);

  const totalExpCalc = report.totalExpense || 1;
  catEntries.forEach(([cat, amt], idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(245, 247, 245);
      doc.rect(20, y, 170, 7, 'F');
    }
    const pct = ((amt / totalExpCalc) * 100).toFixed(1);
    doc.setFontSize(8);
    doc.text(cat.toUpperCase(), 24, y + 4.8);
    doc.text(`Biaya operasional ${cat}`, 85, y + 4.8);
    doc.text(`${pct}%`, 140, y + 4.8);
    doc.text(formatRupiah(amt), 188, y + 4.8, { align: 'right' });
    y += 7;
  });

  // Cash Flow Summary Box
  y += 10;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(20, y, 170, 32, 2, 2, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.rect(20, y, 170, 32);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('Ikhtisar Arus Kas (Cash Flow) Periode:', 25, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoalColor);
  doc.text(`Total Kas Masuk (Cash In): ${formatRupiah(report.cashIn)}`, 25, y + 16);
  doc.text(`Total Kas Keluar (Cash Out): ${formatRupiah(report.cashOut)}`, 25, y + 23);
  doc.setFont('helvetica', 'bold');
  const netCash = report.cashIn - report.cashOut;
  doc.text(`Net Cash Flow: ${netCash >= 0 ? '+' : ''}${formatRupiah(netCash)}`, 110, y + 16);
  doc.text(`Laba Bersih Buku: ${formatRupiah(report.netProfit)}`, 110, y + 23);

  // ================= PAGE 6: CLOSING & SIGNATURES =================
  doc.addPage();
  renderReportHeader(doc, '5. PENGESAHAN LAPORAN BULANAN RESMI', report.monthName);

  y = 55;
  doc.setFontSize(11);
  doc.setTextColor(...charcoalColor);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Laporan ini digenerate secara otomatis oleh sistem GHN ERP Lite berdasarkan seluruh data ` +
    `transaksi produksi, stok pakan, kasir POS, dan buku kas operasional GHN Egg Farm Nusantara ` +
    `yang tercatat secara terpadu tanpa manipulasi data.`,
    20,
    y,
    { maxWidth: 170 }
  );

  y += 35;
  // Signatures
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Mengetahui / Menyetujui:', 30, y);
  doc.text('Dibuat & Diverifikasi Oleh:', 130, y);

  y += 28;
  doc.setDrawColor(150, 150, 150);
  doc.line(30, y, 85, y);
  doc.line(130, y, 185, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('H. Bambang Septiawan', 30, y);
  doc.text('Ahmad Fauzi', 130, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Owner / Direktur Utama GHN Farm', 30, y);
  doc.text('Operator Farm & Accounting', 130, y);

  // Bottom stamp note
  y = 240;
  doc.setFillColor(...creamBg);
  doc.roundedRect(20, y, 170, 24, 2, 2, 'F');
  doc.setDrawColor(...goldColor);
  doc.rect(20, y, 170, 24);

  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Prepared automatically by GHN ERP Lite', 105, y + 9, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('GHN Egg Farm Nusantara - Input Sekali, Semua Modul Otomatis Ter-update.', 105, y + 16, { align: 'center' });

  const fileName = `GHN_Report_${report.monthYear.replace('-', '_')}.pdf`;
  doc.save(fileName);
}

function renderReportHeader(doc: jsPDF, title: string, monthName: string) {
  const primaryColor: [number, number, number] = [15, 81, 50];
  const goldColor: [number, number, number] = [212, 175, 55];

  // Top banner bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GHN EGG FARM NUSANTARA — GHN ERP LITE', 20, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Periode: ${monthName}`, 190, 11, { align: 'right' });

  // Gold separator line
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(1);
  doc.line(0, 18, 210, 18);

  // Section Title
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 20, 32);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(20, 36, 190, 36);
}

/**
 * Generates an A4 PDF Official Invoice for a Sale
 */
export function generateSaleInvoicePdf(sale: Sale, farmSettings: DatabaseSchema['settings']) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [15, 81, 50];
  const charcoalColor: [number, number, number] = [31, 41, 55];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(farmSettings.farmName, 20, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(farmSettings.address, 20, 23);
  doc.text(`Telp: ${farmSettings.phone} | ${farmSettings.email}`, 20, 28);

  // Invoice Title Right
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FAKTUR PENJUALAN', 190, 16, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(sale.invoiceNumber, 190, 24, { align: 'right' });

  // Details Box
  let y = 44;
  doc.setTextColor(...charcoalColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Pelanggan:', 20, y);
  doc.text('Informasi Faktur:', 130, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(sale.customerName, 20, y);
  doc.text(`Tanggal: ${sale.date}`, 130, y);

  y += 5;
  if (sale.customerPhone) {
    doc.text(`Telepon: ${sale.customerPhone}`, 20, y);
  }
  doc.text(`Status Bayar: ${sale.paymentStatus.toUpperCase()}`, 130, y);

  y += 5;
  doc.text(`Metode: ${sale.paymentMethod}`, 130, y);

  // Items Table
  y += 12;
  doc.setFillColor(...primaryColor);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Deskripsi Produk', 24, y + 5.5);
  doc.text('Qty', 105, y + 5.5);
  doc.text('Harga / Satuan', 130, y + 5.5);
  doc.text('Subtotal', 188, y + 5.5, { align: 'right' });

  y += 8;
  doc.setTextColor(...charcoalColor);
  doc.setFont('helvetica', 'normal');

  sale.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(245, 247, 245);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(8.5);
    doc.text(item.productName, 24, y + 4.8);
    doc.text(`${item.quantity} ${item.unit}`, 105, y + 4.8);
    doc.text(formatRupiah(item.pricePerUnit), 130, y + 4.8);
    doc.text(formatRupiah(item.subtotal), 188, y + 4.8, { align: 'right' });
    y += 7;
  });

  // Summary Totals
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.line(110, y, 190, y);

  y += 6;
  doc.setFontSize(9.5);
  doc.text('Subtotal:', 120, y);
  doc.text(formatRupiah(sale.subtotal), 188, y, { align: 'right' });

  if (sale.discount > 0) {
    y += 5;
    doc.text('Diskon:', 120, y);
    doc.text(`- ${formatRupiah(sale.discount)}`, 188, y, { align: 'right' });
  }

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Total Akhir:', 120, y);
  doc.text(formatRupiah(sale.totalAmount), 188, y, { align: 'right' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...charcoalColor);
  doc.text('Jumlah Dibayar:', 120, y);
  doc.text(formatRupiah(sale.paidAmount), 188, y, { align: 'right' });

  if (sale.balanceDue > 0) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28); // red
    doc.text('Sisa Piutang (Tempo):', 120, y);
    doc.text(formatRupiah(sale.balanceDue), 188, y, { align: 'right' });
  }

  // Payment Bank Info
  y += 18;
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(20, y, 170, 26, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('Rekening Pembayaran Resmi Farm:', 25, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...charcoalColor);
  doc.text(`Bank: ${farmSettings.bankName}`, 25, y + 13);
  doc.text(`Nomor Rekening: ${farmSettings.bankAccount}`, 25, y + 18);
  doc.text(`Atas Nama: ${farmSettings.bankAccountName}`, 25, y + 23);

  // Footer Note
  y += 36;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(farmSettings.receiptFooter, 105, y, { align: 'center', maxWidth: 160 });

  doc.save(`${sale.invoiceNumber}.pdf`);
}
