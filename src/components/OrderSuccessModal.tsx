import React, { useState } from 'react';
import { CheckCircle2, Upload, MessageCircle, Copy, AlertCircle, Loader2, Sparkles, X, Image as ImageIcon } from 'lucide-react';
import { Order } from '../types';
import { uploadOrderPaymentProof } from '../services/storeService';
import { RibbonBow } from './RibbonDecoration';
import { compressImage } from '../utils/imageCompressor';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrderTracker: (orderNumber: string) => void;
}

export function OrderSuccessModal({
  order,
  onClose,
  onViewOrderTracker,
}: OrderSuccessModalProps) {
  const [senderBank, setSenderBank] = useState('BCA');
  const [senderName, setSenderName] = useState(order?.customerName || '');
  const [proofUrl, setProofUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  if (!order) return null;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 1500);
  };

  // Handle local file upload with compression to guarantee < 100KB
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 0.7);
        setPreviewImage(compressed);
        setProofUrl(compressed);
      } catch (err) {
        console.error('Compression failed:', err);
      }
    }
  };

  // Quick preset sample receipt for testing
  const handleUseSampleReceipt = () => {
    const sample = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80';
    setPreviewImage(sample);
    setProofUrl(sample);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) {
      alert('Silakan pilih foto bukti transfer atau gunakan sampel bukti pembayaran.');
      return;
    }

    try {
      setIsUploading(true);
      await uploadOrderPaymentProof(order.id, {
        paymentProofUrl: proofUrl,
        paymentSenderBank: senderBank,
        paymentSenderName: senderName || order.customerName,
      });
      setUploadSuccess(true);
    } catch (err) {
      console.error('Error uploading proof:', err);
      alert('Gagal mengunggah bukti pembayaran. Silakan coba kembali.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      `Halo Admin Nazla Skinmart 🎀\nSaya telah membuat pesanan dengan nomor:\n*${order.orderNumber}*\nAtas Nama: ${order.customerName}\nTotal Tagihan: ${formatIDR(order.totalAmount)}\nMetode: ${order.paymentMethod}\n\nMohon dicek dan diverifikasi pembayarannya ya kak. Terima kasih!`
    );
    window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-pink-200 transform transition-all my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white p-6 text-center relative overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs mx-auto flex items-center justify-center border-2 border-white/50 mb-3 shadow-inner">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-serif">
            Pesanan Berhasil Dibuat! 🎀
          </h3>
          <p className="text-xs text-pink-100 mt-1">
            Terima kasih, data pesanan telah tersimpan di real database Nazla Skinmart.
          </p>

          <div className="mt-4 inline-flex items-center space-x-2 bg-white/20 backdrop-blur-xs px-4 py-1.5 rounded-full border border-white/30 text-xs">
            <span className="text-pink-100">No. Order:</span>
            <span className="font-mono font-extrabold text-white">{order.orderNumber}</span>
            <button
              onClick={handleCopyOrderNumber}
              className="ml-1 hover:text-yellow-200 transition-colors"
              title="Salin Nomor Order"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {copiedOrder && <span className="text-[10px] text-yellow-200 font-bold">Tersalin!</span>}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Bill Summary */}
          <div className="bg-pink-50/60 rounded-2xl p-4 border border-pink-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Total Yang Harus Ditransfer:</span>
              <p className="text-xl font-extrabold text-pink-600 font-serif">
                {formatIDR(order.totalAmount)}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Metode: <strong className="text-slate-800">{order.paymentMethod}</strong>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
                {uploadSuccess ? 'Menunggu Verifikasi ⏳' : order.status}
              </span>
            </div>
          </div>

          {/* Upload Proof Section */}
          <div className="border border-pink-200 rounded-2xl p-4 sm:p-5 bg-white space-y-4 shadow-2xs">
            <div className="flex items-center space-x-2 border-b border-pink-100 pb-2">
              <RibbonBow className="w-4 h-4 text-pink-500" />
              <h4 className="text-xs font-bold text-pink-800 uppercase tracking-wider">
                Upload Bukti Pembayaran (Transfer)
              </h4>
            </div>

            {uploadSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h5 className="font-bold text-sm">Bukti Pembayaran Berhasil Dikirim!</h5>
                <p className="text-xs text-emerald-700">
                  Admin Nazla Skinmart akan segera memverifikasi bukti transfer Anda. Status pesanan akan otomatis berubah setelah disetujui.
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadProof} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Bank / E-Wallet Pengirim:
                    </label>
                    <select
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                    >
                      <option value="BCA">BCA</option>
                      <option value="Mandiri">Mandiri</option>
                      <option value="BRI">BRI</option>
                      <option value="BNI">BNI</option>
                      <option value="GoPay / QRIS">GoPay / QRIS</option>
                      <option value="OVO">OVO</option>
                      <option value="Dana">Dana</option>
                      <option value="ShopeePay">ShopeePay</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Pemilik Rekening:
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nama di buku tabungan / e-wallet"
                      className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* File Upload / Image Preview */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Foto Bukti Transfer (Screenshot / Struk):
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="flex-1 w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-2xl bg-pink-50/30 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-pink-500 mb-1" />
                      <span className="text-xs font-semibold text-pink-700">Pilih Foto Bukti</span>
                      <span className="text-[10px] text-slate-400">JPG, PNG, atau WebP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleUseSampleReceipt}
                      className="w-full sm:w-auto px-3.5 py-3 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-2xl font-bold text-xs border border-pink-300 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4 text-pink-600" />
                      <span>Pakai Sampel Bukti</span>
                    </button>
                  </div>

                  {previewImage && (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-pink-200 bg-slate-50 p-2 flex items-center justify-center">
                      <img
                        src={previewImage}
                        alt="Bukti Transfer Preview"
                        className="max-h-36 rounded-lg object-contain"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !proofUrl}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold shadow-md shadow-pink-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengunggah Bukti Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Kirim Bukti Pembayaran Sekarang</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konfirmasi via WhatsApp</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onViewOrderTracker(order.orderNumber);
              }}
              className="py-3 px-4 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-300 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Lacak Status Pesanan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
