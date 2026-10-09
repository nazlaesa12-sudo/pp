import React, { useState } from 'react';
import { X, Search, Truck, Clock, CheckCircle, AlertCircle, Upload, Eye, FileText } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { uploadOrderPaymentProof } from '../services/storeService';
import { RibbonBow } from './RibbonDecoration';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  initialOrderNumber?: string;
}

export function OrderTrackerModal({
  isOpen,
  onClose,
  orders,
  initialOrderNumber = '',
}: OrderTrackerModalProps) {
  const [searchKey, setSearchKey] = useState(initialOrderNumber);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [uploadProofModalOpen, setUploadProofModalOpen] = useState(false);
  const [proofImage, setProofImage] = useState('');
  const [senderBank, setSenderBank] = useState('BCA');
  const [senderName, setSenderName] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Sync if initialOrderNumber changes
  React.useEffect(() => {
    if (initialOrderNumber) {
      setSearchKey(initialOrderNumber);
      const found = orders.find(
        (o) => o.orderNumber.toLowerCase() === initialOrderNumber.toLowerCase()
      );
      if (found) setSelectedOrder(found);
    }
  }, [initialOrderNumber, orders]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchKey.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customerPhone.includes(query) ||
        o.customerName.toLowerCase().includes(query)
    );

    setSelectedOrder(found || null);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Menunggu Pembayaran':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Menunggu Verifikasi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Diproses':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Dikirim':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Selesai':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Dibatalkan':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !proofImage) return;

    try {
      setIsSubmittingProof(true);
      await uploadOrderPaymentProof(selectedOrder.id, {
        paymentProofUrl: proofImage,
        paymentSenderBank: senderBank,
        paymentSenderName: senderName || selectedOrder.customerName,
      });
      alert('Bukti pembayaran berhasil diunggah! Mohon tunggu konfirmasi admin 🎀');
      setUploadProofModalOpen(false);
      setProofImage('');
    } catch (err) {
      console.error(err);
      alert('Gagal mengunggah bukti');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-pink-200 transform transition-all my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 bg-pink-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-slate-800 text-base font-serif">Lacak Pesanan Skincare</h3>
                <RibbonBow className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-[11px] text-pink-700">
                Pantau proses pengiriman dan status persetujuan bukti bayar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-pink-600 flex items-center justify-center shadow-xs border border-pink-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b border-pink-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Masukkan Nomor Order (NZL-...) atau No WhatsApp..."
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-pink-50/50 border border-pink-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-400"
              />
              <Search className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-200 transition-all"
            >
              Cari Order
            </button>
          </form>

          {/* Quick Recent Orders Chip List if available */}
          {orders.length > 0 && (
            <div className="mt-3 flex items-center space-x-2 overflow-x-auto text-xs scrollbar-none">
              <span className="text-[11px] text-slate-400 whitespace-nowrap">Order Terbaru:</span>
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSearchKey(o.orderNumber);
                    setSelectedOrder(o);
                  }}
                  className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg text-[11px] font-mono font-medium text-pink-700 whitespace-nowrap"
                >
                  {o.orderNumber}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Details View */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {!selectedOrder ? (
            <div className="text-center py-8 space-y-2">
              <Clock className="w-10 h-10 text-pink-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">Belum Ada Pesanan yang Dipilih</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Silakan ketik nomor order atau pilih dari daftar pesanan terbaru di atas untuk melihat detail.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Header */}
              <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-slate-500">Nomor Pesanan:</span>
                  <p className="font-mono text-base font-extrabold text-pink-600">
                    {selectedOrder.orderNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Dibuat: {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block mb-1">Status Saat Ini:</span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Admin Note if any */}
              {selectedOrder.adminNotes && (
                <div className="bg-pink-100/60 p-3 rounded-xl border border-pink-200 text-xs text-pink-900">
                  <span className="font-bold block mb-0.5">Catatan Toko:</span>
                  {selectedOrder.adminNotes}
                </div>
              )}

              {/* Status Stepper Tracker */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  <div className={`p-2 rounded-xl border ${selectedOrder.status !== 'Dibatalkan' ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-slate-50 text-slate-400'}`}>
                    1. Checkout
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedOrder.paymentProofUrl || ['Diproses', 'Dikirim', 'Selesai'].includes(selectedOrder.status) ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-slate-50 text-slate-400'}`}>
                    2. Verifikasi Bukti
                  </div>
                  <div className={`p-2 rounded-xl border ${['Diproses', 'Dikirim', 'Selesai'].includes(selectedOrder.status) ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-slate-50 text-slate-400'}`}>
                    3. Dikemas & Kirim
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedOrder.status === 'Selesai' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                    4. Selesai
                  </div>
                </div>
              </div>

              {/* Payment Proof Status */}
              <div className="bg-white p-4 rounded-2xl border border-pink-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Bukti Pembayaran:
                  </h5>
                  {selectedOrder.paymentProofUrl ? (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Sudah Diunggah
                    </span>
                  ) : (
                    <button
                      onClick={() => setUploadProofModalOpen(true)}
                      className="px-3 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" /> Upload Bukti
                    </button>
                  )}
                </div>

                {selectedOrder.paymentProofUrl ? (
                  <div className="flex items-center space-x-3 bg-pink-50/50 p-2.5 rounded-xl border border-pink-100">
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="Bukti Transfer"
                      className="w-16 h-16 rounded-lg object-cover border border-pink-200"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">
                        {selectedOrder.paymentSenderBank} - {selectedOrder.paymentSenderName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Diunggah:{' '}
                        {selectedOrder.paymentProofUploadedAt
                          ? new Date(selectedOrder.paymentProofUploadedAt).toLocaleString('id-ID')
                          : '-'}
                      </p>
                      <a
                        href={selectedOrder.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-600 hover:underline font-bold text-[11px] inline-flex items-center gap-1 mt-1"
                      >
                        <Eye className="w-3 h-3" /> Lihat Gambar Penuh
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    Belum ada bukti pembayaran yang diunggah. Silakan klik tombol di atas untuk mengirimkan bukti transfer agar pesanan segera diproses.
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="bg-white p-4 rounded-2xl border border-pink-200 space-y-2">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Daftar Produk Pesanan:
                </h5>
                <div className="space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-pink-50 last:border-0">
                      <div className="flex items-center space-x-2">
                        <img
                          src={it.imageUrl}
                          alt={it.name}
                          className="w-8 h-8 rounded-md object-cover border border-pink-100"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{it.name}</p>
                          <p className="text-[11px] text-slate-500">{it.quantity} x {formatIDR(it.price)}</p>
                        </div>
                      </div>
                      <span className="font-bold text-pink-700">
                        {formatIDR(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-pink-100 text-xs flex justify-between font-bold">
                  <span>Total Tagihan:</span>
                  <span className="text-pink-600 font-serif text-sm">
                    {formatIDR(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Customer and Shipping Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p>
                  <strong className="text-slate-700">Penerima:</strong> {selectedOrder.customerName} (
                  {selectedOrder.customerPhone})
                </p>
                <p>
                  <strong className="text-slate-700">Alamat Kirim:</strong>{' '}
                  {selectedOrder.shippingAddress}, {selectedOrder.city}
                </p>
                {selectedOrder.notes && (
                  <p>
                    <strong className="text-slate-700">Catatan:</strong> {selectedOrder.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sub-modal: Upload Proof from Tracker */}
        {uploadProofModalOpen && selectedOrder && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-30">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-3 border-2 border-pink-200">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-slate-800">Unggah Bukti Bayar</h4>
                <button
                  onClick={() => setUploadProofModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitProof} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Pengirim:</label>
                  <input
                    type="text"
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    placeholder="Contoh: BCA / Mandiri / GoPay"
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pengirim:</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Nama di mutasi rekening"
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih Foto Bukti:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setProofImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProofImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
                    }}
                    className="px-3 py-2 bg-pink-100 text-pink-700 rounded-xl font-bold"
                  >
                    Gunakan Sampel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingProof || !proofImage}
                    className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold"
                  >
                    {isSubmittingProof ? 'Mengirim...' : 'Kirim Bukti 🎀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
