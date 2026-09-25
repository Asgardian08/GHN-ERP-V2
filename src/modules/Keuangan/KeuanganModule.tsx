import React, { useState, useMemo } from 'react';
import { 
  DatabaseSchema, 
  IncomeCategory, 
  ExpenseCategory, 
  PaymentMethod,
  Receivable,
  Payable
} from '../../types/database';
import { db } from '../../services/db';
import { formatRupiah, formatNumber } from '../../services/pdfGenerator';
import { Modal } from '../../components/common/Modal';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Building2, 
  PiggyBank, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface KeuanganModuleProps {
  data: DatabaseSchema;
}

export const KeuanganModule: React.FC<KeuanganModuleProps> = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];

  // Tab
  const [activeTab, setActiveTab] = useState<'kas' | 'pendapatan' | 'pengeluaran' | 'piutang' | 'hutang' | 'modal_prive'>('kas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isCapitalModalOpen, setIsCapitalModalOpen] = useState(false);
  const [isPayReceivableOpen, setIsPayReceivableOpen] = useState(false);
  const [isPayPayableOpen, setIsPayPayableOpen] = useState(false);

  // Expense form
  const [expDate, setExpDate] = useState(today);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('pakan');
  const [expAmount, setExpAmount] = useState<number | ''>(150000);
  const [expMethod, setExpMethod] = useState<PaymentMethod>('Tunai');
  const [expDesc, setExpDesc] = useState('');
  const [expSupplier, setExpSupplier] = useState('');

  // Income form
  const [incDate, setIncDate] = useState(today);
  const [incCategory, setIncCategory] = useState<IncomeCategory>('lain_lain');
  const [incAmount, setIncAmount] = useState<number | ''>(200000);
  const [incMethod, setIncMethod] = useState<PaymentMethod>('Transfer Bank');
  const [incDesc, setIncDesc] = useState('');

  // Capital/Prive form
  const [capType, setCapType] = useState<'modal' | 'prive'>('modal');
  const [capAmount, setCapAmount] = useState<number | ''>(5000000);
  const [capMethod, setCapMethod] = useState<PaymentMethod>('Transfer Bank');
  const [capNotes, setCapNotes] = useState('');

  // Receivable pay state
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [rcvPayAmount, setRcvPayAmount] = useState<number>(0);
  const [rcvPayMethod, setRcvPayMethod] = useState<PaymentMethod>('Tunai');

  // Payable pay state
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [pybPayAmount, setPybPayAmount] = useState<number>(0);
  const [pybPayMethod, setPybPayMethod] = useState<PaymentMethod>('Transfer Bank');

  // Cash Calculations
  const currentCash = db.getCashBalance();

  const totalIncomeAllTime = data.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenseAllTime = data.expenses.reduce((s, e) => s + e.amount, 0);
  const totalActiveReceivable = data.receivables.filter((r) => r.status === 'belum_lunas').reduce((s, r) => s + r.remainingAmount, 0);
  const totalActivePayable = data.payables.filter((p) => p.status === 'belum_lunas').reduce((s, p) => s + p.remainingAmount, 0);

  // Capital totals
  const totalModal = data.capitalTransactions.filter((c) => c.type === 'modal').reduce((s, c) => s + c.amount, 0);
  const totalPrive = data.capitalTransactions.filter((c) => c.type === 'prive').reduce((s, c) => s + c.amount, 0);

  // Handlers
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;

    db.recordExpense({
      date: expDate,
      category: expCategory,
      amount: Number(expAmount),
      paymentMethod: expMethod,
      description: expDesc,
      supplier: expSupplier,
    });

    setIsExpenseModalOpen(false);
    setToastMessage(`Pengeluaran ${formatRupiah(Number(expAmount))} berhasil dicatat! Saldo kas berkurang.`);
    setExpDesc('');
    setExpSupplier('');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incAmount) return;

    const newInc = {
      id: `inc_${Date.now()}`,
      date: incDate,
      category: incCategory,
      amount: Number(incAmount),
      paymentMethod: incMethod,
      description: incDesc,
      createdAt: new Date().toISOString(),
    };
    data.incomes.unshift(newInc);

    // add cash
    const newCash = currentCash + Number(incAmount);
    data.cashTransactions.unshift({
      id: `ctx_${Date.now()}`,
      date: incDate,
      type: 'in',
      category: `Pendapatan ${incCategory}`,
      amount: Number(incAmount),
      description: incDesc,
      balanceAfter: newCash,
      createdAt: new Date().toISOString(),
    });

    setIsIncomeModalOpen(false);
    setToastMessage(`Pendapatan ${formatRupiah(Number(incAmount))} berhasil dicatat! Kas bertambah.`);
    setIncDesc('');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveCapital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capAmount) return;

    db.recordCapitalTransaction({
      date: today,
      type: capType,
      amount: Number(capAmount),
      paymentMethod: capMethod,
      notes: capNotes || (capType === 'modal' ? 'Suntikan Modal Pemilik' : 'Penarikan Prive Pemilik'),
    });

    setIsCapitalModalOpen(false);
    setToastMessage(`Transaksi ${capType.toUpperCase()} sebesar ${formatRupiah(Number(capAmount))} berhasil diproses!`);
    setCapNotes('');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePayReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivable || rcvPayAmount <= 0) return;

    db.payReceivable({
      receivableId: selectedReceivable.id,
      amount: rcvPayAmount,
      date: today,
      paymentMethod: rcvPayMethod,
    });

    setIsPayReceivableOpen(false);
    setSelectedReceivable(null);
    setToastMessage(`Pelunasan piutang ${formatRupiah(rcvPayAmount)} berhasil dicatat ke Kas!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePayPayable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayable || pybPayAmount <= 0) return;

    db.payPayable({
      payableId: selectedPayable.id,
      amount: pybPayAmount,
      date: today,
      paymentMethod: pybPayMethod,
    });

    setIsPayPayableOpen(false);
    setSelectedPayable(null);
    setToastMessage(`Pembayaran hutang supplier ${formatRupiah(pybPayAmount)} berhasil dikeluarkan dari Kas!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#0F5132]">
              <Wallet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Keuangan & Arus Kas Farm
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Buku kas, pencatatan pendapatan penjualan, beban pakan/operasional, kartu piutang, hutang supplier, serta modal & prive pemilik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pengeluaran</span>
          </button>
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Pendapatan Lain</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Buku Kas Tersinkron</span>
        </div>
      )}

      {/* FINANCIAL OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Kas Saldo */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F5132] to-[#0A3622] text-white border border-[#0F5132] shadow-xs col-span-2 sm:col-span-1 lg:col-span-2">
          <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
            Saldo Kas Riil Saat Ini
          </span>
          <p className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            {formatRupiah(currentCash)}
          </p>
          <p className="text-[11px] text-emerald-100/70 mt-1">
            Opening + Pemasukan - Pengeluaran
          </p>
        </div>

        {/* Pendapatan */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Pendapatan
          </span>
          <p className="text-base sm:text-lg font-black text-emerald-800 mt-1 truncate">
            {formatRupiah(totalIncomeAllTime).replace(',00', '')}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{data.incomes.length} Transaksi</p>
        </div>

        {/* Pengeluaran */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Beban Operasional
          </span>
          <p className="text-base sm:text-lg font-black text-rose-700 mt-1 truncate">
            {formatRupiah(totalExpenseAllTime).replace(',00', '')}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{data.expenses.length} Transaksi</p>
        </div>

        {/* Piutang */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Piutang Pelanggan
          </span>
          <p className="text-base sm:text-lg font-black text-amber-700 mt-1 truncate">
            {formatRupiah(totalActiveReceivable).replace(',00', '')}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Belum Lunas</p>
        </div>

        {/* Hutang Supplier */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Hutang Usaha Supplier
          </span>
          <p className="text-base sm:text-lg font-black text-gray-900 mt-1 truncate">
            {formatRupiah(totalActivePayable).replace(',00', '')}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">Tempo Pakan</p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        {[
          { id: 'kas', label: 'Buku Kas & Arus Kas' },
          { id: 'pendapatan', label: 'Pendapatan' },
          { id: 'pengeluaran', label: 'Pengeluaran Beban' },
          { id: 'piutang', label: `Piutang (${formatRupiah(totalActiveReceivable).replace(',00', '')})` },
          { id: 'hutang', label: `Hutang Supplier (${formatRupiah(totalActivePayable).replace(',00', '')})` },
          { id: 'modal_prive', label: 'Modal & Prive' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-white text-[#0F5132] font-bold shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BUKU KAS & ARUS KAS */}
      {activeTab === 'kas' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">
              Buku Kas Harian & Mutasi Kas Operasional
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Saldo: {formatRupiah(currentCash)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3 text-right">Uang Masuk</th>
                  <th className="py-2.5 px-3 text-right">Uang Keluar</th>
                  <th className="py-2.5 px-3 text-right">Saldo Kas Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.cashTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      {tx.category}
                    </td>
                    <td className="py-3 px-3 text-gray-600 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {tx.type === 'in' ? `+${formatRupiah(tx.amount)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600">
                      {tx.type === 'out' ? `-${formatRupiah(tx.amount)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-gray-900">
                      {formatRupiah(tx.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PENDAPATAN */}
      {activeTab === 'pendapatan' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Rincian Pendapatan Farm
              </h3>
              <p className="text-xs text-gray-500">
                Kategori: Penjualan Telur, Produk Lain, Lain-lain
              </p>
            </div>
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0F5132] text-white text-xs font-bold hover:bg-[#0A3622]"
            >
              + Pendapatan Baru
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3 text-right">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.incomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{inc.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {inc.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-medium">{inc.description}</td>
                    <td className="py-3 px-3 text-gray-600">{inc.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-800">{formatRupiah(inc.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PENGELUARAN BEBAN */}
      {activeTab === 'pengeluaran' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Rincian Beban Operasional Farm
              </h3>
              <p className="text-xs text-gray-500">
                Pakan, Vitamin, Obat, Listrik, Air, Transport, Kemasan, Perawatan, Lainnya
              </p>
            </div>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
            >
              + Catat Beban
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Kategori Beban</th>
                  <th className="py-2.5 px-3">Deskripsi</th>
                  <th className="py-2.5 px-3">Pemasok / Supplier</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3 text-right">Jumlah Beban</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{exp.date}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-medium">{exp.description}</td>
                    <td className="py-3 px-3 text-gray-500">{exp.supplier || '-'}</td>
                    <td className="py-3 px-3 text-gray-600">{exp.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-black text-rose-700">{formatRupiah(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PIUTANG */}
      {activeTab === 'piutang' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Daftar Tagihan Piutang Pelanggan
              </h3>
              <p className="text-xs text-gray-500">
                Mendukung cicilan bertahap (partial payment) maupun pelunasan penuh
              </p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
              Total Piutang: {formatRupiah(totalActiveReceivable)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3">No. Faktur</th>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">Tgl Transaksi</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                  <th className="py-2.5 px-3 text-right">Sudah Dibayar</th>
                  <th className="py-2.5 px-3 text-right">Sisa Piutang</th>
                  <th className="py-2.5 px-3 text-right">Aksi Bayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.receivables.map((rcv) => (
                  <tr key={rcv.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-3 font-mono font-bold text-gray-900">{rcv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-semibold text-gray-800">{rcv.customerName}</td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{rcv.date}</td>
                    <td className="py-3 px-3 text-rose-600 font-medium whitespace-nowrap">{rcv.dueDate}</td>
                    <td className="py-3 px-3 text-right font-medium text-gray-700">{formatRupiah(rcv.totalAmount)}</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-medium">{formatRupiah(rcv.paidAmount)}</td>
                    <td className="py-3 px-3 text-right font-black text-rose-700">{formatRupiah(rcv.remainingAmount)}</td>
                    <td className="py-3 px-3 text-right">
                      {rcv.status === 'belum_lunas' ? (
                        <button
                          onClick={() => {
                            setSelectedReceivable(rcv);
                            setRcvPayAmount(rcv.remainingAmount);
                            setIsPayReceivableOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 text-xs shadow-2xs"
                        >
                          Catat Bayar
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Lunas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: HUTANG USAHA SUPPLIER */}
      {activeTab === 'hutang' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Daftar Hutang Usaha ke Pemasok (Payables)
              </h3>
              <p className="text-xs text-gray-500">
                Pakan konsentrat, jagung, obat & kemasan yang dibeli tempo
              </p>
            </div>
            <span className="text-xs font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-xl">
              Total Hutang: {formatRupiah(totalActivePayable)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3">Nama Pemasok / Supplier</th>
                  <th className="py-2.5 px-3">Deskripsi Pembelian</th>
                  <th className="py-2.5 px-3">Tgl Beli</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3 text-right">Total Hutang</th>
                  <th className="py-2.5 px-3 text-right">Telah Dicicil</th>
                  <th className="py-2.5 px-3 text-right">Sisa Hutang</th>
                  <th className="py-2.5 px-3 text-right">Aksi Pelunasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.payables.map((pyb) => (
                  <tr key={pyb.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-3 font-bold text-gray-900">{pyb.supplierName}</td>
                    <td className="py-3 px-3 text-gray-700">{pyb.description}</td>
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{pyb.date}</td>
                    <td className="py-3 px-3 text-amber-700 font-medium whitespace-nowrap">{pyb.dueDate}</td>
                    <td className="py-3 px-3 text-right font-medium text-gray-700">{formatRupiah(pyb.totalAmount)}</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-medium">{formatRupiah(pyb.paidAmount)}</td>
                    <td className="py-3 px-3 text-right font-black text-gray-900">{formatRupiah(pyb.remainingAmount)}</td>
                    <td className="py-3 px-3 text-right">
                      {pyb.status === 'belum_lunas' ? (
                        <button
                          onClick={() => {
                            setSelectedPayable(pyb);
                            setPybPayAmount(pyb.remainingAmount);
                            setIsPayPayableOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-gray-800 text-white font-bold hover:bg-black text-xs shadow-2xs"
                        >
                          Bayar Hutang
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Lunas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: MODAL & PRIVE */}
      {activeTab === 'modal_prive' && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Ekuitas: Modal & Penarikan Prive Pemilik
              </h3>
              <p className="text-xs text-gray-500">
                <strong className="text-amber-700">Penting:</strong> Penarikan Prive mengurangi Kas & Ekuitas, TIDAK diklasifikasikan sebagai beban operasional.
              </p>
            </div>
            <button
              onClick={() => setIsCapitalModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0F5132] text-white text-xs font-bold hover:bg-[#0A3622]"
            >
              + Transaksi Modal / Prive
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Total Setoran Modal Pemilik (In)
              </span>
              <p className="text-2xl font-black text-[#0F5132] mt-1">{formatRupiah(totalModal)}</p>
              <p className="text-[11px] text-emerald-700 mt-1">Suntikan dana segar modal kerja farm</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Total Penarikan Prive Pemilik (Out)
              </span>
              <p className="text-2xl font-black text-amber-900 mt-1">{formatRupiah(totalPrive)}</p>
              <p className="text-[11px] text-amber-800 mt-1">Penarikan laba pribadi (bukan biaya kandang)</p>
            </div>
          </div>

          {/* Capital ledger */}
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Jenis Transaksi</th>
                  <th className="py-2.5 px-3">Keterangan / Tujuan</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.capitalTransactions.map((cap) => (
                  <tr key={cap.id} className="hover:bg-gray-50/70">
                    <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{cap.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        cap.type === 'modal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cap.type === 'modal' ? 'Setoran Modal' : 'Prive Pemilik'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-medium">{cap.notes}</td>
                    <td className="py-3 px-3 text-gray-600">{cap.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-black text-gray-900">{formatRupiah(cap.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PENGELUARAN BEBAN */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Catat Pengeluaran Operasional"
        subtitle="Pakan, vitamin, listrik, transport, kemasan, atau perawatan"
      >
        <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Kategori Beban</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white capitalize"
              >
                <option value="pakan">Pakan</option>
                <option value="vitamin">Vitamin</option>
                <option value="obat">Obat & Vaksin</option>
                <option value="listrik">Listrik</option>
                <option value="air">Air</option>
                <option value="transport">Transportasi & BBM</option>
                <option value="kemasan">Kemasan & Tray</option>
                <option value="perawatan">Perawatan Kandang</option>
                <option value="gaji">Gaji / Upah Operator</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Nominal Biaya (Rp)</label>
            <input
              type="number"
              min="1"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-base font-black px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Tunai', 'Transfer Bank', 'QRIS'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setExpMethod(m)}
                  className={`py-2 px-2 rounded-xl border font-bold text-xs ${
                    expMethod === m
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Penerima / Toko / Supplier</label>
            <input
              type="text"
              placeholder="Contoh: Toko Listrik Sinar Baru / SPBU Malang"
              value={expSupplier}
              onChange={(e) => setExpSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Deskripsi Rincian Beban</label>
            <input
              type="text"
              placeholder="Contoh: Beli lampu penghangat kandang anak ayam 4 pcs"
              value={expDesc}
              onChange={(e) => setExpDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700"
            >
              Simpan Pengeluaran
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL PENDAPATAN LAIN */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="Catat Pendapatan Lain-lain"
        subtitle="Penjualan pupuk kotoran ayam, karung bekas, atau afkir"
      >
        <form onSubmit={handleSaveIncome} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={incDate}
                onChange={(e) => setIncDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Kategori</label>
              <select
                value={incCategory}
                onChange={(e) => setIncCategory(e.target.value as IncomeCategory)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
              >
                <option value="produk_lain">Produk Lain (Pupuk / Karung)</option>
                <option value="lain_lain">Pendapatan Lain-lain</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Nominal Diterima (Rp)</label>
            <input
              type="number"
              min="1"
              value={incAmount}
              onChange={(e) => setIncAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-base font-black px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Metode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Tunai', 'Transfer Bank', 'QRIS'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setIncMethod(m)}
                  className={`py-2 px-2 rounded-xl border font-bold text-xs ${
                    incMethod === m
                      ? 'bg-[#0F5132] text-white border-[#0F5132]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Keterangan Pendapatan</label>
            <input
              type="text"
              placeholder="Contoh: Penjualan pupuk kandang 50 karung ke petani jeruk"
              value={incDesc}
              onChange={(e) => setIncDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsIncomeModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622]"
            >
              Simpan Pendapatan
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL MODAL & PRIVE */}
      <Modal
        isOpen={isCapitalModalOpen}
        onClose={() => setIsCapitalModalOpen(false)}
        title="Catat Suntikan Modal / Penarikan Prive"
        subtitle="Transaksi ekuitas pemilik farm"
      >
        <form onSubmit={handleSaveCapital} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1.5">Jenis Transaksi Ekuitas</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCapType('modal')}
                className={`py-2.5 rounded-xl border font-bold text-xs ${
                  capType === 'modal'
                    ? 'bg-[#0F5132] text-white border-[#0F5132]'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                Setoran Modal (Kas Masuk)
              </button>
              <button
                type="button"
                onClick={() => setCapType('prive')}
                className={`py-2.5 rounded-xl border font-bold text-xs ${
                  capType === 'prive'
                    ? 'bg-amber-700 text-white border-amber-700'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                Penarikan Prive (Kas Keluar)
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Nominal (Rp)</label>
            <input
              type="number"
              min="1"
              value={capAmount}
              onChange={(e) => setCapAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full text-base font-black px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Keterangan / Catatan Pemilik</label>
            <input
              type="text"
              placeholder={capType === 'modal' ? 'Tambahan modal kerja awal bulan' : 'Penarikan laba pribadi H. Bambang'}
              value={capNotes}
              onChange={(e) => setCapNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-[11px]">
            <strong>Catatan Akuntansi:</strong> Transaksi Prive dicatat sebagai penarikan modal pemilik dan tidak akan mengurangi laba bersih operasional ayam.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCapitalModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622]"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL BAYAR PIUTANG */}
      <Modal
        isOpen={isPayReceivableOpen}
        onClose={() => setIsPayReceivableOpen(false)}
        title="Pembayaran Piutang Pelanggan"
        subtitle={`Faktur ${selectedReceivable?.invoiceNumber} - ${selectedReceivable?.customerName}`}
      >
        {selectedReceivable && (
          <form onSubmit={handlePayReceivable} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-gray-500">Sisa Tagihan Piutang:</span>
              <p className="text-xl font-black text-rose-700 mt-0.5">{formatRupiah(selectedReceivable.remainingAmount)}</p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Nominal Bayar (Rp)</label>
              <input
                type="number"
                min="1"
                max={selectedReceivable.remainingAmount}
                value={rcvPayAmount}
                onChange={(e) => setRcvPayAmount(Number(e.target.value))}
                className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Metode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Tunai', 'Transfer Bank', 'QRIS'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRcvPayMethod(m)}
                    className={`py-2 rounded-xl border font-bold ${
                      rcvPayMethod === m ? 'bg-[#0F5132] text-white border-[#0F5132]' : 'bg-white text-gray-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPayReceivableOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622]"
              >
                Konfirmasi Masuk Kas
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL BAYAR HUTANG SUPPLIER */}
      <Modal
        isOpen={isPayPayableOpen}
        onClose={() => setIsPayPayableOpen(false)}
        title="Pembayaran Hutang ke Supplier"
        subtitle={`Pemasok: ${selectedPayable?.supplierName}`}
      >
        {selectedPayable && (
          <form onSubmit={handlePayPayable} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-500">Sisa Hutang ke Supplier:</span>
              <p className="text-xl font-black text-gray-900 mt-0.5">{formatRupiah(selectedPayable.remainingAmount)}</p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Nominal Dibayarkan (Rp)</label>
              <input
                type="number"
                min="1"
                max={selectedPayable.remainingAmount}
                value={pybPayAmount}
                onChange={(e) => setPybPayAmount(Number(e.target.value))}
                className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Transfer Bank', 'Tunai'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPybPayMethod(m)}
                    className={`py-2 rounded-xl border font-bold ${
                      pybPayMethod === m ? 'bg-[#0F5132] text-white border-[#0F5132]' : 'bg-white text-gray-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPayPayableOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-black"
              >
                Konfirmasi Kas Keluar
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
