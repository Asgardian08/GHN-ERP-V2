import React, { useState, useMemo } from 'react';
import { DatabaseSchema, MonthlyReport } from '../../types/database';
import { db } from '../../services/db';
import { 
  formatRupiah, 
  formatNumber, 
  generateMonthlyReportPdf 
} from '../../services/pdfGenerator';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Archive, 
  Layers, 
  Printer,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface LaporanModuleProps {
  data: DatabaseSchema;
}

export const LaporanModule: React.FC<LaporanModuleProps> = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];

  // Report Filter State
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'custom'>('this_month');
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-tab view
  const [subView, setSubView] = useState<'laba_rugi' | 'produksi' | 'penjualan' | 'tutup_buku'>('laba_rugi');

  // Date range determination
  const { startDate, endDate, periodLabel } = useMemo(() => {
    const now = new Date();
    if (filterPeriod === 'today') {
      return { startDate: today, endDate: today, periodLabel: 'Hari Ini' };
    }
    if (filterPeriod === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const str = y.toISOString().split('T')[0];
      return { startDate: str, endDate: str, periodLabel: 'Kemarin' };
    }
    if (filterPeriod === 'this_week') {
      const w = new Date();
      w.setDate(w.getDate() - 7);
      const str = w.toISOString().split('T')[0];
      return { startDate: str, endDate: today, periodLabel: 'Minggu Ini (7 Hari Terakhir)' };
    }
    if (filterPeriod === 'this_month') {
      const ym = today.substring(0, 7);
      return { startDate: `${ym}-01`, endDate: today, periodLabel: 'Bulan Berjalan Ini' };
    }
    if (filterPeriod === 'last_month') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const ym = prev.toISOString().substring(0, 7);
      return { startDate: `${ym}-01`, endDate: `${ym}-31`, periodLabel: 'Bulan Lalu' };
    }
    return { startDate: customStart, endDate: customEnd, periodLabel: `${customStart} s/d ${customEnd}` };
  }, [filterPeriod, today, customStart, customEnd]);

  // Filtered Production
  const prods = useMemo(() => {
    return data.production.filter((p) => p.date >= startDate && p.date <= endDate);
  }, [data.production, startDate, endDate]);

  const totalEggs = prods.reduce((s, p) => s + p.eggsCount, 0);
  const totalKg = prods.reduce((s, p) => s + p.eggWeightKg, 0);
  const avgHdp = prods.length > 0 ? Number((prods.reduce((s, p) => s + p.hdp, 0) / prods.length).toFixed(2)) : 0;

  // Filtered Sales
  const sales = useMemo(() => {
    return data.sales.filter((s) => s.date >= startDate && s.date <= endDate);
  }, [data.sales, startDate, endDate]);

  const totalSalesRevenue = sales.reduce((s, x) => s + x.totalAmount, 0);
  const totalSalesKg = sales.reduce((s, x) => s + x.totalKg, 0);

  // Filtered Expenses
  const expenses = useMemo(() => {
    return data.expenses.filter((e) => e.date >= startDate && e.date <= endDate);
  }, [data.expenses, startDate, endDate]);

  const totalExpenseAmount = expenses.reduce((s, e) => s + e.amount, 0);

  // Filtered Incomes
  const incomes = useMemo(() => {
    return data.incomes.filter((i) => i.date >= startDate && i.date <= endDate);
  }, [data.incomes, startDate, endDate]);

  const totalIncomeAmount = incomes.reduce((s, i) => s + i.amount, 0);

  // Profit
  const netProfit = totalSalesRevenue - totalExpenseAmount;

  // Cash Flow in period
  const cashIn = data.cashTransactions.filter((c) => c.date >= startDate && c.date <= endDate && c.type === 'in').reduce((s, c) => s + c.amount, 0);
  const cashOut = data.cashTransactions.filter((c) => c.date >= startDate && c.date <= endDate && c.type === 'out').reduce((s, c) => s + c.amount, 0);

  // Handle Monthly Closing Action
  const handleRunMonthlyClosing = () => {
    const currentMonthYear = today.substring(0, 7);
    const report = db.closeMonth(currentMonthYear);
    generateMonthlyReportPdf(report, data);

    setToastMessage(`Tutup Buku ${report.monthName} Selesai & Dokumen PDF Resmi telah di-download!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleDownloadArchivePdf = (report: MonthlyReport) => {
    generateMonthlyReportPdf(report, data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#0F5132]">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Laporan Keuangan & Produksi Eksekutif
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Laporan terintegrasi laba rugi, HDP ayam, volume penjualan, dan tutup buku bulanan berstandar A4 PDF siap cetak.
          </p>
        </div>

        <button
          onClick={handleRunMonthlyClosing}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C59F2D] text-[#0A3622] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-sm active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Tutup Buku & Download PDF Bulan Ini</span>
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">PDF Berhasil Dibuat</span>
        </div>
      )}

      {/* GLOBAL PERIOD FILTERS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <Calendar className="w-4 h-4 text-[#0F5132]" />
            <span>Filter Rentang Waktu:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'this_week', label: 'Minggu Ini' },
              { id: 'this_month', label: 'Bulan Ini' },
              { id: 'last_month', label: 'Bulan Lalu' },
              { id: 'custom', label: 'Kustom Tanggal' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterPeriod === p.id
                    ? 'bg-[#0F5132] text-white shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {filterPeriod === 'custom' && (
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-gray-500 font-medium">Mulai Tanggal:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 font-medium"
            />
            <span className="text-gray-500 font-medium">Sampai:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 font-medium"
            />
          </div>
        )}
      </div>

      {/* EXECUTIVE SUMMARY IN PERIOD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Pendapatan Penjualan</span>
          <p className="text-lg sm:text-xl font-black text-emerald-800 mt-1">{formatRupiah(totalSalesRevenue)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{totalSalesKg} kg telur terjual</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Beban Pengeluaran</span>
          <p className="text-lg sm:text-xl font-black text-rose-700 mt-1">{formatRupiah(totalExpenseAmount)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{expenses.length} transaksi beban</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Laba Bersih Operasional</span>
          <p className={`text-lg sm:text-xl font-black mt-1 ${netProfit >= 0 ? 'text-[#0F5132]' : 'text-rose-700'}`}>
            {formatRupiah(netProfit)}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Margin: {totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase">Produksi & Rata HDP</span>
          <p className="text-lg sm:text-xl font-black text-gray-900 mt-1">{formatNumber(totalEggs)} Btr</p>
          <p className="text-[11px] text-emerald-700 font-bold mt-0.5">HDP: {avgHdp}% ({formatNumber(totalKg, 1)} kg)</p>
        </div>
      </div>

      {/* SUB-VIEW NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'laba_rugi', label: 'Laporan Laba Rugi & Kas' },
          { id: 'produksi', label: 'Laporan Produksi & HDP' },
          { id: 'penjualan', label: 'Laporan Penjualan & Pelanggan' },
          { id: 'tutup_buku', label: 'Arsip Tutup Buku Bulanan' },
        ].map((v) => (
          <button
            key={v.id}
            onClick={() => setSubView(v.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subView === v.id
                ? 'bg-[#0F5132] text-white shadow-2xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: LABA RUGI & CASH FLOW */}
      {subView === 'laba_rugi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Laba Rugi Table */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              Laporan Laba Rugi ({periodLabel})
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold text-emerald-800 pb-2 border-b">
                <span>PENDAPATAN USAHA (PENJUALAN TELUR)</span>
                <span>{formatRupiah(totalSalesRevenue)}</span>
              </div>

              <div className="pt-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                RINCIAN BEBAN PENGELUARAN:
              </div>

              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between text-gray-600 pl-2">
                  <span>{e.description} ({e.category.toUpperCase()})</span>
                  <span className="font-medium text-rose-700">{formatRupiah(e.amount)}</span>
                </div>
              ))}

              <div className="flex justify-between font-bold text-rose-700 pt-2 border-t">
                <span>TOTAL BEBAN PENGELUARAN</span>
                <span>{formatRupiah(totalExpenseAmount)}</span>
              </div>

              <div className="flex justify-between text-sm sm:text-base font-black text-[#0F5132] pt-3 border-t-2 border-gray-900">
                <span>LABA BERSIH OPERASIONAL (NET PROFIT)</span>
                <span>{formatRupiah(netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Cash Flow Statement */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-900 text-base">
              Laporan Arus Kas / Cash Flow ({periodLabel})
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-emerald-950 block">Arus Kas Masuk (Cash In)</span>
                  <span className="text-[11px] text-emerald-700">Penjualan lunas, DP PO, pelunasan piutang</span>
                </div>
                <span className="text-base font-black text-emerald-800">+{formatRupiah(cashIn)}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-rose-950 block">Arus Kas Keluar (Cash Out)</span>
                  <span className="text-[11px] text-rose-700">Beban pakan, vitamin, operasional, bayar hutang</span>
                </div>
                <span className="text-base font-black text-rose-700">-{formatRupiah(cashOut)}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-gray-200 flex justify-between items-center font-bold">
                <span>Net Cash Flow Periode Ini:</span>
                <span className={`text-base font-black ${cashIn - cashOut >= 0 ? 'text-[#0F5132]' : 'text-rose-700'}`}>
                  {formatRupiah(cashIn - cashOut)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LAPORAN PRODUKSI */}
      {subView === 'produksi' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base">
            Tabel Rincian Produksi Telur ({periodLabel})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-[11px] text-gray-400 font-bold uppercase bg-gray-50">
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Populasi Ayam</th>
                  <th className="p-2.5">Butir Telur</th>
                  <th className="p-2.5">Berat (Kg)</th>
                  <th className="p-2.5">HDP (%)</th>
                  <th className="p-2.5">Rata Gram</th>
                  <th className="p-2.5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prods.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-semibold text-gray-900">{p.date}</td>
                    <td className="p-2.5 text-gray-600">{formatNumber(p.chickenCount)} ekor</td>
                    <td className="p-2.5 font-bold text-gray-900">{formatNumber(p.eggsCount)} btr</td>
                    <td className="p-2.5 font-bold text-[#0F5132]">{formatNumber(p.eggWeightKg, 2)} kg</td>
                    <td className="p-2.5 font-bold text-emerald-700">{p.hdp.toFixed(2)}%</td>
                    <td className="p-2.5 text-gray-600">{p.avgGramPerEgg.toFixed(1)} gr</td>
                    <td className="p-2.5 text-gray-500">{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: LAPORAN PENJUALAN */}
      {subView === 'penjualan' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-900 text-base">
            Daftar Faktur Penjualan Telur ({periodLabel})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-[11px] text-gray-400 font-bold uppercase bg-gray-50">
                  <th className="p-2.5">Faktur</th>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Pelanggan</th>
                  <th className="p-2.5">Kg</th>
                  <th className="p-2.5">Total</th>
                  <th className="p-2.5">Dibayar</th>
                  <th className="p-2.5">Metode</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-2.5 font-mono font-bold text-gray-900">{s.invoiceNumber}</td>
                    <td className="p-2.5 text-gray-600">{s.date}</td>
                    <td className="p-2.5 font-medium text-gray-800">{s.customerName}</td>
                    <td className="p-2.5 font-bold text-[#0F5132]">{s.totalKg} kg</td>
                    <td className="p-2.5 font-bold text-gray-900">{formatRupiah(s.totalAmount)}</td>
                    <td className="p-2.5 text-gray-600">{formatRupiah(s.paidAmount)}</td>
                    <td className="p-2.5 text-gray-600">{s.paymentMethod}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.paymentStatus === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: ARSIP TUTUP BUKU BULANAN & PDF */}
      {subView === 'tutup_buku' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Arsip Laporan Tutup Buku Bulanan Resmi (PDF)
              </h3>
              <p className="text-xs text-gray-500">
                Setiap akhir bulan ditutup secara permanen dan menghasilkan laporan resmi multi-halaman A4.
              </p>
            </div>
            <button
              onClick={handleRunMonthlyClosing}
              className="px-4 py-2 rounded-xl bg-[#0F5132] text-white text-xs font-bold hover:bg-[#0A3622] flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Tutup Buku Bulan Ini</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {data.monthlyReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl border border-gray-200 bg-[#FAF9F6] flex flex-col justify-between hover:border-[#D4AF37] transition-all shadow-2xs"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        Dokumen Resmi
                      </span>
                      <h4 className="font-extrabold text-base text-gray-900 mt-1">
                        Laporan {report.monthName}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Ditutup pada: {new Date(report.closedAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-[#0F5132] block">
                        Laba: {formatRupiah(report.netProfit)}
                      </span>
                      <span className="text-[10px] text-gray-500">HDP: {report.avgHdp}%</span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white border border-gray-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Produksi Telur</span>
                      <p className="font-bold text-gray-800">{formatNumber(report.totalKg, 1)} kg</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Omzet Penjualan</span>
                      <p className="font-bold text-emerald-800 truncate">{formatRupiah(report.totalRevenue).replace(',00', '')}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Beban Farm</span>
                      <p className="font-bold text-rose-700 truncate">{formatRupiah(report.totalExpense).replace(',00', '')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[11px] text-gray-500 font-mono">
                    GHN_Report_{report.monthYear.replace('-', '_')}.pdf
                  </span>
                  <button
                    onClick={() => handleDownloadArchivePdf(report)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF A4</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
