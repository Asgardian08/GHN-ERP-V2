import React, { useState } from 'react';
import { DatabaseSchema, PaymentMethod, ExpenseCategory } from '../../types/database';
import { db } from '../../services/db';
import { Modal } from './Modal';
import { formatRupiah } from '../../services/pdfGenerator';
import { 
  Egg, 
  ShoppingCart, 
  CalendarClock, 
  ArrowDownRight, 
  Wheat,
  CheckCircle2
} from 'lucide-react';
import { ReceiptModal } from '../../modules/Kasir/ReceiptModal';

interface QuickActionsModalProps {
  actionType: 'production' | 'sale' | 'preorder' | 'expense' | 'feedUsage' | null;
  onClose: () => void;
  data: DatabaseSchema;
  onNavigate?: (module: string) => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  actionType,
  onClose,
  data,
  onNavigate,
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Common Feedback
  const [completedSale, setCompletedSale] = useState<any>(null);

  // 1. Production Form States
  const [prodDate, setProdDate] = useState(today);
  const [prodChickens, setProdChickens] = useState(data.settings.chickenPopulation);
  const [prodEggs, setProdEggs] = useState<number | ''>(2180);
  const [prodKg, setProdKg] = useState<number | ''>(137.9);
  const [prodNotes, setProdNotes] = useState('');

  // 2. Sale Form States
  const [saleCustId, setSaleCustId] = useState(data.customers[0]?.id || '');
  const [saleKg, setSaleKg] = useState<number | ''>(10);
  const [salePrice, setSalePrice] = useState(data.settings.defaultEggPrice);
  const [saleMethod, setSaleMethod] = useState<PaymentMethod>('Tunai');
  const [saleStatus, setSaleStatus] = useState<'lunas' | 'dp' | 'belum_bayar'>('lunas');

  // 3. PreOrder Form States
  const [poCustId, setPoCustId] = useState(data.customers[0]?.id || '');
  const [poDate, setPoDate] = useState(today);
  const [poPickup, setPoPickup] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [poKg, setPoKg] = useState<number | ''>(25);
  const [poPrice, setPoPrice] = useState(data.settings.defaultEggPrice);
  const [poDP, setPoDP] = useState<number | ''>(200000);
  const [poMethod, setPoMethod] = useState<PaymentMethod>('Tunai');

  // 4. Expense Form States
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('pakan');
  const [expAmount, setExpAmount] = useState<number | ''>(500000);
  const [expDesc, setExpDesc] = useState('');
  const [expMethod, setExpMethod] = useState<PaymentMethod>('Tunai');

  // 5. Feed Usage States
  const [feedItemId, setFeedItemId] = useState('inv_pakan_layer');
  const [feedQty, setFeedQty] = useState<number | ''>(150);

  if (!actionType) return null;

  // Handlers
  const handleProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodEggs || !prodKg) return;

    db.recordProduction({
      date: prodDate,
      chickenCount: prodChickens,
      eggsCount: Number(prodEggs),
      eggWeightKg: Number(prodKg),
      notes: prodNotes,
    });
    onClose();
  };

  const handleSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleKg) return;
    const cust = data.customers.find((c) => c.id === saleCustId) || data.customers[0];
    const total = Number(saleKg) * salePrice;
    const paid = saleStatus === 'lunas' ? total : 0;

    const newSale = db.recordSale({
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      totalKg: Number(saleKg),
      pricePerKg: salePrice,
      paidAmount: paid,
      paymentMethod: saleMethod,
      paymentStatus: saleStatus,
    });

    setCompletedSale(newSale);
  };

  const handlePreOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poKg) return;
    const cust = data.customers.find((c) => c.id === poCustId) || data.customers[0];

    db.recordPreOrder({
      customerId: cust.id,
      customerName: cust.name,
      phone: cust.phone,
      orderDate: poDate,
      pickupDate: poPickup,
      quantityKg: Number(poKg),
      pricePerKg: poPrice,
      dpAmount: Number(poDP) || 0,
      paymentMethod: poMethod,
    });
    onClose();
  };

  const handleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expAmount) return;

    db.recordExpense({
      date: today,
      category: expCategory,
      amount: Number(expAmount),
      paymentMethod: expMethod,
      description: expDesc || `Biaya ${expCategory}`,
    });
    onClose();
  };

  const handleFeedUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedQty) return;

    db.recordStockUsage({
      itemId: feedItemId,
      quantity: Number(feedQty),
      date: today,
      notes: 'Pemberian pakan ayam layer',
    });
    onClose();
  };

  return (
    <>
      {/* 1. PRODUKSI MODAL */}
      {actionType === 'production' && (
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Catat Produksi Panen Cepat"
          subtitle="Input butir & kg telur hari ini (stok telur otomatis bertambah)"
        >
          <form onSubmit={handleProduction} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={prodDate}
                  onChange={(e) => setProdDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Jumlah Ayam</label>
                <input
                  type="number"
                  value={prodChickens}
                  onChange={(e) => setProdChickens(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Butir Telur</label>
                <input
                  type="number"
                  placeholder="2180"
                  value={prodEggs}
                  onChange={(e) => setProdEggs(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Berat (Kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="137.9"
                  value={prodKg}
                  onChange={(e) => setProdKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-300 text-[#0F5132]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Catatan</label>
              <input
                type="text"
                placeholder="Panen pagi lancar"
                value={prodNotes}
                onChange={(e) => setProdNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('produksi');
                  }}
                  className="text-xs text-[#0F5132] font-bold hover:underline cursor-pointer"
                >
                  Buka Halaman Lengkap Produksi →
                </button>
              )}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622] cursor-pointer"
                >
                  Simpan & Update Stok (+{prodKg || 0} kg)
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. SALE MODAL */}
      {actionType === 'sale' && !completedSale && (
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Kasir Penjualan Cepat"
          subtitle="Jual telur segar langsung dari dashboard"
        >
          <form onSubmit={handleSale} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Pilih Pelanggan</label>
              <select
                value={saleCustId}
                onChange={(e) => setSaleCustId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
              >
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kuantitas Telur (Kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={saleKg}
                  onChange={(e) => setSaleKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Harga / Kg (Rp)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center font-bold">
              <span>Total Tagihan:</span>
              <span className="text-[#0F5132] text-base">{formatRupiah((Number(saleKg) || 0) * salePrice)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Status Bayar</label>
                <select
                  value={saleStatus}
                  onChange={(e) => setSaleStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
                >
                  <option value="lunas">Lunas (Kas Masuk)</option>
                  <option value="belum_bayar">Tempo (Piutang)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Metode</label>
                <select
                  value={saleMethod}
                  onChange={(e) => setSaleMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
                >
                  <option value="Tunai">Tunai</option>
                  <option value="Transfer Bank">Transfer BCA</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('kasir');
                  }}
                  className="text-xs text-[#0F5132] font-bold hover:underline cursor-pointer"
                >
                  Buka Halaman Kasir POS Lengkap →
                </button>
              )}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622] cursor-pointer"
                >
                  Simpan & Terbitkan Struk
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. PRE ORDER MODAL */}
      {actionType === 'preorder' && (
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Input Pre Order Baru"
          subtitle="Pemesanan inden telur masa depan"
        >
          <form onSubmit={handlePreOrder} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Pelanggan</label>
              <select
                value={poCustId}
                onChange={(e) => setPoCustId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
              >
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tgl Pesan</label>
                <input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tgl Ambil</label>
                <input
                  type="date"
                  value={poPickup}
                  onChange={(e) => setPoPickup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Kuantitas (Kg)</label>
                <input
                  type="number"
                  step="1"
                  value={poKg}
                  onChange={(e) => setPoKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">DP Dibayar (Rp)</label>
                <input
                  type="number"
                  value={poDP}
                  onChange={(e) => setPoDP(e.target.value ? Number(e.target.value) : '')}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('preorder');
                  }}
                  className="text-xs text-[#0F5132] font-bold hover:underline cursor-pointer"
                >
                  Buka Halaman Lengkap Pre Order →
                </button>
              )}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622] cursor-pointer"
                >
                  Simpan Pre Order
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. EXPENSE MODAL */}
      {actionType === 'expense' && (
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Catat Pengeluaran Cepat"
          subtitle="Biaya operasional kandang langsung memotong saldo kas"
        >
          <form onSubmit={handleExpense} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Kategori</label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white capitalize"
              >
                <option value="pakan">Pakan</option>
                <option value="vitamin">Vitamin</option>
                <option value="obat">Obat</option>
                <option value="listrik">Listrik</option>
                <option value="air">Air</option>
                <option value="kemasan">Kemasan / Tray</option>
                <option value="perawatan">Perawatan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-300 text-rose-700"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Deskripsi</label>
              <input
                type="text"
                placeholder="Contoh: Beli bensin pick-up pengiriman telur"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300"
                required
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-2">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('keuangan');
                  }}
                  className="text-xs text-rose-700 font-bold hover:underline cursor-pointer"
                >
                  Buka Buku Kas & Keuangan Lengkap →
                </button>
              )}
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
                >
                  Simpan Beban & Potong Kas
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. FEED USAGE MODAL */}
      {actionType === 'feedUsage' && (
        <Modal
          isOpen={true}
          onClose={onClose}
          title="Catat Penggunaan Pakan Ayam"
          subtitle="Pemakaian pakan harian otomatis memotong stok gudang"
        >
          <form onSubmit={handleFeedUsage} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Jenis Pakan</label>
              <select
                value={feedItemId}
                onChange={(e) => setFeedItemId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
              >
                {data.inventory.filter((i) => i.category === 'pakan').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Tersedia: {p.stock} kg)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Jumlah Pemakaian (Kg)</label>
              <input
                type="number"
                step="1"
                min="1"
                value={feedQty}
                onChange={(e) => setFeedQty(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-300 text-amber-800"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-700 text-white font-bold hover:bg-amber-800"
              >
                Kurangi Stok Pakan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* RECEIPT MODAL IF SALE COMPLETED VIA QUICK ACTION */}
      {completedSale && (
        <ReceiptModal
          sale={completedSale}
          onClose={() => {
            setCompletedSale(null);
            onClose();
          }}
          settings={data.settings}
        />
      )}
    </>
  );
};
