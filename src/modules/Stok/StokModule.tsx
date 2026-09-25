import React, { useState, useMemo } from 'react';
import { 
  DatabaseSchema, 
  InventoryItem, 
  InventoryCategory, 
  PaymentMethod 
} from '../../types/database';
import { db } from '../../services/db';
import { formatRupiah, formatNumber } from '../../services/pdfGenerator';
import { Modal } from '../../components/common/Modal';
import { 
  Boxes, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  SlidersHorizontal,
  Wheat,
  Package,
  Layers,
  History,
  TrendingDown,
  Trash2,
  PlusCircle,
  MinusCircle,
  RotateCcw,
  AlertOctagon,
  X
} from 'lucide-react';

interface StokModuleProps {
  data: DatabaseSchema;
}

export const StokModule: React.FC<StokModuleProps> = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];

  // Category Tab Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Fitur Tambah dan Hapus Stok Modals
  const [isAddStockManualOpen, setIsAddStockManualOpen] = useState(false);
  const [isDiscardStockOpen, setIsDiscardStockOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // Selected Item for Actions
  const [activeItemId, setActiveItemId] = useState<string>('inv_pakan_layer');

  // Form Tambah Stok Manual
  const [manualAddQty, setManualAddQty] = useState<number | ''>(50);
  const [manualAddReason, setManualAddReason] = useState('Penambahan stok panen / bonus');

  // Form Hapus / Kurangi Stok (Pemusnahan / Telur Pecah / Rusak / Susut)
  const [discardQty, setDiscardQty] = useState<number | ''>(5);
  const [discardReason, setDiscardReason] = useState('Telur retak / pecah di gudang');

  // Restock Form
  const [restockQty, setRestockQty] = useState<number | ''>(100);
  const [restockCostPerUnit, setRestockCostPerUnit] = useState<number | ''>(8900);
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockPaymentType, setRestockPaymentType] = useState<'cash' | 'payable'>('cash');
  const [restockPaymentMethod, setRestockPaymentMethod] = useState<PaymentMethod>('Transfer Bank');
  const [restockDueDate, setRestockDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [restockNotes, setRestockNotes] = useState('');

  // Usage Form
  const [usageQty, setUsageQty] = useState<number | ''>(150);
  const [usageNotes, setUsageNotes] = useState('Pemberian pakan rutin ayam layer pagi & sore');

  // Adjustment Form
  const [adjustNewStock, setAdjustNewStock] = useState<number | ''>(0);
  const [adjustReason, setAdjustReason] = useState('Opname stok fisik akhir minggu');

  // New Item Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState<InventoryCategory>('pakan');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemStock, setNewItemStock] = useState<number | ''>(0);
  const [newItemMinStock, setNewItemMinStock] = useState<number | ''>(100);
  const [newItemCost, setNewItemCost] = useState<number | ''>(5000);

  // Low stock check
  const lowStockItems = data.inventory.filter((i) => i.stock <= i.minStock);

  // Filtered inventory list
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return data.inventory;
    return data.inventory.filter((i) => i.category === selectedCategory);
  }, [data.inventory, selectedCategory]);

  const activeItem = data.inventory.find((i) => i.id === activeItemId);

  // HANDLER: RESTOCK (STOCK IN)
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !restockQty || !restockCostPerUnit) return;

    const totalAmount = Number(restockQty) * Number(restockCostPerUnit);

    db.recordRestock({
      itemId: activeItem.id,
      quantity: Number(restockQty),
      unitCost: Number(restockCostPerUnit),
      totalAmount,
      date: today,
      paymentType: restockPaymentType,
      paymentMethod: restockPaymentMethod,
      supplier: restockSupplier,
      dueDate: restockPaymentType === 'payable' ? restockDueDate : undefined,
      notes: restockNotes,
    });

    setIsRestockOpen(false);
    setToastMessage(`Restock ${activeItem.name} (+${restockQty} ${activeItem.unit}) berhasil dicatat! Beban & kas/hutang terupdate.`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // HANDLER: USAGE (STOCK OUT)
  const handleUsageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !usageQty) return;

    db.recordStockUsage({
      itemId: activeItem.id,
      quantity: Number(usageQty),
      date: today,
      notes: usageNotes,
    });

    setIsUsageOpen(false);
    setToastMessage(`Penggunaan ${activeItem.name} (-${usageQty} ${activeItem.unit}) berhasil dicatat.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // HANDLER: ADJUSTMENT
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || typeof adjustNewStock !== 'number') return;

    db.recordStockAdjustment({
      itemId: activeItem.id,
      newStock: adjustNewStock,
      reason: adjustReason,
      date: today,
    });

    setIsAdjustOpen(false);
    setToastMessage(`Penyesuaian stok ${activeItem.name} menjadi ${adjustNewStock} ${activeItem.unit} berhasil.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // HANDLER: ADD NEW INVENTORY ITEM
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    db.addInventoryItem({
      name: newItemName,
      category: newItemCat,
      unit: newItemUnit,
      stock: typeof newItemStock === 'number' ? newItemStock : 0,
      minStock: typeof newItemMinStock === 'number' ? newItemMinStock : 50,
      avgCost: typeof newItemCost === 'number' ? newItemCost : 0,
    });

    setIsAddItemOpen(false);
    setNewItemName('');
    setToastMessage(`Item ${newItemName} berhasil ditambahkan ke inventaris.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // HANDLER: TAMBAH STOK CEPAT (MANUAL ADD STOCK)
  const handleAddStockManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !manualAddQty || Number(manualAddQty) <= 0) return;

    const res = db.addStockManual({
      itemId: activeItem.id,
      quantity: Number(manualAddQty),
      reason: manualAddReason,
      date: today,
    });

    setIsAddStockManualOpen(false);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // HANDLER: HAPUS / KURANGI STOK (DISCARD / PECAH / SUSUT)
  const handleDiscardStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !discardQty || Number(discardQty) <= 0) return;

    const res = db.discardStock({
      itemId: activeItem.id,
      quantity: Number(discardQty),
      reason: discardReason,
      date: today,
    });

    setIsDiscardStockOpen(false);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // HANDLER: HAPUS BARANG DARI INVENTARIS
  const handleConfirmDeleteItem = () => {
    if (!itemToDelete) return;
    const res = db.deleteInventoryItem(itemToDelete.id);
    setItemToDelete(null);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // HANDLER: BATALKAN MUTASI STOK
  const handleCancelMutation = (txId: string, itemName: string) => {
    const confirm = window.confirm(`Batalkan mutasi stok untuk "${itemName}"? Jumlah stok akan dikembalikan ke saldo sebelumnya.`);
    if (confirm) {
      const res = db.cancelInventoryTransaction(txId);
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Boxes className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Inventaris Gudang & Manajemen Stok
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Kelola Telur, Pakan, dan Supplies Farm. Lengkap dengan fitur Tambah & Hapus Stok langsung, Restock, dan Opname.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Tombol Tambah Stok Cepat */}
          <button
            onClick={() => {
              setActiveItemId(filteredItems[0]?.id || 'inv_telur');
              setManualAddQty(50);
              setManualAddReason('Penambahan stok / koreksi fisik');
              setIsAddStockManualOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Tambah Stok</span>
          </button>

          {/* Tombol Hapus / Kurangi Stok */}
          <button
            onClick={() => {
              setActiveItemId(filteredItems[0]?.id || 'inv_telur');
              setDiscardQty(5);
              setDiscardReason('Telur pecah / pakan rusak / susut gudang');
              setIsDiscardStockOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <MinusCircle className="w-4 h-4" />
            <span>- Hapus / Susut Stok</span>
          </button>

          {/* Catat Penggunaan Pakan */}
          <button
            onClick={() => {
              setActiveItemId('inv_pakan_layer');
              setIsUsageOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Catat Pakai</span>
          </button>

          {/* Restock Pembelian */}
          <button
            onClick={() => {
              setActiveItemId(filteredItems[0]?.id || 'inv_pakan_layer');
              setIsRestockOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F5132] hover:bg-[#0A3622] text-white text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Beli / Restock</span>
          </button>
        </div>
      </div>

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

      {/* WARNING: LOW STOCK BANNER */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h4 className="font-bold text-xs sm:text-sm">
              Peringatan Stok Menipis (Di Bawah Batas Minimum)
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-white border border-rose-200 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900">{item.name}</span>
                  <p className="text-[11px] text-gray-500">Min: {item.minStock} {item.unit}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-rose-600 text-sm">
                    {item.stock} {item.unit}
                  </span>
                  <button
                    onClick={() => {
                      setActiveItemId(item.id);
                      setIsRestockOpen(true);
                    }}
                    className="block text-[10px] font-bold text-[#0F5132] hover:underline"
                  >
                    + Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'all', label: 'Semua Barang' },
            { id: 'produk', label: 'Produk (Telur)' },
            { id: 'pakan', label: 'Pakan Ternak' },
            { id: 'supplies', label: 'Supplies & Kemasan' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#0F5132] font-bold shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddItemOpen(true)}
          className="text-xs font-bold text-[#0F5132] hover:text-[#0A3622] flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Tambah Jenis Barang</span>
        </button>
      </div>

      {/* INVENTORY CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isLow = item.stock <= item.minStock;
          const isTelur = item.id === 'inv_telur';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs flex flex-col justify-between ${
                isLow ? 'border-rose-300 ring-1 ring-rose-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.category === 'produk'
                        ? 'bg-emerald-100 text-emerald-900'
                        : item.category === 'pakan'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-indigo-100 text-indigo-900'
                    }`}>
                      {item.category}
                    </span>

                    {isLow && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        Stok Menipis
                      </span>
                    )}
                  </div>

                  {/* Tombol Hapus Barang dari Inventaris (khusus barang kustom) */}
                  {!isTelur && (
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="text-gray-300 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                      title={`Hapus barang ${item.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-sm sm:text-base mt-2 leading-snug">
                  {item.name}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Satuan: <span className="font-semibold text-gray-600 uppercase">{item.unit}</span>
                </p>

                {/* Main Stock Figure */}
                <div className="my-3 py-2 px-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Stok Saat Ini</span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className={`text-2xl font-black ${isLow ? 'text-rose-600' : 'text-gray-900'}`}>
                      {formatNumber(item.stock, item.unit === 'kg' ? 1 : 0)}
                    </span>
                    <span className="font-bold text-xs text-gray-500">{item.unit}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                    <span>Min: {item.minStock} {item.unit}</span>
                    <span>HPP: {formatRupiah(item.avgCost)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Tambah, Hapus/Susut, Opname, Beli */}
              <div className="pt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  onClick={() => {
                    setActiveItemId(item.id);
                    setManualAddQty(item.unit === 'kg' ? 50 : 10);
                    setManualAddReason(`Penambahan stok ${item.name}`);
                    setIsAddStockManualOpen(true);
                  }}
                  className="py-1.5 px-1 rounded-lg bg-emerald-50 text-[#0F5132] hover:bg-emerald-100 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Tambah Stok Masuk Manual"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ Stok</span>
                </button>
                <button
                  onClick={() => {
                    setActiveItemId(item.id);
                    setDiscardQty(item.unit === 'kg' ? 5 : 1);
                    setDiscardReason(isTelur ? 'Telur pecah / retak' : 'Barang rusak / susut');
                    setIsDiscardStockOpen(true);
                  }}
                  className="py-1.5 px-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Hapus / Kurangi Stok (Telur Pecah / Rusak / Susut)"
                >
                  <MinusCircle className="w-3 h-3" />
                  <span>- Susut</span>
                </button>
                <button
                  onClick={() => {
                    setActiveItemId(item.id);
                    setAdjustNewStock(item.stock);
                    setIsAdjustOpen(true);
                  }}
                  className="py-1.5 px-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Opname Fisik"
                >
                  <span>Opname</span>
                </button>
                <button
                  onClick={() => {
                    setActiveItemId(item.id);
                    setRestockCostPerUnit(item.avgCost);
                    setIsRestockOpen(true);
                  }}
                  className="py-1.5 px-1 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Beli / Restock Masuk"
                >
                  <span>Beli</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* INVENTORY MUTATION HISTORY TABLE */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#0F5132]" />
            <h3 className="font-bold text-gray-900 text-base">
              Riwayat Mutasi Stok (Kartu Stok Terpadu)
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            {data.inventoryTransactions.length} Transaksi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Barang</th>
                <th className="py-2.5 px-3">Jenis Mutasi</th>
                <th className="py-2.5 px-3">Jumlah Masuk/Keluar</th>
                <th className="py-2.5 px-3">Sisa Stok Akhir</th>
                <th className="py-2.5 px-3">Keterangan / Referensi</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.inventoryTransactions.slice(0, 15).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 text-gray-600 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    {tx.itemName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.type === 'production'
                        ? 'bg-emerald-100 text-emerald-800'
                        : tx.type === 'in'
                        ? 'bg-blue-100 text-blue-800'
                        : tx.type === 'sale'
                        ? 'bg-amber-100 text-amber-800'
                        : tx.type === 'out'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {tx.type === 'production' ? 'Panen Telur' : tx.type === 'in' ? 'Restock / Beli' : tx.type === 'sale' ? 'Penjualan' : tx.type === 'out' ? 'Pemakaian / Susut' : 'Penyesuaian'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold">
                    <span className={tx.quantity > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    {tx.balanceAfter}
                  </td>
                  <td className="py-3 px-3 text-gray-500 max-w-sm truncate">
                    {tx.notes || '-'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleCancelMutation(tx.id, tx.itemName)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-700 text-[10px] font-bold transition-all cursor-pointer"
                      title="Batalkan mutasi stok ini jika salah input"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Batalkan</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: RESTOCK / PEMBELIAN BARANG */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title="Restock / Pembelian Barang Masuk"
        subtitle={`Tambah stok untuk ${activeItem?.name}`}
      >
        {activeItem && (
          <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Barang yang Direstock
              </label>
              <select
                value={activeItemId}
                onChange={(e) => setActiveItemId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-gray-800 bg-white"
              >
                {data.inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Stok Saat Ini: {i.stock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Jumlah Kuantitas ({activeItem.unit})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value ? Number(e.target.value) : '')}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Harga Beli per {activeItem.unit} (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={restockCostPerUnit}
                  onChange={(e) => setRestockCostPerUnit(e.target.value ? Number(e.target.value) : '')}
                  className="w-full font-bold px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center text-xs">
              <span className="text-gray-500">Total Biaya Pembelian:</span>
              <span className="font-black text-emerald-800 text-sm">
                {formatRupiah((Number(restockQty) || 0) * (Number(restockCostPerUnit) || 0))}
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Nama Pemasok / Supplier
              </label>
              <input
                type="text"
                placeholder="Contoh: PT Charoen Feedmill / UD Sumber Pakan"
                value={restockSupplier}
                onChange={(e) => setRestockSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Tipe Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRestockPaymentType('cash')}
                  className={`py-2 rounded-xl border font-bold text-xs ${
                    restockPaymentType === 'cash'
                      ? 'bg-[#0F5132] text-white border-[#0F5132]'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Tunai / Transfer (Kas Keluar)
                </button>
                <button
                  type="button"
                  onClick={() => setRestockPaymentType('payable')}
                  className={`py-2 rounded-xl border font-bold text-xs ${
                    restockPaymentType === 'payable'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Hutang Tempo (Payable)
                </button>
              </div>

              {restockPaymentType === 'payable' && (
                <div className="mt-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Jatuh Tempo Pembayaran Hutang
                  </label>
                  <input
                    type="date"
                    value={restockDueDate}
                    onChange={(e) => setRestockDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                    required
                  />
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] leading-relaxed">
              <strong>Otomatisasi ERP:</strong> Stok bertambah, beban tercatat di Keuangan, dan Kas Operasional / Buku Hutang otomatis diperbarui tanpa input ulang.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRestockOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622]"
              >
                Simpan Restock
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: CATAT PEMAKAIAN (STOCK OUT) */}
      <Modal
        isOpen={isUsageOpen}
        onClose={() => setIsUsageOpen(false)}
        title="Catat Pemakaian / Pengeluaran Stok"
        subtitle={`Catat konsumsi harian ${activeItem?.name}`}
      >
        {activeItem && (
          <form onSubmit={handleUsageSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Pilih Barang yang Digunakan
              </label>
              <select
                value={activeItemId}
                onChange={(e) => setActiveItemId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-gray-800 bg-white"
              >
                {data.inventory.filter((i) => i.id !== 'inv_telur').map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Tersedia: {i.stock} {i.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Jumlah yang Digunakan ({activeItem.unit})
              </label>
              <input
                type="number"
                min="0.1"
                max={activeItem.stock}
                step="any"
                value={usageQty}
                onChange={(e) => setUsageQty(e.target.value ? Number(e.target.value) : '')}
                className="w-full text-base font-black px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Sisa stok setelah penggunaan: <strong>{Math.max(0, activeItem.stock - (Number(usageQty) || 0))} {activeItem.unit}</strong>
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Catatan Penggunaan
              </label>
              <input
                type="text"
                value={usageNotes}
                onChange={(e) => setUsageNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUsageOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-700 text-white font-bold hover:bg-amber-800"
              >
                Kurangi Stok
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: ADJUSTMENT (OPNAME FISIK) */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Penyesuaian Opname Stok Fisik"
        subtitle={`Koreksi jumlah stok real gudang untuk ${activeItem?.name}`}
      >
        {activeItem && (
          <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-gray-500">Stok Menurut Sistem Saat Ini:</span>
              <p className="text-lg font-black text-gray-900">{activeItem.stock} {activeItem.unit}</p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Stok Fisik Real Hasil Hitung ({activeItem.unit})
              </label>
              <input
                type="number"
                step="any"
                value={adjustNewStock}
                onChange={(e) => setAdjustNewStock(e.target.value ? Number(e.target.value) : 0)}
                className="w-full text-base font-black px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Alasan Selisih Opname
              </label>
              <input
                type="text"
                placeholder="Contoh: Susut bobot, pecah saat sortir, hitungan rutin bulanan"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdjustOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gray-800 text-white font-bold hover:bg-black"
              >
                Update Opname
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 4: TAMBAH BARANG BARU */}
      <Modal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title="Tambah Barang Inventaris Baru"
        subtitle="Daftarkan jenis pakan, bahan, atau supplies baru ke farm"
      >
        <form onSubmit={handleAddNewItem} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Nama Barang
            </label>
            <input
              type="text"
              placeholder="Contoh: Dedak Gandum / Disinfektan Kandang"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Kategori
              </label>
              <select
                value={newItemCat}
                onChange={(e) => setNewItemCat(e.target.value as InventoryCategory)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
              >
                <option value="pakan">Pakan Ternak</option>
                <option value="supplies">Supplies & Obat</option>
                <option value="produk">Produk</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Satuan Unit
              </label>
              <input
                type="text"
                placeholder="kg, liter, botol, pcs"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min="0"
                value={newItemStock}
                onChange={(e) => setNewItemStock(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Batas Min. Stok
              </label>
              <input
                type="number"
                min="1"
                value={newItemMinStock}
                onChange={(e) => setNewItemMinStock(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Estimasi HPP (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={newItemCost}
                onChange={(e) => setNewItemCost(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddItemOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622]"
            >
              Simpan Barang
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: TAMBAH STOK CEPAT MANUAL */}
      <Modal
        isOpen={isAddStockManualOpen}
        onClose={() => setIsAddStockManualOpen(false)}
        title="Tambah Stok Cepat (Manual)"
        subtitle={`Tambah langsung stok untuk ${activeItem?.name}`}
      >
        {activeItem && (
          <form onSubmit={handleAddStockManualSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <div className="flex justify-between items-center">
                <span className="font-bold">Barang:</span>
                <span className="font-extrabold">{activeItem.name}</span>
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px]">
                <span>Stok Sekarang:</span>
                <span className="font-bold text-[#0F5132]">{activeItem.stock} {activeItem.unit}</span>
              </div>
            </div>

            {/* Pilih Barang jika ingin ganti */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Pilih Barang yang Ditambah
              </label>
              <select
                value={activeItemId}
                onChange={(e) => setActiveItemId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
              >
                {data.inventory.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} (Stok: {inv.stock} {inv.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Jumlah Tambah */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Jumlah Tambahan ({activeItem.unit})
              </label>
              <input
                type="number"
                step={activeItem.unit === 'kg' ? '0.1' : '1'}
                min="0.1"
                required
                value={manualAddQty}
                onChange={(e) => setManualAddQty(e.target.value ? Number(e.target.value) : '')}
                placeholder={`Contoh: ${activeItem.unit === 'kg' ? '50' : '10'}`}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-[#0F5132]"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Estimasi stok baru: <strong>{Number(activeItem.stock + (Number(manualAddQty) || 0)).toFixed(1)} {activeItem.unit}</strong>
              </p>
            </div>

            {/* Alasan Tambah */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Keterangan / Alasan Penambahan
              </label>
              <input
                type="text"
                required
                value={manualAddReason}
                onChange={(e) => setManualAddReason(e.target.value)}
                placeholder="Contoh: Panen susulan, bonus supplier, koreksi fisik gudang"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F5132]"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStockManualOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#0F5132] text-white font-bold hover:bg-[#0A3622] flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simpan Tambah Stok</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 6: HAPUS / KURANGI STOK (SUSUT / PECAH / RUSAK) */}
      <Modal
        isOpen={isDiscardStockOpen}
        onClose={() => setIsDiscardStockOpen(false)}
        title="Hapus / Kurangi Stok (Pecah / Rusak / Susut)"
        subtitle={`Pencatatan resmi pengurangan stok untuk ${activeItem?.name}`}
      >
        {activeItem && (
          <form onSubmit={handleDiscardStockSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
              <div className="flex justify-between items-center">
                <span className="font-bold">Barang:</span>
                <span className="font-extrabold">{activeItem.name}</span>
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px]">
                <span>Stok Tersedia Saat Ini:</span>
                <span className="font-bold text-rose-700">{activeItem.stock} {activeItem.unit}</span>
              </div>
            </div>

            {/* Pilih Barang jika ingin ganti */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Pilih Barang yang Dikurangi
              </label>
              <select
                value={activeItemId}
                onChange={(e) => setActiveItemId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white font-bold text-gray-900"
              >
                {data.inventory.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.name} (Stok: {inv.stock} {inv.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Jumlah Kurang / Dihapus */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Jumlah yang Dihapus / Dibuang ({activeItem.unit})
              </label>
              <input
                type="number"
                step={activeItem.unit === 'kg' ? '0.1' : '1'}
                min="0.1"
                max={activeItem.stock}
                required
                value={discardQty}
                onChange={(e) => setDiscardQty(e.target.value ? Number(e.target.value) : '')}
                placeholder={`Maksimal ${activeItem.stock} ${activeItem.unit}`}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-rose-700 focus:ring-2 focus:ring-rose-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Estimasi sisa stok: <strong>{Math.max(0, Number(activeItem.stock - (Number(discardQty) || 0))).toFixed(1)} {activeItem.unit}</strong>
              </p>
            </div>

            {/* Alasan Pemusnahan / Susut */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Alasan Pengurangan / Pemusnahan
              </label>
              <select
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-medium"
              >
                <option value="Telur retak / pecah di gudang">Telur retak / pecah di rak gudang</option>
                <option value="Telur busuk / kadaluarsa">Telur busuk / kadaluarsa sortir</option>
                <option value="Pakan basah / tumpah / berjamur">Pakan basah / tumpah / berjamur</option>
                <option value="Kemasan / Tray sobek & rusak">Kemasan / Tray sobek & rusak</option>
                <option value="Selisih susut bobot timbangan">Selisih susut bobot timbangan</option>
                <option value="Pemusnahan lainnya">Pemusnahan lainnya (tulis di catatan)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDiscardStockOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MinusCircle className="w-4 h-4" />
                <span>Hapus / Potong Stok</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 7: KONFIRMASI HAPUS BARANG DARI INVENTARIS */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">Hapus Barang Inventaris</h3>
                  <p className="text-[11px] text-gray-500">Konfirmasi penghapusan permanen</p>
                </div>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-600 space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus barang <strong>"{itemToDelete.name}"</strong> dari katalog inventaris?
              </p>
              {itemToDelete.stock > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                  ⚠️ Barang ini masih memiliki sisa stok <strong>{itemToDelete.stock} {itemToDelete.unit}</strong>. Menghapus barang akan membersihkan seluruh kartu stoknya.
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteItem}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
