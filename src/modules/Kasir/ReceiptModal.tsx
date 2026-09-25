import React, { useState } from 'react';
import { Sale, DatabaseSchema } from '../../types/database';
import { formatRupiah, generateSaleInvoicePdf } from '../../services/pdfGenerator';
import { 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  X, 
  FileText, 
  Receipt,
  Copy,
  Check
} from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
  settings: DatabaseSchema['settings'];
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  onClose,
  settings,
}) => {
  const [activeView, setActiveView] = useState<'thermal58' | 'invoiceA4'>('thermal58');
  const [copied, setCopied] = useState(false);

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateSaleInvoicePdf(sale, settings);
  };

  const handleShareWhatsApp = () => {
    const text = `*STRUK PEMBELIAN TELUR GHN EGG FARM NUSANTARA*
No. Faktur: ${sale.invoiceNumber}
Tanggal: ${sale.date}
Pelanggan: ${sale.customerName}
---------------------------------
Produk: ${sale.items.map((i) => `${i.productName} (${i.quantity} ${i.unit} @ ${formatRupiah(i.pricePerUnit)}) = ${formatRupiah(i.subtotal)}`).join('\n')}
---------------------------------
Subtotal: ${formatRupiah(sale.subtotal)}
Diskon: ${formatRupiah(sale.discount)}
*TOTAL: ${formatRupiah(sale.totalAmount)}*
Dibayar: ${formatRupiah(sale.paidAmount)} (${sale.paymentMethod})
Status: *${sale.paymentStatus.toUpperCase()}*
${sale.balanceDue > 0 ? `Sisa Piutang: ${formatRupiah(sale.balanceDue)} (Tempo: ${sale.dueDate || '-'})` : 'LUNAS - TERIMA KASIH'}
---------------------------------
${settings.address}
WA: ${settings.phone}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Open whatsapp web/app if possible
    const cleanPhone = sale.customerPhone ? sale.customerPhone.replace(/[^0-9]/g, '') : '';
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyText = () => {
    const text = `STRUK GHN EGG FARM - ${sale.invoiceNumber} | ${sale.customerName} | ${sale.totalKg} kg | Total: ${formatRupiah(sale.totalAmount)} (${sale.paymentStatus.toUpperCase()})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose} 
      />

      <div 
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl bg-white text-left shadow-2xl border border-gray-200 my-auto animate-in fade-in duration-150"
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAF9F6] border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0F5132] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Transaksi Berhasil Disimpan
                </h3>
                <p className="text-[11px] text-gray-500 font-mono">
                  {sale.invoiceNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* View Switcher */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveView('thermal58')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    activeView === 'thermal58'
                      ? 'bg-white text-[#0F5132] shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Struk 58mm</span>
                </button>
                <button
                  onClick={() => setActiveView('invoiceA4')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    activeView === 'invoiceA4'
                      ? 'bg-white text-[#0F5132] shadow-2xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Faktur A4</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Preview */}
          <div className="p-4 sm:p-6 bg-gray-50/50 flex justify-center max-h-[65vh] overflow-y-auto">
            {activeView === 'thermal58' ? (
              /* Thermal 58mm Receipt View */
              <div 
                id="thermal-receipt"
                className="print-area w-72 bg-white p-4 rounded-xl shadow-md border border-gray-200 font-mono text-[11px] leading-relaxed text-gray-800"
              >
                {/* Header */}
                <div className="text-center pb-2 border-b border-dashed border-gray-300">
                  <p className="font-extrabold text-sm text-[#0F5132]">GHN EGG FARM</p>
                  <p className="text-[10px] text-gray-600 font-sans">{settings.farmName}</p>
                  <p className="text-[9px] text-gray-500 font-sans">{settings.address}</p>
                  <p className="text-[9px] text-gray-500 font-sans">WA: {settings.phone}</p>
                </div>

                {/* Meta */}
                <div className="py-2 border-b border-dashed border-gray-300 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>No:</span>
                    <span className="font-bold">{sale.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tgl:</span>
                    <span>{sale.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>{sale.operatorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plg:</span>
                    <span className="font-bold">{sale.customerName}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="py-2 border-b border-dashed border-gray-300">
                  {sale.items.map((item, idx) => (
                    <div key={idx} className="mb-1.5">
                      <div className="font-bold">{item.productName}</div>
                      <div className="flex justify-between text-[10px]">
                        <span>{item.quantity} {item.unit} x {item.pricePerUnit.toLocaleString('id-ID')}</span>
                        <span>{item.subtotal.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="py-2 border-b border-dashed border-gray-300 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp {sale.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Diskon:</span>
                      <span>- Rp {sale.discount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black pt-1 border-t border-dotted border-gray-300">
                    <span>TOTAL:</span>
                    <span>Rp {sale.totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span>Bayar ({sale.paymentMethod}):</span>
                    <span>Rp {sale.paidAmount.toLocaleString('id-ID')}</span>
                  </div>
                  {sale.balanceDue > 0 ? (
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>Sisa Piutang:</span>
                      <span>Rp {sale.balanceDue.toLocaleString('id-ID')}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Kembalian:</span>
                      <span>Rp 0</span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="text-center py-2.5">
                  <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                    sale.paymentStatus === 'lunas' 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                      : sale.paymentStatus === 'dp'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}>
                    {sale.paymentStatus === 'lunas' ? '*** LUNAS ***' : sale.paymentStatus === 'dp' ? '*** UANG MUKA (DP) ***' : '*** TEMPO / BELUM BAYAR ***'}
                  </span>
                </div>

                {/* Footer */}
                <div className="text-center pt-2 text-[9px] text-gray-500 font-sans border-t border-dashed border-gray-300 leading-tight">
                  <p>{settings.receiptFooter}</p>
                  <p className="mt-1 font-mono text-[8px] text-gray-400">--- GHN ERP LITE V2 ---</p>
                </div>
              </div>
            ) : (
              /* A4 Invoice Preview Card */
              <div className="w-full bg-white p-5 rounded-xl shadow-md border border-gray-200 text-xs text-gray-800">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h4 className="font-bold text-sm text-[#0F5132]">{settings.farmName}</h4>
                    <p className="text-[11px] text-gray-500">{settings.address}</p>
                    <p className="text-[11px] text-gray-500">Telp: {settings.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-gray-900">{sale.invoiceNumber}</span>
                    <p className="text-[11px] text-gray-500">{sale.date}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                      {sale.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="my-3 py-2 bg-gray-50 rounded-lg px-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Ditagihkan Kepada:</span>
                  <p className="font-bold text-gray-800 text-sm">{sale.customerName}</p>
                  {sale.customerPhone && <p className="text-xs text-gray-500">{sale.customerPhone}</p>}
                </div>

                <table className="w-full text-left mt-3">
                  <thead>
                    <tr className="border-b text-[10px] text-gray-400 uppercase">
                      <th className="py-1">Produk</th>
                      <th className="py-1 text-center">Jumlah</th>
                      <th className="py-1 text-right">Harga</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sale.items.map((i, idx) => (
                      <tr key={idx} className="text-xs">
                        <td className="py-2 font-medium">{i.productName}</td>
                        <td className="py-2 text-center">{i.quantity} {i.unit}</td>
                        <td className="py-2 text-right">{formatRupiah(i.pricePerUnit)}</td>
                        <td className="py-2 text-right font-bold">{formatRupiah(i.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 pt-3 border-t flex justify-end">
                  <div className="w-56 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal:</span>
                      <span>{formatRupiah(sale.subtotal)}</span>
                    </div>
                    {sale.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Diskon:</span>
                        <span>- {formatRupiah(sale.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-[#0F5132] pt-1 border-t">
                      <span>Total:</span>
                      <span>{formatRupiah(sale.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 pt-0.5">
                      <span>Dibayar ({sale.paymentMethod}):</span>
                      <span>{formatRupiah(sale.paidAmount)}</span>
                    </div>
                    {sale.balanceDue > 0 && (
                      <div className="flex justify-between font-bold text-rose-700">
                        <span>Sisa Piutang:</span>
                        <span>{formatRupiah(sale.balanceDue)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0F5132] text-white hover:bg-[#0A3622] text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk (58mm)</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-bold transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF (A4)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all active:scale-95"
                title="Kirim Struk via WhatsApp"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopyText}
                className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                title="Salin Teks"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};
