import React, { useState, useMemo } from 'react';
import { DatabaseSchema, ProductionRecord } from '../../types/database';
import { db } from '../../services/db';
import { formatNumber } from '../../services/pdfGenerator';
import { 
  Egg, 
  TrendingUp, 
  Scale, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Filter,
  Layers,
  ArrowUpRight,
  RotateCcw,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

interface ProduksiModuleProps {
  data: DatabaseSchema;
}

export const ProduksiModule: React.FC<ProduksiModuleProps> = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];

  // Form states
  const [date, setDate] = useState(today);
  const [chickenCount, setChickenCount] = useState<number>(data.settings.chickenPopulation);
  const [eggsCount, setEggsCount] = useState<number | ''>(2180);
  const [eggWeightKg, setEggWeightKg] = useState<number | ''>(137.9);
  const [brokenCount, setBrokenCount] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Pembatalan Input Salah State
  const [recordToCancel, setRecordToCancel] = useState<ProductionRecord | null>(null);

  // Filter state
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'all'>('this_month');

  // Real-time automatic calculations
  const numEggs = typeof eggsCount === 'number' ? eggsCount : 0;
  const numWeight = typeof eggWeightKg === 'number' ? eggWeightKg : 0;
  const numChickens = chickenCount > 0 ? chickenCount : 1;

  const calculatedHDP = useMemo(() => {
    return Number(((numEggs / numChickens) * 100).toFixed(2));
  }, [numEggs, numChickens]);

  const calculatedAvgGram = useMemo(() => {
    if (numEggs <= 0 || numWeight <= 0) return 0;
    return Number(((numWeight * 1000) / numEggs).toFixed(1));
  }, [numEggs, numWeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numEggs || !numWeight) return;

    db.recordProduction({
      date,
      chickenCount,
      eggsCount: numEggs,
      eggWeightKg: numWeight,
      brokenCount: typeof brokenCount === 'number' ? brokenCount : 0,
      notes,
    });

    setSuccessToast(`Panen berhasil dicatat! Stok telur otomatis bertambah +${numWeight} kg`);
    setTimeout(() => setSuccessToast(null), 4000);

    // Reset notes
    setNotes('');
  };

  // Filtered Production Records
  const filteredRecords = useMemo(() => {
    const list = [...data.production];
    const now = new Date();

    if (timeFilter === 'today') {
      return list.filter((p) => p.date === today);
    }
    if (timeFilter === 'yesterday') {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterday = y.toISOString().split('T')[0];
      return list.filter((p) => p.date === yesterday);
    }
    if (timeFilter === 'this_week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const limit = oneWeekAgo.toISOString().split('T')[0];
      return list.filter((p) => p.date >= limit);
    }
    if (timeFilter === 'this_month') {
      const currentMonth = today.substring(0, 7);
      return list.filter((p) => p.date.startsWith(currentMonth));
    }
    if (timeFilter === 'last_month') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonth = prev.toISOString().substring(0, 7);
      return list.filter((p) => p.date.startsWith(prevMonth));
    }
    return list;
  }, [data.production, timeFilter, today]);

  // Aggregate stats for the filtered period
  const totalFilteredEggs = filteredRecords.reduce((sum, p) => sum + p.eggsCount, 0);
  const totalFilteredKg = filteredRecords.reduce((sum, p) => sum + p.eggWeightKg, 0);
  const avgFilteredHDP = filteredRecords.length > 0
    ? Number((filteredRecords.reduce((sum, p) => sum + p.hdp, 0) / filteredRecords.length).toFixed(2))
    : 0;
  const avgFilteredGram = filteredRecords.length > 0
    ? Number((filteredRecords.reduce((sum, p) => sum + p.avgGramPerEgg, 0) / filteredRecords.length).toFixed(1))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-[#0F5132]">
              <Egg className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Modul Produksi & Panen Telur
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Setiap panen yang dicatat otomatis menambah Stok Telur segar di gudang inventaris.
          </p>
        </div>

        {/* Current Egg Stock Pill */}
        <div className="flex items-center gap-2 bg-[#FAF9F6] border border-emerald-900/10 px-3.5 py-1.5 rounded-xl text-xs">
          <span className="text-gray-500">Stok Telur Tersedia:</span>
          <span className="font-extrabold text-[#0F5132] text-sm">
            {data.inventory.find((i) => i.id === 'inv_telur')?.stock.toLocaleString('id-ID')} Kg
          </span>
        </div>
      </div>

      {/* Success Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
            Stok Terupdate
          </span>
        </div>
      )}

      {/* Form Input + Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0F5132]" />
              Form Catat Hasil Panen Harian
            </h3>
            <span className="text-xs text-gray-400 font-mono">Fase Layer</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Tanggal Panen
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent font-medium"
                    required
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Jumlah Ayam */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Jumlah Populasi Ayam (Ekor)
                </label>
                <input
                  type="number"
                  min="1"
                  value={chickenCount}
                  onChange={(e) => setChickenCount(Number(e.target.value))}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent font-medium"
                  required
                />
              </div>

              {/* Jumlah Telur */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Jumlah Telur Bagus (Butir)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Contoh: 2180"
                  value={eggsCount}
                  onChange={(e) => setEggsCount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent font-medium"
                  required
                />
              </div>

              {/* Berat Telur (kg) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Berat Total Telur (Kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  placeholder="Contoh: 137.9"
                  value={eggWeightKg}
                  onChange={(e) => setEggWeightKg(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent font-medium"
                  required
                />
              </div>

              {/* Telur Retak / Pecah */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Telur Retak / Afkir (Butir)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={brokenCount}
                  onChange={(e) => setBrokenCount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent font-medium"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Catatan Kondisi Panen
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Panen lancar, kerabang tebal, cuaca sejuk"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0F5132] focus:border-transparent font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">
                Stok Telur akan bertambah <strong className="text-emerald-700">+{numWeight} kg</strong>
              </span>
              <button
                type="submit"
                className="bg-[#0F5132] hover:bg-[#0A3622] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Produksi Panen</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Automatic Calculations Card */}
        <div className="bg-[#FAF9F6] rounded-2xl p-5 border border-emerald-900/10 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-emerald-900/10 mb-4">
              <TrendingUp className="w-4 h-4 text-[#0F5132]" />
              <h4 className="font-bold text-sm text-gray-900">Perhitungan Otomatis Sistem</h4>
            </div>

            <div className="space-y-4">
              {/* Calculated HDP */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Hen Day Production (HDP)
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-[#0F5132]">
                    {calculatedHDP}%
                  </span>
                  <span className={`text-[11px] font-bold ${calculatedHDP >= 82 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {calculatedHDP >= 85 ? 'Sangat Optimal' : calculatedHDP >= 80 ? 'Standar Baik' : 'Di Bawah Target'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Rumus: (Jumlah Telur ÷ Populasi Ayam) × 100
                </p>
              </div>

              {/* Rata-rata Berat Telur */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Rata-rata Berat Per Butir
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900">
                    {calculatedAvgGram} gr
                  </span>
                  <span className="text-[11px] font-bold text-gray-500">
                    {calculatedAvgGram >= 60 && calculatedAvgGram <= 65 ? 'Grade A (Standar Ideal)' : 'Grade B / Campur'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Rumus: (Berat Kg × 1000) ÷ Jumlah Butir
                </p>
              </div>

              {/* Konversi Butir ke Tray */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Estimasi Kemasan Egg Tray
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-amber-700">
                    {numEggs > 0 ? (numEggs / 30).toFixed(1) : 0} Tray
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">(Kapasitas 30 btr)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-900/10 text-[11px] text-gray-500 leading-relaxed">
            <span className="font-bold text-[#0F5132]">Prinsip GHN ERP:</span> Tidak perlu input manual ke modul stok. Begitu disimpan, kartu stok telur langsung terbarui.
          </div>
        </div>
      </div>

      {/* FILTER & HISTORY SECTION */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              Riwayat Produksi & Hen Day Log
            </h3>
            <p className="text-xs text-gray-500">
              Total {filteredRecords.length} catatan panen terdata
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'this_week', label: 'Minggu Ini' },
              { id: 'this_month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeFilter === f.id
                    ? 'bg-white text-[#0F5132] shadow-2xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Period Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-[#FAF9F6] border border-emerald-900/10 text-xs">
          <div>
            <span className="text-gray-500 text-[11px]">Total Butir:</span>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{formatNumber(totalFilteredEggs)} Butir</p>
          </div>
          <div>
            <span className="text-gray-500 text-[11px]">Total Berat:</span>
            <p className="font-bold text-[#0F5132] text-sm mt-0.5">{formatNumber(totalFilteredKg, 2)} Kg</p>
          </div>
          <div>
            <span className="text-gray-500 text-[11px]">Rata-rata HDP:</span>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{avgFilteredHDP}%</p>
          </div>
          <div>
            <span className="text-gray-500 text-[11px]">Rata-rata Berat/Btr:</span>
            <p className="font-bold text-gray-900 text-sm mt-0.5">{avgFilteredGram} gr</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Populasi</th>
                <th className="py-2.5 px-3">Hasil Panen</th>
                <th className="py-2.5 px-3">Berat (Kg)</th>
                <th className="py-2.5 px-3">HDP (%)</th>
                <th className="py-2.5 px-3">Rata-rata</th>
                <th className="py-2.5 px-3">Afkir</th>
                <th className="py-2.5 px-3">Catatan</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-gray-900 whitespace-nowrap">
                    {record.date}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {formatNumber(record.chickenCount)} ekor
                  </td>
                  <td className="py-3 px-3 font-bold text-gray-900">
                    {formatNumber(record.eggsCount)} btr
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0F5132]">
                    {formatNumber(record.eggWeightKg, 2)} kg
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.hdp >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : record.hdp >= 80
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {record.hdp.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {record.avgGramPerEgg.toFixed(1)} gr
                  </td>
                  <td className="py-3 px-3 text-gray-500">
                    {record.brokenCount > 0 ? (
                      <span className="text-rose-600 font-semibold">{record.brokenCount} btr</span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-500 max-w-xs truncate">
                    {record.notes || '-'}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setRecordToCancel(record)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                      title="Batalkan input panen ini jika ada kesalahan input"
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

      {/* MODAL KONFIRMASI PEMBATALAN INPUT PANEN */}
      {recordToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">Batalkan Input Panen?</h3>
                  <p className="text-[11px] text-gray-500">Koreksi jika terjadi salah input data</p>
                </div>
              </div>
              <button
                onClick={() => setRecordToCancel(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-gray-600">
              <div className="p-3 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal Panen:</span>
                  <span className="font-bold text-gray-900">{recordToCancel.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah Telur:</span>
                  <span className="font-bold text-gray-900">{recordToCancel.eggsCount.toLocaleString()} Butir</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Berat Panen:</span>
                  <span className="font-bold text-[#0F5132]">{recordToCancel.eggWeightKg} Kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hen Day Production:</span>
                  <span className="font-bold text-gray-900">{recordToCancel.hdp}%</span>
                </div>
                {recordToCancel.notes && (
                  <div className="pt-1 text-[11px] text-gray-500 border-t border-gray-100 italic">
                    "{recordToCancel.notes}"
                  </div>
                )}
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] leading-relaxed">
                <strong>Otomatisasi Sistem:</strong> Stok telur segar di inventaris akan otomatis <strong>dikurangi kembali sebesar -{recordToCancel.eggWeightKg} kg</strong> agar angka fisik dan catatan sinkron.
              </div>
            </div>

            <div className="mt-5 pt-3 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setRecordToCancel(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = db.cancelProduction(recordToCancel.id);
                  setRecordToCancel(null);
                  setSuccessToast(res.message);
                  setTimeout(() => setSuccessToast(null), 4500);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Batalkan Catatan Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
