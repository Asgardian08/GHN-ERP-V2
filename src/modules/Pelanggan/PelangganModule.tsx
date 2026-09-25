import React, { useState, useMemo } from 'react';
import { DatabaseSchema, Customer, PaymentMethod } from '../../types/database';
import { db } from '../../services/db';
import { formatRupiah, formatNumber } from '../../services/pdfGenerator';
import { Modal } from '../../components/common/Modal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle2,
  CalendarClock,
  History,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface PelangganModuleProps {
  data: DatabaseSchema;
}

export const PelangganModule: React.FC<PelangganModuleProps> = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPayReceivableOpen, setIsPayReceivableOpen] = useState(false);
  const [receivableToPay, setReceivableToPay] = useState<{ id: string; invoiceNumber: string; remaining: number } | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Tunai');
  const [payNotes, setPayNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Customer Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType] = useState<Customer['type']>('Langganan');
  const [newNotes, setNewNotes] = useState('');

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    return data.customers.filter((c) => {
      if (filterType === 'receivable' && c.outstandingReceivable <= 0) return false;
      if (filterType !== 'all' && filterType !== 'receivable' && c.type !== filterType) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.customers, filterType, searchQuery]);

  const activeCustomer = data.customers.find((c) => c.id === selectedCustomerId);

  // Active customer's sales & preorders
  const customerSales = useMemo(() => {
    if (!activeCustomer) return [];
    return data.sales.filter((s) => s.customerId === activeCustomer.id);
  }, [data.sales, activeCustomer]);

  const customerPreOrders = useMemo(() => {
    if (!activeCustomer) return [];
    return data.preorders.filter((p) => p.customerId === activeCustomer.id);
  }, [data.preorders, activeCustomer]);

  const customerReceivables = useMemo(() => {
    if (!activeCustomer) return [];
    return data.receivables.filter((r) => r.customerId === activeCustomer.id && r.status === 'belum_lunas');
  }, [data.receivables, activeCustomer]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    db.addCustomer({
      name: newName,
      phone: newPhone,
      address: newAddress,
      type: newType,
      notes: newNotes,
    });

    setIsAddOpen(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewNotes('');

    setToastMessage(`Pelanggan ${newName} berhasil ditambahkan!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePayReceivableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivableToPay || payAmount <= 0) return;

    db.payReceivable({
      receivableId: receivableToPay.id,
      amount: payAmount,
      date: today,
      paymentMethod: payMethod,
      notes: payNotes,
    });

    setIsPayReceivableOpen(false);
    setReceivableToPay(null);
    setToastMessage(`Pembayaran piutang ${formatRupiah(payAmount)} berhasil dicatat! Kas bertambah.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#0F5132]">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Buku Pelanggan & Kartu Piutang
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Riwayat pembelian, total kg telur, akumulasi belanja, dan status piutang ter-update otomatis dari setiap transaksi Kasir.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-[#0F5132] hover:bg-[#0A3622] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Pelanggan Baru</span>
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Buku Kas & Piutang Terupdate</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'receivable', label: 'Ada Piutang' },
            { id: 'Grosir', label: 'Grosir' },
            { id: 'Agen', label: 'Agen' },
            { id: 'Langganan', label: 'Langganan' },
            { id: 'Retail', label: 'Retail' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterType === f.id
                  ? 'bg-white text-[#0F5132] font-bold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Cari nama, no HP, alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
        </div>
      </div>

      {/* CUSTOMER CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  cust.type === 'Grosir'
                    ? 'bg-emerald-100 text-emerald-900'
                    : cust.type === 'Agen'
                    ? 'bg-blue-100 text-blue-900'
                    : cust.type === 'Langganan'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {cust.type}
                </span>

                {cust.outstandingReceivable > 0 ? (
                  <span className="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full animate-pulse">
                    Piutang: {formatRupiah(cust.outstandingReceivable)}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Tertib Lunas
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base mt-2.5">
                {cust.name}
              </h3>

              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{cust.phone || '-'}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{cust.address || '-'}</span>
                </div>
              </div>

              {/* Automatic Stats Box */}
              <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Total Order</span>
                  <p className="font-bold text-gray-800 mt-0.5">{cust.totalPurchases}x</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Volume Telur</span>
                  <p className="font-bold text-[#0F5132] mt-0.5">{formatNumber(cust.totalKg, 1)} kg</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold">Akumulasi</span>
                  <p className="font-bold text-gray-900 mt-0.5 truncate">{formatRupiah(cust.totalSpent).replace(',00', '')}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              {cust.outstandingReceivable > 0 ? (
                <button
                  onClick={() => {
                    const firstRcv = data.receivables.find((r) => r.customerId === cust.id && r.status === 'belum_lunas');
                    if (firstRcv) {
                      setReceivableToPay({
                        id: firstRcv.id,
                        invoiceNumber: firstRcv.invoiceNumber,
                        remaining: firstRcv.remainingAmount,
                      });
                      setPayAmount(firstRcv.remainingAmount);
                      setIsPayReceivableOpen(true);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95"
                >
                  Bayar Piutang
                </button>
              ) : (
                <span className="text-[11px] text-gray-400 font-medium">Tidak ada tunggakan</span>
              )}

              <button
                onClick={() => setSelectedCustomerId(cust.id)}
                className="text-xs font-bold text-[#0F5132] hover:text-[#0A3622] flex items-center gap-1 hover:underline"
              >
                <span>Buka Detail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CUSTOMER DETAIL MODAL */}
      <Modal
        isOpen={Boolean(activeCustomer)}
        onClose={() => setSelectedCustomerId(null)}
        title={activeCustomer?.name || 'Detail Pelanggan'}
        subtitle={`Kategori: ${activeCustomer?.type} • Terdaftar sejak ${activeCustomer?.createdAt}`}
        maxWidth="3xl"
      >
        {activeCustomer && (
          <div className="space-y-5 text-xs">
            {/* Top Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Total Order</span>
                <p className="text-lg font-black text-gray-900 mt-0.5">{activeCustomer.totalPurchases} Transaksi</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold uppercase">Total Telur Dibeli</span>
                <p className="text-lg font-black text-[#0F5132] mt-0.5">{formatNumber(activeCustomer.totalKg, 1)} Kg</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Total Nilai Belanja</span>
                <p className="text-lg font-black text-gray-900 mt-0.5">{formatRupiah(activeCustomer.totalSpent)}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-800 font-bold uppercase">Sisa Piutang Aktif</span>
                <p className="text-lg font-black text-rose-700 mt-0.5">{formatRupiah(activeCustomer.outstandingReceivable)}</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">Telepon / WhatsApp: {activeCustomer.phone}</p>
                <p className="text-gray-500">Alamat: {activeCustomer.address}</p>
                {activeCustomer.notes && <p className="text-gray-500 italic">Catatan: {activeCustomer.notes}</p>}
              </div>

              {activeCustomer.outstandingReceivable > 0 && customerReceivables.length > 0 && (
                <div className="shrink-0 flex items-center">
                  <button
                    onClick={() => {
                      const rcv = customerReceivables[0];
                      setReceivableToPay({
                        id: rcv.id,
                        invoiceNumber: rcv.invoiceNumber,
                        remaining: rcv.remainingAmount,
                      });
                      setPayAmount(rcv.remainingAmount);
                      setIsPayReceivableOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    Pelunasan Piutang ({formatRupiah(activeCustomer.outstandingReceivable)})
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: ORDER HISTORY */}
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0F5132]" />
                Riwayat Pembelian Kasir POS ({customerSales.length})
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[10px] text-gray-400 uppercase font-bold">
                    <tr>
                      <th className="p-2.5">Faktur</th>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">Kuantitas</th>
                      <th className="p-2.5">Total</th>
                      <th className="p-2.5">Dibayar</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono font-bold text-gray-900">{sale.invoiceNumber}</td>
                        <td className="p-2.5 text-gray-600">{sale.date}</td>
                        <td className="p-2.5 font-bold text-[#0F5132]">{sale.totalKg} kg</td>
                        <td className="p-2.5 font-semibold text-gray-900">{formatRupiah(sale.totalAmount)}</td>
                        <td className="p-2.5 text-gray-600">{formatRupiah(sale.paidAmount)}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sale.paymentStatus === 'lunas' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sale.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {customerSales.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-400">
                          Belum ada riwayat transaksi penjualan untuk pelanggan ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TAB 2: PRE ORDER HISTORY */}
            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
                <CalendarClock className="w-4 h-4 text-indigo-700" />
                Riwayat Pre Order Telur ({customerPreOrders.length})
              </h4>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-[10px] text-gray-400 uppercase font-bold">
                    <tr>
                      <th className="p-2.5">No. Order</th>
                      <th className="p-2.5">Tgl Pesan</th>
                      <th className="p-2.5">Tgl Ambil</th>
                      <th className="p-2.5">Kuantitas</th>
                      <th className="p-2.5">Total</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customerPreOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono font-bold text-gray-900">{po.orderNumber}</td>
                        <td className="p-2.5 text-gray-600">{po.orderDate}</td>
                        <td className="p-2.5 text-gray-700 font-medium">{po.pickupDate}</td>
                        <td className="p-2.5 font-bold text-[#0F5132]">{po.quantityKg} kg</td>
                        <td className="p-2.5 font-semibold text-gray-900">{formatRupiah(po.totalAmount)}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-800">
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {customerPreOrders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-400">
                          Belum ada riwayat pre-order untuk pelanggan ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL BAYAR PIUTANG */}
      <Modal
        isOpen={isPayReceivableOpen}
        onClose={() => setIsPayReceivableOpen(false)}
        title="Catat Pembayaran Piutang"
        subtitle={`Pembayaran tagihan faktur ${receivableToPay?.invoiceNumber}`}
      >
        {receivableToPay && (
          <form onSubmit={handlePayReceivableSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-gray-500">Sisa Piutang Saat Ini:</span>
              <p className="text-xl font-black text-rose-700 mt-0.5">
                {formatRupiah(receivableToPay.remaining)}
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nominal Pembayaran Diterima (Rp)
              </label>
              <input
                type="number"
                min="1"
                max={receivableToPay.remaining}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full text-base font-black px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
              <div className="flex justify-between text-[11px] text-gray-500 mt-1">
                <span>Bisa dicicil partial atau lunas</span>
                <button
                  type="button"
                  onClick={() => setPayAmount(receivableToPay.remaining)}
                  className="font-bold text-[#0F5132] hover:underline"
                >
                  Lunasi Penuh
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Tunai', 'Transfer Bank', 'QRIS'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayMethod(m)}
                    className={`py-2 px-2 rounded-xl border font-bold text-xs ${
                      payMethod === m
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
              <label className="block font-bold text-gray-700 mb-1">
                Catatan / Bukti Transfer
              </label>
              <input
                type="text"
                placeholder="Contoh: Transfer ke rekening BCA farm jam 10:00"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px]">
              Otomatisasi: Kas operasional farm langsung bertambah sebesar <strong>+{formatRupiah(payAmount)}</strong> dan sisa piutang berkurang.
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
                Konfirmasi Pembayaran
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL TAMBAH PELANGGAN */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Daftarkan Pelanggan Baru"
        subtitle="Registrasi data mitra grosir, toko, agen, atau bakery binaan"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Nama Lengkap / Nama Toko
            </label>
            <input
              type="text"
              placeholder="Contoh: Toko Berkah / Bu Endang"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                No. HP / WhatsApp
              </label>
              <input
                type="text"
                placeholder="0812xxxxxxxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Kategori Mitra
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] outline-none bg-white font-medium"
              >
                <option value="Grosir">Grosir (Partai Besar)</option>
                <option value="Agen">Agen Telur</option>
                <option value="Toko">Toko Kelontong / Kios</option>
                <option value="Langganan">Langganan (Bakery / Resto)</option>
                <option value="Retail">Retail (Eceran)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              rows={2}
              placeholder="Alamat pengiriman..."
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Catatan
            </label>
            <input
              type="text"
              placeholder="Catatan preferensi kualitas telur / tempo"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622]"
            >
              Simpan Pelanggan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
