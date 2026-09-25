import React, { useState, useMemo } from 'react';
import { DatabaseSchema, PreOrder, PreOrderStatus, PaymentMethod } from '../../types/database';
import { db } from '../../services/db';
import { formatRupiah, formatNumber } from '../../services/pdfGenerator';
import { Modal } from '../../components/common/Modal';
import { 
  CalendarClock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle, 
  PackageCheck,
  Search,
  Phone
} from 'lucide-react';

interface PreOrderModuleProps {
  data: DatabaseSchema;
}

export const PreOrderModule: React.FC<PreOrderModuleProps> = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Pre Order Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    data.customers.length > 0 ? data.customers[0].id : ''
  );
  const [orderDate, setOrderDate] = useState(today);
  const [pickupDate, setPickupDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [quantityKg, setQuantityKg] = useState<number | ''>(20);
  const [pricePerKg, setPricePerKg] = useState<number>(data.settings.defaultEggPrice || 26500);
  const [dpAmount, setDpAmount] = useState<number | ''>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [notes, setNotes] = useState('');

  // Complete Order Modal (when handing over eggs & collecting final payment)
  const [orderToComplete, setOrderToComplete] = useState<PreOrder | null>(null);
  const [finalPaymentMethod, setFinalPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [finalPaidNow, setFinalPaidNow] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const numQty = typeof quantityKg === 'number' ? quantityKg : 0;
  const totalAmount = numQty * pricePerKg;
  const numDP = typeof dpAmount === 'number' ? dpAmount : 0;
  const remaining = Math.max(0, totalAmount - numDP);

  const selectedCustomer = data.customers.find((c) => c.id === selectedCustomerId);

  const handleCreatePreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numQty || !selectedCustomer) return;

    db.recordPreOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      phone: selectedCustomer.phone,
      orderDate,
      pickupDate,
      quantityKg: numQty,
      pricePerKg,
      dpAmount: numDP,
      paymentMethod,
      notes,
    });

    setIsCreateOpen(false);
    setToastMessage(`Pre Order baru ${selectedCustomer.name} (${numQty} kg) berhasil disimpan!`);
    setTimeout(() => setToastMessage(null), 4000);

    // reset
    setQuantityKg(20);
    setDpAmount(0);
    setNotes('');
  };

  const openCompleteModal = (po: PreOrder) => {
    setOrderToComplete(po);
    setFinalPaidNow(po.balanceDue);
    setFinalPaymentMethod(po.paymentMethod);
  };

  const handleConfirmComplete = () => {
    if (!orderToComplete) return;

    db.updatePreOrderStatus(orderToComplete.id, 'selesai', {
      paymentMethod: finalPaymentMethod,
      amountPaidNow: finalPaidNow,
    });

    setToastMessage(`Pesanan ${orderToComplete.orderNumber} Selesai! Stok telur berkurang -${orderToComplete.quantityKg} kg & pelunasan kas tercatat.`);
    setOrderToComplete(null);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Filtered List
  const filteredOrders = useMemo(() => {
    return data.preorders.filter((po) => {
      // status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          if (po.status === 'selesai' || po.status === 'dibatalkan' || po.pickupDate >= today) {
            return false;
          }
        } else if (statusFilter === 'today') {
          if (po.pickupDate !== today) return false;
        } else if (po.status !== statusFilter) {
          return false;
        }
      }
      // search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          po.orderNumber.toLowerCase().includes(q) ||
          po.customerName.toLowerCase().includes(q) ||
          po.phone.includes(q)
        );
      }
      return true;
    });
  }, [data.preorders, statusFilter, searchQuery, today]);

  // Counts
  const activeCount = data.preorders.filter((p) => p.status !== 'selesai' && p.status !== 'dibatalkan').length;
  const overdueCount = data.preorders.filter((p) => p.status !== 'selesai' && p.status !== 'dibatalkan' && p.pickupDate < today).length;
  const todayPickupCount = data.preorders.filter((p) => p.status !== 'selesai' && p.status !== 'dibatalkan' && p.pickupDate === today).length;

  const getStatusBadge = (status: PreOrderStatus, pickupDateStr: string) => {
    const isOverdue = status !== 'selesai' && status !== 'dibatalkan' && pickupDateStr < today;
    if (isOverdue) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
          Lewat Jadwal ({pickupDateStr})
        </span>
      );
    }
    switch (status) {
      case 'menunggu':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">Menunggu DP</span>;
      case 'dp_masuk':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">DP Masuk</span>;
      case 'siap_diambil':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Siap Diambil</span>;
      case 'lunas':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Lunas Siap Ambil</span>;
      case 'selesai':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai Diserahkan</span>;
      case 'dibatalkan':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600">Dibatalkan</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-800">
              <CalendarClock className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Sistem Pre Order Telur (Inden Farm)
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola pesanan masa depan. Begitu pesanan diselesaikan, stok telur otomatis terpotong & sisa pelunasan masuk ke Kas.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-[#0F5132] hover:bg-[#0A3622] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Pre Order Baru</span>
        </button>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">Status Terupdate</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'all' ? 'bg-[#0F5132] text-white border-[#0F5132]' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase ${statusFilter === 'all' ? 'text-emerald-200' : 'text-gray-400'}`}>
            Total Pre Order Aktif
          </span>
          <p className="text-xl font-black mt-0.5">{activeCount} Pesanan</p>
        </div>

        <div 
          onClick={() => setStatusFilter('today')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'today' ? 'bg-emerald-800 text-white border-emerald-800' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase ${statusFilter === 'today' ? 'text-emerald-200' : 'text-emerald-700'}`}>
            Ambil Hari Ini
          </span>
          <p className="text-xl font-black mt-0.5">{todayPickupCount} Pesanan</p>
        </div>

        <div 
          onClick={() => setStatusFilter('overdue')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'overdue' ? 'bg-rose-800 text-white border-rose-800' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase ${statusFilter === 'overdue' ? 'text-rose-200' : 'text-rose-600'}`}>
            Terlambat / Lewat Jadwal
          </span>
          <p className="text-xl font-black mt-0.5">{overdueCount} Pesanan</p>
        </div>

        <div 
          onClick={() => setStatusFilter('selesai')}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            statusFilter === 'selesai' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className={`text-[10px] font-bold uppercase ${statusFilter === 'selesai' ? 'text-gray-300' : 'text-gray-400'}`}>
            Riwayat Selesai
          </span>
          <p className="text-xl font-black mt-0.5">
            {data.preorders.filter((p) => p.status === 'selesai').length} Pesanan
          </p>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'today', label: 'Hari Ini' },
              { id: 'siap_diambil', label: 'Siap Diambil' },
              { id: 'dp_masuk', label: 'DP Masuk' },
              { id: 'overdue', label: 'Terlambat' },
              { id: 'selesai', label: 'Selesai' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setStatusFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === t.id
                    ? 'bg-white text-[#0F5132] font-bold shadow-2xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari PO / Pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3">No. Order</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Tgl Ambil</th>
                <th className="py-2.5 px-3">Kuantitas</th>
                <th className="py-2.5 px-3">Total (Rp)</th>
                <th className="py-2.5 px-3">DP Diterima</th>
                <th className="py-2.5 px-3">Sisa Bayar</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-gray-900">
                    {po.orderNumber}
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-800">
                    <div>{po.customerName}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" />
                      {po.phone}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-gray-700 whitespace-nowrap">
                    {po.pickupDate}
                    {po.pickupDate === today && (
                      <span className="block text-[9px] font-bold text-emerald-700">Hari Ini</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0F5132]">
                    {po.quantityKg} kg
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900">
                    {formatRupiah(po.totalAmount)}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {formatRupiah(po.dpAmount)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-rose-700">
                    {po.balanceDue > 0 ? formatRupiah(po.balanceDue) : <span className="text-emerald-700 font-bold">Lunas</span>}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getStatusBadge(po.status, po.pickupDate)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                    {po.status !== 'selesai' && po.status !== 'dibatalkan' && (
                      <>
                        {po.status !== 'siap_diambil' && (
                          <button
                            onClick={() => db.updatePreOrderStatus(po.id, 'siap_diambil')}
                            className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition-all shadow-2xs"
                            title="Tandai Telur Sudah Disiapkan"
                          >
                            Siap
                          </button>
                        )}
                        <button
                          onClick={() => openCompleteModal(po)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold transition-all shadow-2xs active:scale-95"
                          title="Serahkan Telur & Pelunasan"
                        >
                          Selesaikan
                        </button>
                      </>
                    )}
                    {po.status === 'selesai' && (
                      <span className="text-[11px] text-gray-400 font-medium italic">
                        Tuntas
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PRE ORDER BARU */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Pre Order Telur Baru"
        subtitle="Mencatat pemesanan telur untuk jadwal pengambilan masa depan"
      >
        <form onSubmit={handleCreatePreOrder} className="space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Pelanggan
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none bg-white font-medium"
              required
            >
              {data.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type}) - {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Tanggal Pesan
              </label>
              <input
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jadwal Pengambilan (Pickup)
              </label>
              <input
                type="date"
                min={today}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none font-bold text-emerald-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Jumlah Pesanan (Kg)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Harga per Kg (Rp)
              </label>
              <input
                type="number"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(Number(e.target.value))}
                className="w-full text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none"
                required
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total Nilai Pesanan:</span>
              <span className="text-[#0F5132] text-sm font-black">{formatRupiah(totalAmount)}</span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nominal Uang Muka / DP Dibayar (Rp):
              </label>
              <input
                type="number"
                min="0"
                max={totalAmount}
                value={dpAmount}
                onChange={(e) => setDpAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="0 jika belum bayar DP"
                className="w-full text-xs sm:text-sm font-bold px-3 py-2 rounded-xl bg-white border border-gray-300 focus:ring-2 focus:ring-[#0F5132] outline-none"
              />
            </div>

            <div className="flex justify-between text-gray-600 pt-1 border-t">
              <span>Sisa Yang Harus Dilunasi Saat Ambil:</span>
              <span className="font-bold text-rose-700">{formatRupiah(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Metode Pembayaran DP
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Tunai', 'Transfer Bank', 'QRIS'] as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold ${
                    paymentMethod === m
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
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Catatan Khusus
            </label>
            <input
              type="text"
              placeholder="Contoh: Titip di pos satpam / packing tray baru"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F5132] outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#0F5132] text-white text-xs font-bold hover:bg-[#0A3622]"
            >
              Simpan Pre Order
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SELESAIKAN PRE ORDER & SERAHKAN TELUR */}
      <Modal
        isOpen={Boolean(orderToComplete)}
        onClose={() => setOrderToComplete(null)}
        title="Selesaikan Pre Order & Serahkan Telur"
        subtitle={`Konfirmasi serah terima barang untuk pesanan ${orderToComplete?.orderNumber}`}
      >
        {orderToComplete && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FAF9F6] border border-emerald-900/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Pelanggan:</span>
                <span className="font-bold text-gray-900">{orderToComplete.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kuantitas Telur:</span>
                <span className="font-bold text-[#0F5132] text-sm">{orderToComplete.quantityKg} Kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Transaksi:</span>
                <span className="font-semibold text-gray-800">{formatRupiah(orderToComplete.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">DP Yang Sudah Dibayar:</span>
                <span className="text-emerald-700 font-bold">{formatRupiah(orderToComplete.dpAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t text-sm font-bold text-rose-700">
                <span>Sisa Tagihan:</span>
                <span>{formatRupiah(orderToComplete.balanceDue)}</span>
              </div>
            </div>

            {orderToComplete.balanceDue > 0 && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Pelunasan Sekarang (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  max={orderToComplete.balanceDue}
                  value={finalPaidNow}
                  onChange={(e) => setFinalPaidNow(Number(e.target.value))}
                  className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132] outline-none"
                />

                <label className="block font-bold text-gray-700 mt-3 mb-1">
                  Metode Pelunasan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Tunai', 'Transfer Bank', 'QRIS'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFinalPaymentMethod(m)}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold ${
                        finalPaymentMethod === m
                          ? 'bg-[#0F5132] text-white border-[#0F5132]'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] leading-relaxed">
              <strong>Efek Otomatis Saat Konfirmasi:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5">
                <li>Stok Telur di gudang terpotong: <strong>-{orderToComplete.quantityKg} kg</strong></li>
                <li>Kas Operasional bertambah: <strong>+{formatRupiah(finalPaidNow)}</strong></li>
                <li>Status Pre Order berubah menjadi <strong>Selesai</strong></li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOrderToComplete(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622] flex items-center gap-1.5"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Konfirmasi Serah Terima Telur</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
