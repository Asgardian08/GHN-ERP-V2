import React, { useMemo } from 'react';
import { DatabaseSchema, PreOrder } from '../../types/database';
import { formatRupiah, formatNumber } from '../../services/pdfGenerator';
import { StatCard } from '../../components/common/StatCard';
import { 
  Users, 
  Egg, 
  TrendingUp, 
  ShoppingCart, 
  ArrowDownRight, 
  Wallet, 
  Boxes, 
  Wheat, 
  CreditCard, 
  CalendarClock,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock
} from 'lucide-react';
import { db } from '../../services/db';

interface DashboardModuleProps {
  data: DatabaseSchema;
  onNavigate: (module: string) => void;
  onOpenQuickAction: (actionType: 'production' | 'sale' | 'preorder' | 'expense' | 'feedUsage') => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  data,
  onNavigate,
  onOpenQuickAction,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Calculations for Today
  const todayProds = useMemo(() => {
    return data.production.filter((p) => p.date === today);
  }, [data.production, today]);

  const todayEggsCount = todayProds.reduce((sum, p) => sum + p.eggsCount, 0);
  const todayEggWeightKg = todayProds.reduce((sum, p) => sum + p.eggWeightKg, 0);
  const todayHDP = todayProds.length > 0 
    ? Number((todayEggsCount / data.settings.chickenPopulation * 100).toFixed(2)) 
    : 0;

  const todaySales = useMemo(() => {
    return data.sales.filter((s) => s.date === today);
  }, [data.sales, today]);

  const todaySalesAmount = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const todaySalesKg = todaySales.reduce((sum, s) => sum + s.totalKg, 0);

  const todayExpenses = useMemo(() => {
    return data.expenses.filter((e) => e.date === today);
  }, [data.expenses, today]);
  const todayExpenseAmount = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const cashBalance = db.getCashBalance();

  const eggItem = data.inventory.find((i) => i.id === 'inv_telur');
  const eggStock = eggItem ? eggItem.stock : 0;

  const feedItems = data.inventory.filter((i) => i.category === 'pakan');
  const totalFeedStockKg = feedItems.reduce((sum, i) => sum + (i.unit === 'kg' ? i.stock : 0), 0);

  const activeReceivables = data.receivables.filter((r) => r.status === 'belum_lunas');
  const totalActiveReceivableAmount = activeReceivables.reduce((sum, r) => sum + r.remainingAmount, 0);

  const activePreOrders = data.preorders.filter((p) => p.status !== 'selesai' && p.status !== 'dibatalkan');
  const activePOKg = activePreOrders.reduce((sum, p) => sum + p.quantityKg, 0);

  // Pre-Orders segmentation
  const todaysPickupOrders = data.preorders.filter(
    (p) => p.status !== 'selesai' && p.status !== 'dibatalkan' && p.pickupDate === today
  );
  const upcomingOrders = data.preorders.filter(
    (p) => p.status !== 'selesai' && p.status !== 'dibatalkan' && p.pickupDate > today
  );
  const overdueOrders = data.preorders.filter(
    (p) => p.status !== 'selesai' && p.status !== 'dibatalkan' && p.pickupDate < today
  );

  // 7 Days Chart Data Calculation
  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const chart7DaysData = useMemo(() => {
    return last7Days.map((d) => {
      const dayProd = data.production.filter((p) => p.date === d);
      const eggs = dayProd.reduce((sum, p) => sum + p.eggsCount, 0);
      const kg = dayProd.reduce((sum, p) => sum + p.eggWeightKg, 0);

      const daySales = data.sales.filter((s) => s.date === d);
      const salesRp = daySales.reduce((sum, s) => sum + s.totalAmount, 0);

      const dayIn = data.cashTransactions.filter((c) => c.date === d && c.type === 'in').reduce((sum, c) => sum + c.amount, 0);
      const dayOut = data.cashTransactions.filter((c) => c.date === d && c.type === 'out').reduce((sum, c) => sum + c.amount, 0);

      const dayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(new Date(d));

      return {
        date: d,
        label: dayLabel,
        eggs,
        kg,
        salesRp,
        cashIn: dayIn,
        cashOut: dayOut,
      };
    });
  }, [last7Days, data]);

  // Max values for CSS charts
  const maxEggs = Math.max(...chart7DaysData.map((c) => c.eggs), 100);
  const maxSales = Math.max(...chart7DaysData.map((c) => c.salesRp), 100000);
  const maxCash = Math.max(...chart7DaysData.map((c) => Math.max(c.cashIn, c.cashOut)), 100000);

  // Monthly summary
  const currentMonthPrefix = today.substring(0, 7);
  const monthSales = data.sales.filter((s) => s.date.startsWith(currentMonthPrefix)).reduce((sum, s) => sum + s.totalAmount, 0);
  const monthExpenses = data.expenses.filter((e) => e.date.startsWith(currentMonthPrefix)).reduce((sum, e) => sum + e.amount, 0);
  const monthNetProfit = monthSales - monthExpenses;

  return (
    <div className="space-y-6">
      {/* Top Banner / Philosophy reminder */}
      <div className="bg-gradient-to-r from-[#0F5132] via-[#0D442A] to-[#0A3622] rounded-2xl p-4 sm:p-6 text-white shadow-sm border border-[#0F5132]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#0A3622]">
              Sistem Terpadu
            </span>
            <span className="text-xs text-emerald-200 font-medium">
              GHN Farm Nusantara
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            Kondisi Operasional Farm Hari Ini
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl mt-0.5">
            Input sekali → Stok telur, pelanggan, kas, piutang, dan laporan laba rugi otomatis tersinkronisasi.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => onOpenQuickAction('production')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white px-3 py-2 rounded-xl text-xs font-bold border border-white/15 transition-all shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Catat Produksi</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('sale')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-[#C59F2D] text-[#0A3622] px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Kasir POS</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('preorder')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white px-3 py-2 rounded-xl text-xs font-bold border border-white/15 transition-all shadow-2xs"
          >
            <CalendarClock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Pre Order</span>
          </button>
          <button
            onClick={() => onOpenQuickAction('expense')}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white px-3 py-2 rounded-xl text-xs font-bold border border-white/15 transition-all shadow-2xs"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-300" />
            <span>Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* 10 METRIC CARDS (Prompt specified all 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Populasi Ayam */}
        <StatCard
          title="Populasi Ayam"
          value={`${formatNumber(data.settings.chickenPopulation)}`}
          subvalue="Ekor Aktif Fase Layer"
          icon={Users}
          onClick={() => onNavigate('pengaturan')}
        />

        {/* 2. Produksi Hari Ini */}
        <StatCard
          title="Produksi Hari Ini"
          value={`${formatNumber(todayEggsCount)} Btr`}
          subvalue={`${formatNumber(todayEggWeightKg, 2)} Kg Telur Segar`}
          icon={Egg}
          iconColor="text-emerald-700"
          bgColor="bg-emerald-100"
          onClick={() => onNavigate('produksi')}
        />

        {/* 3. HDP (%) */}
        <StatCard
          title="HDP (Hen Day %)"
          value={`${todayHDP}%`}
          subvalue={todayHDP >= 82 ? 'Kategori: Sangat Baik' : 'Kategori: Normal'}
          icon={TrendingUp}
          trend={{
            label: todayHDP >= 80 ? '↑ Di atas target 80%' : '↓ Evaluasi pakan',
            isPositive: todayHDP >= 80,
          }}
          onClick={() => onNavigate('produksi')}
        />

        {/* 4. Penjualan Hari Ini */}
        <StatCard
          title="Penjualan Hari Ini"
          value={formatRupiah(todaySalesAmount)}
          subvalue={`${todaySalesKg} Kg (${todaySales.length} Transaksi)`}
          icon={ShoppingCart}
          onClick={() => onNavigate('kasir')}
          accent={todaySalesAmount > 0}
        />

        {/* 5. Pengeluaran Hari Ini */}
        <StatCard
          title="Pengeluaran Hari Ini"
          value={formatRupiah(todayExpenseAmount)}
          subvalue={`${todayExpenses.length} Transaksi Beban`}
          icon={ArrowDownRight}
          iconColor="text-rose-700"
          bgColor="bg-rose-50"
          onClick={() => onNavigate('keuangan')}
        />

        {/* 6. Saldo Kas */}
        <StatCard
          title="Saldo Kas Operasional"
          value={formatRupiah(cashBalance)}
          subvalue="Tersedia Siap Pakai"
          icon={Wallet}
          iconColor="text-[#0F5132]"
          bgColor="bg-emerald-50"
          onClick={() => onNavigate('keuangan')}
        />

        {/* 7. Stok Telur */}
        <StatCard
          title="Stok Telur Gudang"
          value={`${formatNumber(eggStock, 1)} Kg`}
          subvalue={eggStock < data.settings.lowStockThresholdKg ? 'Peringatan Stok Rendah' : 'Siap Kirim & Jual'}
          icon={Boxes}
          iconColor={eggStock < data.settings.lowStockThresholdKg ? 'text-rose-600' : 'text-emerald-700'}
          bgColor={eggStock < data.settings.lowStockThresholdKg ? 'bg-rose-50' : 'bg-emerald-50'}
          onClick={() => onNavigate('stok')}
        />

        {/* 8. Stok Pakan */}
        <StatCard
          title="Stok Pakan Layer"
          value={`${formatNumber(totalFeedStockKg)} Kg`}
          subvalue={`${feedItems.length} Jenis Formula Pakan`}
          icon={Wheat}
          iconColor="text-amber-700"
          bgColor="bg-amber-50"
          onClick={() => onNavigate('stok')}
        />

        {/* 9. Piutang Aktif */}
        <StatCard
          title="Piutang Aktif (Tempo)"
          value={formatRupiah(totalActiveReceivableAmount)}
          subvalue={`${activeReceivables.length} Pelanggan Belum Lunas`}
          icon={CreditCard}
          iconColor="text-amber-700"
          bgColor="bg-amber-50"
          onClick={() => onNavigate('pelanggan')}
        />

        {/* 10. Pre Order Aktif */}
        <StatCard
          title="Pre Order Aktif"
          value={`${activePreOrders.length} Pesanan`}
          subvalue={`Total ${formatNumber(activePOKg, 1)} Kg Dipesan`}
          icon={CalendarClock}
          iconColor="text-indigo-700"
          bgColor="bg-indigo-50"
          onClick={() => onNavigate('preorder')}
        />
      </div>

      {/* CHARTS SECTION (4 charts specified in prompt) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Produksi 7 Hari */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Produksi Telur 7 Hari Terakhir
              </h3>
              <p className="text-xs text-gray-500">Panen Butir & Total Berat (Kg)</p>
            </div>
            <button
              onClick={() => onNavigate('produksi')}
              className="text-xs text-[#0F5132] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Detail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-1 border-b border-gray-100">
            {chart7DaysData.map((c, i) => {
              const heightPct = Math.max(12, Math.round((c.eggs / maxEggs) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.eggs} btr
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-[#0F5132] to-emerald-600 group-hover:to-emerald-500 transition-all shadow-xs relative"
                  >
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-white">
                      {c.kg > 0 ? `${Math.round(c.kg)}k` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium truncate">
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 px-1">
            <span>Rata-rata 7 Hari: {Math.round(chart7DaysData.reduce((s, c) => s + c.eggs, 0) / 7)} Butir/hari</span>
            <span className="font-semibold text-emerald-700">Stabil Grade A</span>
          </div>
        </div>

        {/* Chart 2: Penjualan 7 Hari */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Tren Penjualan 7 Hari Terakhir
              </h3>
              <p className="text-xs text-gray-500">Omzet Penjualan Telur Harian (Rp)</p>
            </div>
            <button
              onClick={() => onNavigate('kasir')}
              className="text-xs text-[#0F5132] font-semibold hover:underline flex items-center gap-1"
            >
              <span>POS Kasir</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-44 flex items-end justify-between gap-2 pt-4 px-1 border-b border-gray-100">
            {chart7DaysData.map((c, i) => {
              const heightPct = Math.max(8, Math.round((c.salesRp / maxSales) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="text-[9px] font-bold text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatRupiah(c.salesRp).replace(',00', '')}
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-[#B38F24] to-[#D4AF37] group-hover:brightness-110 transition-all shadow-xs"
                  />
                  <span className="text-[10px] text-gray-500 font-medium truncate">
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 px-1">
            <span>Total 7 Hari: {formatRupiah(chart7DaysData.reduce((s, c) => s + c.salesRp, 0))}</span>
            <span className="font-semibold text-amber-700">Tingkat Penyerapan 98%</span>
          </div>
        </div>

        {/* Chart 3: Cash Flow Mingguan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Cash Flow Mingguan
              </h3>
              <p className="text-xs text-gray-500">Perbandingan Kas Masuk vs Kas Keluar</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Masuk
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Keluar
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-1 border-b border-gray-100">
            {chart7DaysData.map((c, i) => {
              const inPct = Math.max(6, Math.round((c.cashIn / maxCash) * 100));
              const outPct = Math.max(6, Math.round((c.cashOut / maxCash) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="flex items-end gap-1 w-full justify-center">
                    <div
                      style={{ height: `${inPct}%` }}
                      className="w-3 rounded-t-sm bg-emerald-600 hover:bg-emerald-500 transition-all"
                      title={`Kas Masuk: ${formatRupiah(c.cashIn)}`}
                    />
                    <div
                      style={{ height: `${outPct}%` }}
                      className="w-3 rounded-t-sm bg-rose-500 hover:bg-rose-400 transition-all"
                      title={`Kas Keluar: ${formatRupiah(c.cashOut)}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium truncate mt-1">
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500 px-1">
            <span>Kas Masuk 7 Hari: {formatRupiah(chart7DaysData.reduce((s, c) => s + c.cashIn, 0))}</span>
            <span className="text-rose-600">Kas Keluar: {formatRupiah(chart7DaysData.reduce((s, c) => s + c.cashOut, 0))}</span>
          </div>
        </div>

        {/* Chart 4: Laba Bulanan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Laba Bersih Bulan Ini
              </h3>
              <p className="text-xs text-gray-500">Estimasi Laba Rugi Operasional Farm</p>
            </div>
            <button
              onClick={() => onNavigate('laporan')}
              className="text-xs text-[#0F5132] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Laporan PDF</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#FAF9F6] to-emerald-50/60 border border-emerald-900/10 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Estimasi Laba Bersih (Net Profit):</span>
              <span className="text-lg sm:text-xl font-black text-[#0F5132]">
                {formatRupiah(monthNetProfit)}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Total Pendapatan</span>
                <p className="font-bold text-emerald-800 mt-0.5">{formatRupiah(monthSales)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-gray-200">
                <span className="text-gray-400 text-[10px] uppercase font-bold">Total Pengeluaran</span>
                <p className="font-bold text-rose-700 mt-0.5">{formatRupiah(monthExpenses)}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar of Profit Margin */}
          <div>
            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
              <span>Margin Keuntungan Bersih</span>
              <span className="font-bold text-[#0F5132]">
                {monthSales > 0 ? ((monthNetProfit / monthSales) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#0F5132] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, monthSales > 0 ? (monthNetProfit / monthSales) * 100 : 0))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PRE-ORDER RADAR & ALERT WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Pickup Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">Jadwal Ambil Hari Ini</h4>
                <p className="text-[11px] text-gray-500">{todaysPickupOrders.length} Pesanan</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('preorder')}
              className="text-[11px] text-[#0F5132] font-semibold hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2">
            {todaysPickupOrders.length > 0 ? (
              todaysPickupOrders.map((po) => (
                <div
                  key={po.id}
                  onClick={() => onNavigate('preorder')}
                  className="p-2.5 rounded-xl border border-gray-100 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-gray-900">{po.customerName}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{po.orderNumber} • {po.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-emerald-800">{po.quantityKg} kg</span>
                    <p className="text-[10px] text-gray-500">{formatRupiah(po.totalAmount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">
                Tidak ada pesanan yang dijadwalkan diambil hari ini.
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">Pesanan Mendatang</h4>
                <p className="text-[11px] text-gray-500">{upcomingOrders.length} Pesanan</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('preorder')}
              className="text-[11px] text-[#0F5132] font-semibold hover:underline"
            >
              Kelola
            </button>
          </div>

          <div className="space-y-2">
            {upcomingOrders.length > 0 ? (
              upcomingOrders.slice(0, 3).map((po) => (
                <div
                  key={po.id}
                  onClick={() => onNavigate('preorder')}
                  className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/70 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-gray-900">{po.customerName}</p>
                    <p className="text-[10px] text-indigo-600 font-medium">Ambil: {po.pickupDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-gray-800">{po.quantityKg} kg</span>
                    <p className="text-[10px] text-gray-500">DP: {formatRupiah(po.dpAmount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-3 text-center">
                Belum ada pesanan pre-order mendatang.
              </p>
            )}
          </div>
        </div>

        {/* Overdue Orders Alert */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">Lewat Tanggal Ambil</h4>
                <p className="text-[11px] text-rose-600 font-semibold">{overdueOrders.length} Pesanan Tertunda</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('preorder')}
              className="text-[11px] text-rose-700 font-semibold hover:underline"
            >
              Follow Up
            </button>
          </div>

          <div className="space-y-2">
            {overdueOrders.length > 0 ? (
              overdueOrders.map((po) => (
                <div
                  key={po.id}
                  onClick={() => onNavigate('preorder')}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/60 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-xs text-rose-950">{po.customerName}</p>
                    <p className="text-[10px] text-rose-600 font-medium">Jadwal: {po.pickupDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-rose-800">{po.quantityKg} kg</span>
                    <p className="text-[10px] text-gray-500">Sisa: {formatRupiah(po.balanceDue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-600 py-3 text-center font-medium">
                Bagus! Tidak ada pesanan pre order yang terlambat.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
