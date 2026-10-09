import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Copy, AlertCircle, ArrowLeft, Loader2, CreditCard, QrCode } from 'lucide-react';
import { CartItem, Order, OrderItem } from '../types';
import { createOrder } from '../services/storeService';
import { RibbonBow } from './RibbonDecoration';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountAmount: number;
  appliedVoucherCode: string;
  onOrderCreated: (order: Order) => void;
}

export const PAYMENT_METHODS = [
  {
    id: 'BCA',
    name: 'Transfer Bank BCA',
    accountNumber: '829-109-8822',
    accountHolder: 'Nazla Skinmart Official',
    type: 'bank',
  },
  {
    id: 'Mandiri',
    name: 'Transfer Bank Mandiri',
    accountNumber: '137-00-9821-4455',
    accountHolder: 'Nazla Skinmart',
    type: 'bank',
  },
  {
    id: 'BRI',
    name: 'Transfer Bank BRI',
    accountNumber: '0341-01-008922-501',
    accountHolder: 'Nazla Skinmart',
    type: 'bank',
  },
  {
    id: 'QRIS',
    name: 'QRIS Instant (Semua Bank / E-Wallet)',
    accountNumber: 'NMID: ID10202619472',
    accountHolder: 'Nazla Skinmart QRIS',
    type: 'qris',
  },
];

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  discountAmount,
  appliedVoucherCode,
  onOrderCreated,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('BCA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const isFreeShipping = subtotal >= 150000;
  const shippingFee = isFreeShipping || items.length === 0 ? 0 : 15000;
  const totalAmount = Math.max(0, subtotal + shippingFee - discountAmount);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 1500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim() || !customerPhone.trim() || !shippingAddress.trim() || !city.trim()) {
      setErrorMsg('Mohon lengkapi Nama, No. WhatsApp, Alamat Lengkap, dan Kota pengiriman.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Keranjang belanja kosong.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderItems: OrderItem[] = items.map((it) => ({
        productId: it.product.id,
        name: it.product.name,
        price: it.product.price,
        quantity: it.quantity,
        imageUrl: it.product.imageUrl,
        category: it.product.category,
      }));

      const activePayment = PAYMENT_METHODS.find((p) => p.id === selectedPayment);
      const paymentMethodName = activePayment ? activePayment.name : selectedPayment;

      const newOrder = await createOrder({
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        city,
        notes,
        items: orderItems,
        subtotal,
        shippingFee,
        discount: discountAmount,
        totalAmount,
        paymentMethod: paymentMethodName,
      });

      onOrderCreated(newOrder);
      onClose();
    } catch (err) {
      console.error('Error creating order in Firestore:', err);
      setErrorMsg('Gagal memproses pesanan ke database. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPaymentInfo = PAYMENT_METHODS.find((p) => p.id === selectedPayment);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-pink-200 transform transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 bg-pink-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-slate-800 text-base font-serif">Formulir Checkout Pesanan</h3>
                <RibbonBow className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-[11px] text-pink-700">
                Data akan tersimpan aman ke real database Nazla Skinmart
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

        {/* Checkout Form Content */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-pink-100 pb-2">
              <RibbonBow className="w-3.5 h-3.5 text-pink-500" />
              <h4 className="text-xs font-bold text-pink-800 uppercase tracking-wider">
                1. Data Penerima & Pengiriman
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Penerima <span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Putri Nazla"
                  className="w-full px-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif <span className="text-pink-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email (Opsional untuk Bukti Invoice Digital)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Contoh: nazla@gmail.com"
                  className="w-full px-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Rumah / Kantor <span className="text-pink-600">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                  className="w-full px-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota / Kabupaten & Kode Pos <span className="text-pink-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Contoh: Bandung, 40132"
                  className="w-full px-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan untuk Penjual / Kurir
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tolong bungkus bubble wrap tebal"
                  className="w-full px-3 py-2 text-xs bg-pink-50/40 border border-pink-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Order Items Summary */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 border-b border-pink-100 pb-2">
              <RibbonBow className="w-3.5 h-3.5 text-pink-500" />
              <h4 className="text-xs font-bold text-pink-800 uppercase tracking-wider">
                2. Ringkasan Produk ({items.reduce((a, b) => a + b.quantity, 0)} item)
              </h4>
            </div>

            <div className="bg-pink-50/40 rounded-2xl p-3 border border-pink-100 space-y-2 max-h-40 overflow-y-auto">
              {items.map((it) => (
                <div key={it.product.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <img
                      src={it.product.imageUrl}
                      alt={it.product.name}
                      className="w-9 h-9 rounded-lg object-cover bg-white border border-pink-100 flex-shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 truncate">{it.product.name}</p>
                      <p className="text-[11px] text-slate-500">{it.quantity} x {formatIDR(it.product.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-pink-700 ml-2">
                    {formatIDR(it.product.price * it.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Payment Method Selection */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-pink-100 pb-2">
              <RibbonBow className="w-3.5 h-3.5 text-pink-500" />
              <h4 className="text-xs font-bold text-pink-800 uppercase tracking-wider">
                3. Pilih Metode Pembayaran
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment === method.id;
                return (
                  <label
                    key={method.id}
                    className={`relative p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/80 shadow-xs'
                        : 'border-slate-200 hover:border-pink-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => setSelectedPayment(method.id)}
                        className="text-pink-600 focus:ring-pink-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{method.name}</p>
                        <p className="text-[10px] text-slate-500">{method.accountNumber}</p>
                      </div>
                    </div>
                    {method.type === 'qris' ? (
                      <QrCode className="w-5 h-5 text-pink-500" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-pink-500" />
                    )}
                  </label>
                );
              })}
            </div>

            {/* Rekening Info Card */}
            {currentPaymentInfo && (
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-3.5 rounded-2xl border border-pink-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-pink-700 font-bold block uppercase">
                    Rekening Pembayaran {currentPaymentInfo.id}:
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900 block mt-0.5">
                    {currentPaymentInfo.accountNumber}
                  </span>
                  <span className="text-[11px] text-slate-600">
                    a.n {currentPaymentInfo.accountHolder}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyAccount(currentPaymentInfo.accountNumber)}
                  className="px-3 py-1.5 bg-white text-pink-600 border border-pink-300 rounded-xl font-bold text-xs hover:bg-pink-100 transition-colors flex items-center space-x-1 shadow-2xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAccount ? 'Tersalin! 🎀' : 'Salin Rek'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Final Total Calculation */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal Produk:</span>
              <span className="font-semibold text-slate-800">{formatIDR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim:</span>
              <span>{isFreeShipping ? 'GRATIS 🎀' : formatIDR(shippingFee)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Potongan Kupon ({appliedVoucherCode}):</span>
                <span>-{formatIDR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200 font-serif">
              <span>Total Pembayaran:</span>
              <span className="text-pink-600 text-base">{formatIDR(totalAmount)}</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-300 hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Pesanan ke Database...</span>
                </>
              ) : (
                <>
                  <RibbonBow className="w-4 h-4 text-pink-100" />
                  <span>Konfirmasi & Buat Pesanan Sekarang ({formatIDR(totalAmount)})</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Setelah konfirmasi, Anda akan dialihkan untuk mengunggah bukti transfer pembayaran.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
