import React, { useState, useMemo } from 'react';
import { DatabaseSchema, Sale, PaymentMethod, PaymentStatus, Customer } from '../../types/database';
import { db } from '../../services/db';
import { formatRupiah, formatNumber } from '../../services/pdfGenerator';
import { ReceiptModal } from './ReceiptModal';
import { 
  ShoppingCart, 
  UserPlus, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Wallet, 
  QrCode,
  Calendar,
  History,
  FileText,
  Search,
  RotateCcw,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';

interface KasirModuleProps {
  data: DatabaseSchema;
}

export const KasirModule: React.FC<KasirModuleProps> = ({ data }) => {
  // Available Egg Stock
  const eggInventoryItem = data.inventory.find((i) => i.id === 'inv_telur');
  const availableEggStock = eggInventoryItem ? eggInventoryItem.stock : 0;

  // POS Form States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    data.customers.length > 0 ? data.customers[0].id : ''
  );
  const [quantityKg, setQuantityKg] = useState<number | ''>(10);
  const [pricePerKg, setPricePerKg] = useState<number>(data.settings.defaultEggPrice || 26500);
  const [discount, setDiscount] = useState<number | ''>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('lunas');
  const [dpAmount, setDpAmount] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');

  // Active Completed Sale for Receipt Modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Cancellation State (Salah Input Kasir)
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelSaleReason, setCancelSaleReason] = useState<string>('Salah input data kasir');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick "+ Pelanggan Baru" modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustType, setNewCustType] = useState<Customer['type']>('Langganan');

  // Search in Recent Transactions
  const [searchInvoice, setSearchInvoice] = useState('');

  // Calculations
  const numQty = typeof quantityKg === 'number' ? quantityKg : 0;
  const subtotal = Number((numQty * pricePerKg).toFixed(0));
  const numDiscount = typeof discount === 'number' ? discount : 0;
  const totalAmount = Math.max(0, subtotal - numDiscount);

  // Auto calculate paid & balance
  const paidAmount = useMemo(() => {
    if (paymentStatus === 'lunas') return totalAmount;
    if (paymentStatus === 'belum_bayar') return 0;
    if (paymentStatus === 'dp') {
      const dp = typeof dpAmount === 'number' ? dpAmount : 0;
      return Math.min(totalAmount, dp);
    }
    return totalAmount;
  }, [paymentStatus, totalAmount, dpAmount]);

  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const selectedCustomer = data.customers.find((c) => c.id === selectedCustomerId);

  // Quick Qty Increments
  const addQty = (amount: number) => {
    const current = typeof quantityKg === 'number' ? quantityKg : 0;
    setQuantityKg(Number((current + amount).toFixed(1)));
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (numQty <= 0) return;
    if (!selectedCustomer) return;

    // Record sale through integrated transaction
    const newSale = db.recordSale({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      totalKg: numQty,
      pricePerKg,
      discount: numDiscount,
      paidAmount,
      paymentMethod,
      paymentStatus,
      dueDate: balanceDue > 0 ? dueDate : undefined,
      notes,
    });

    // Open receipt modal immediately
    setCompletedSale(newSale);

    // Reset some fields for next customer
    setQuantityKg(10);
    setDiscount(0);
    setNotes('');
    setDpAmount('');
    setPaymentStatus('lunas');
  };

  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName) return;

    const created = db.addCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress,
      type: newCustType,
      notes: 'Ditambahkan langsung dari Kasir POS',
    });

    setSelectedCustomerId(created.id);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
  };

  // Filter recent sales
  const recentSales = useMemo(() => {
    return data.sales.filter((s) => {
      if (!searchInvoice) return true;
      const q = searchInvoice.toLowerCase();
      return (
        s.invoiceNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q)
      );
    });
  }, [data.sales, searchInvoice]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Sinkron Otomatis</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#0F5132]">
              <ShoppingCart className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Kasir POS Penjualan Telur Segar
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Dirancang praktis untuk layar sentuh kasir farm. Menjual telur otomatis memotong stok & mencatat laporan.
          </p>
        </div>

        {/* Stock status indicator */}
        <div className="flex items-center gap-3 bg-[#FAF9F6] border border-emerald-900/10 px-4 py-2 rounded-xl text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] font-bold uppercase">Stok Siap Jual</span>
            <span className={`font-black text-sm ${availableEggStock < 20 ? 'text-rose-600' : 'text-[#0F5132]'}`}>
              {formatNumber(availableEggStock, 1)} Kg
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <div>
            <span className="text-gray-400 block text-[10px] font-bold uppercase">Harga Standar</span>
            <span className="font-bold text-gray-800 text-sm">
              {formatRupiah(data.settings.defaultEggPrice)}/kg
            </span>
          </div>
        </div>
      </div>

      {/* POS INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Transaction Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs">
          <form onSubmit={handleCheckout} className="space-y-5">
            {/* 1. Pilih Pelanggan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700">
                  1. Pilih Pelanggan
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(true)}
                  className="text-xs font-bold text-[#0F5132] hover:text-[#0A3622] flex items-center gap-1 hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Pelanggan Baru</span>
                </button>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] font-semibold text-gray-800 bg-white"
                required
              >
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type}) {c.outstandingReceivable > 0 ? `• Piutang: ${formatRupiah(c.outstandingReceivable)}` : ''}
                  </option>
                ))}
              </select>

              {selectedCustomer && (
                <div className="mt-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <div>
                    <span className="font-medium text-gray-800">{selectedCustomer.phone || 'No Telp: -'}</span>
                    <p className="text-[11px] text-gray-500 truncate max-w-xs">{selectedCustomer.address}</p>
                  </div>
                  {selectedCustomer.outstandingReceivable > 0 && (
                    <span className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold">
                      Hutang: {formatRupiah(selectedCustomer.outstandingReceivable)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Jumlah Kg & Quick Buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                2. Kuantitas Telur (Kg)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 text-base sm:text-lg font-black px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] text-gray-900"
                  required
                />
                <span className="font-bold text-gray-500 text-sm px-1">Kg</span>
              </div>

              {/* Touchscreen Quick Stepper Buttons */}
              <div className="flex flex-wrap gap-2 mt-2">
                {[1, 5, 10, 15, 25, 50, 100].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => addQty(inc)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-[#0F5132] text-gray-700 font-bold text-xs transition-colors active:scale-95 shadow-2xs"
                  >
                    +{inc} kg
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setQuantityKg(1)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-colors"
                >
                  Reset
                </button>
              </div>

              {numQty > availableEggStock && (
                <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Peringatan: Kuantitas ({numQty} kg) melebihi stok fisik saat ini ({availableEggStock} kg).
                  </span>
                </div>
              )}
            </div>

            {/* 3. Harga per Kg & Diskon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Harga Jual per Kg (Rp)
                </label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Diskon Potongan (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : 0)}
                  placeholder="0"
                  className="w-full text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                />
              </div>
            </div>

            {/* 4. Metode Pembayaran */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                4. Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Tunai', icon: Wallet, label: 'Tunai' },
                  { id: 'Transfer Bank', icon: CreditCard, label: 'Transfer BCA' },
                  { id: 'QRIS', icon: QrCode, label: 'QRIS Instan' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0F5132] text-white border-[#0F5132] shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Status Pembayaran */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                5. Status Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lunas', label: 'Lunas', color: 'text-emerald-700' },
                  { id: 'dp', label: 'DP (Uang Muka)', color: 'text-amber-700' },
                  { id: 'belum_bayar', label: 'Tempo / Piutang', color: 'text-rose-700' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPaymentStatus(s.id as PaymentStatus)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      paymentStatus === s.id
                        ? 'bg-[#0A3622] text-white border-[#0A3622] shadow-xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* DP Input if DP selected */}
              {paymentStatus === 'dp' && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-900">Masukkan Nominal DP Diterima (Rp):</span>
                    <span className="text-[11px] text-amber-700">Total: {formatRupiah(totalAmount)}</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={dpAmount}
                    onChange={(e) => setDpAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Contoh: 1000000"
                    className="w-full text-sm font-black px-3.5 py-2 rounded-xl bg-white border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <div className="flex justify-between text-xs text-amber-900 font-bold pt-1">
                    <span>Sisa Piutang:</span>
                    <span>{formatRupiah(balanceDue)}</span>
                  </div>
                </div>
              )}

              {/* Due Date if Piutang or DP */}
              {(paymentStatus === 'dp' || paymentStatus === 'belum_bayar') && (
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Jatuh Tempo Piutang
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
                    required
                  />
                </div>
              )}
            </div>

            {/* 6. Catatan */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Catatan Transaksi / Pengiriman
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Diambil langsung oleh Bu Sri / titip kurir farm"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white font-black text-sm sm:text-base transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                <span>Simpan Transaksi & Terbitkan Struk ({formatRupiah(totalAmount)})</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Bill Summary & Quick Receipt Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Bill Summary Card */}
          <div className="bg-[#FAF9F6] rounded-2xl p-5 border border-emerald-900/10 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/10">
              <h3 className="font-bold text-sm text-gray-900">
                Ringkasan Transaksi Kasir
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0F5132]">
                Otomatis Sync
              </span>
            </div>

            <div className="py-4 space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-bold text-gray-900">{selectedCustomer?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>Kuantitas:</span>
                <span className="font-bold text-gray-900">{numQty} Kg Telur Segar</span>
              </div>
              <div className="flex justify-between">
                <span>Harga Satuan:</span>
                <span className="font-medium text-gray-800">{formatRupiah(pricePerKg)} / kg</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatRupiah(subtotal)}</span>
              </div>
              {numDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>- {formatRupiah(numDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm sm:text-base font-black text-[#0F5132] pt-2 border-t border-gray-200">
                <span>TOTAL AKHIR:</span>
                <span>{formatRupiah(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-700 pt-1">
                <span>Uang Diterima:</span>
                <span className="font-bold">{formatRupiah(paidAmount)}</span>
              </div>
              {balanceDue > 0 && (
                <div className="flex justify-between font-bold text-rose-700 bg-rose-50 p-2 rounded-lg">
                  <span>Sisa Piutang (Tempo):</span>
                  <span>{formatRupiah(balanceDue)}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-white border border-gray-200/80 text-[11px] text-gray-500 space-y-1">
              <p className="font-bold text-[#0F5132]">Otomatisasi Sekali Klik:</p>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                <li>Stok Telur terpotong otomatis: <strong className="text-rose-600">-{numQty} kg</strong></li>
                <li>Kas masuk: <strong className="text-emerald-700">+{formatRupiah(paidAmount)}</strong></li>
                {balanceDue > 0 && (
                  <li>Buku piutang pelanggan bertambah: <strong className="text-rose-600">+{formatRupiah(balanceDue)}</strong></li>
                )}
                <li>Omzet & laba rugi hari ini seketika terupdate</li>
              </ul>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs">
            <h4 className="font-bold text-xs text-gray-800 mb-2">Instruksi Kasir Farm:</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Setelah tombol simpan ditekan, sistem langsung memunculkan pratinjau Struk Digital 58mm untuk printer thermal mini kasir dan Faktur A4 resmi yang bisa di-download maupun dibagikan ke nomor WhatsApp pelanggan.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT SALES TABLE WITH RECEIPT RE-PRINT */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <History className="w-4 h-4 text-[#0F5132]" />
              Riwayat Penjualan Kasir Hari Ini & Terakhir
            </h3>
            <p className="text-xs text-gray-500">
              Total {data.sales.length} transaksi penjualan tercatat
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari No Faktur / Pelanggan..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3">No. Faktur</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Volume (Kg)</th>
                <th className="py-2.5 px-3">Total (Rp)</th>
                <th className="py-2.5 px-3">Dibayar</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Metode</th>
                <th className="py-2.5 px-3 text-right">Aksi Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-gray-900">
                    {sale.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                    {sale.date}
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-800">
                    {sale.customerName}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0F5132]">
                    {sale.totalKg} kg
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900">
                    {formatRupiah(sale.totalAmount)}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {formatRupiah(sale.paidAmount)}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sale.paymentStatus === 'lunas'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sale.paymentStatus === 'dp'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {sale.paymentMethod}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                    <button
                      onClick={() => setCompletedSale(sale)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0F5132] hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                      title="Cetak ulang Struk Digital / Faktur A4"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Struk</span>
                    </button>
                    <button
                      onClick={() => {
                        setSaleToCancel(sale);
                        setCancelSaleReason('Salah input data kasir / pembatalan pelanggan');
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      title="Batalkan transaksi ini jika salah input (stok & kas disesuaikan)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Batal</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ADD CUSTOMER MODAL */}
      <Modal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title="Tambah Pelanggan Baru"
        subtitle="Registrasi data pelanggan untuk pencatatan riwayat & piutang"
      >
        <form onSubmit={handleSaveNewCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nama Lengkap Pelanggan / Toko
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Toko Berkah Mandiri / Bu Endang"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                No. WhatsApp / HP
              </label>
              <input
                type="text"
                placeholder="0812xxxxxxxx"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Kategori Pelanggan
              </label>
              <select
                value={newCustType}
                onChange={(e) => setNewCustType(e.target.value as any)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none bg-white"
              >
                <option value="Grosir">Grosir (Volume Besar)</option>
                <option value="Agen">Agen Telur</option>
                <option value="Toko">Toko / Warung</option>
                <option value="Langganan">Langganan (Bakery/Resto)</option>
                <option value="Retail">Retail (Eceran)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              rows={2}
              placeholder="Alamat kios atau lokasi pengiriman..."
              value={newCustAddress}
              onChange={(e) => setNewCustAddress(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCustomerOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F5132] text-white text-xs font-bold hover:bg-[#0A3622]"
            >
              Simpan Pelanggan
            </button>
          </div>
        </form>
      </Modal>

      {/* DIGITAL RECEIPT & INVOICE MODAL */}
      <ReceiptModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
        settings={data.settings}
      />

      {/* MODAL KONFIRMASI PEMBATALAN TRANSAKSI PENJUALAN KASIR */}
      {saleToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Batalkan Penjualan Kasir?</h3>
                  <p className="text-[11px] text-gray-500">Void transaksi faktur {saleToCancel.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSaleToCancel(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-gray-600">
              <div className="p-3.5 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">No. Faktur:</span>
                  <span className="font-bold text-gray-900 font-mono">{saleToCancel.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pelanggan:</span>
                  <span className="font-bold text-gray-900">{saleToCancel.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Volume Telur:</span>
                  <span className="font-bold text-[#0F5132]">+{saleToCancel.totalKg} Kg (Akan dikembalikan ke stok)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Transaksi:</span>
                  <span className="font-bold text-gray-900">{formatRupiah(saleToCancel.totalAmount)}</span>
                </div>
                {saleToCancel.paidAmount > 0 && (
                  <div className="flex justify-between text-rose-700 font-bold">
                    <span>Uang Kas Masuk:</span>
                    <span>-{formatRupiah(saleToCancel.paidAmount)} (Dikeluarkan dari kas)</span>
                  </div>
                )}
              </div>

              {/* Alasan Pembatalan */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Alasan Pembatalan / Void
                </label>
                <input
                  type="text"
                  value={cancelSaleReason}
                  onChange={(e) => setCancelSaleReason(e.target.value)}
                  placeholder="Contoh: Salah input kilogram, pelanggan membatalkan pesanan"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] leading-relaxed">
                <strong>Dampak Otomatis:</strong> Stok telur akan otomatis bertambah kembali <strong>+{saleToCancel.totalKg} kg</strong> ke gudang, dan uang pembayaran kas/piutang akan dibersihkan dari buku besar.
              </div>
            </div>

            <div className="mt-5 pt-3 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSaleToCancel(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = db.cancelSale(saleToCancel.id, cancelSaleReason);
                  setSaleToCancel(null);
                  setToastMessage(res.message);
                  setTimeout(() => setToastMessage(null), 4500);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Batalkan Penjualan Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
