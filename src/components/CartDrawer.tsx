import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles, Check, AlertCircle } from 'lucide-react';
import { CartItem } from '../types';
import { RibbonBow } from './RibbonDecoration';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedCheckout: (discountAmount: number, appliedCode: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
}: CartDrawerProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherError, setVoucherError] = useState('');

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 150000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = isFreeShipping || items.length === 0 ? 0 : 15000;

  // Calculate discount
  let discount = 0;
  if (appliedVoucher) {
    discount = appliedVoucher.discount;
  }
  const total = Math.max(0, subtotal + shippingFee - discount);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    const code = voucherCode.trim().toUpperCase();

    if (code === 'NAZLA10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedVoucher({ code, discount: disc });
    } else if (code === 'CANTIKPINK') {
      setAppliedVoucher({ code, discount: 20000 });
    } else {
      setVoucherError('Kode voucher tidak valid. Coba gunakan NAZLA10 atau CANTIKPINK 🎀');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherError('');
  };

  const handleCheckout = () => {
    onProceedCheckout(discount, appliedVoucher?.code || '');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l-2 border-pink-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 bg-pink-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="font-bold text-slate-800 text-base font-serif">Keranjang Belanja</h3>
                <RibbonBow className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-[11px] text-pink-600 font-medium">
                {items.length} jenis produk skincare dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 transition-colors"
                title="Kosongkan Keranjang"
              >
                Hapus Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white text-slate-500 hover:text-pink-600 flex items-center justify-center shadow-xs border border-pink-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="px-5 py-3 bg-pink-50/80 border-b border-pink-100 text-xs">
            {isFreeShipping ? (
              <div className="flex items-center space-x-1.5 text-pink-700 font-bold">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span>Selamat! Pesananmu berhak dapat Gratis Ongkir 🎀</span>
              </div>
            ) : (
              <div>
                <div className="flex justify-between font-medium text-slate-600 mb-1">
                  <span>Belanja Rp {formatIDR(FREE_SHIPPING_THRESHOLD - subtotal)} lagi untuk Gratis Ongkir</span>
                  <span className="font-bold text-pink-600">
                    {Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-pink-200/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center border-2 border-dashed border-pink-300">
                <RibbonBow className="w-12 h-12 text-pink-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-base font-serif">Keranjang Belum Diisi</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Pilih produk skincare impianmu di katalog Nazla Skinmart dan mulai rawat kulit cantikmu!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg transition-all"
              >
                Lihat Produk Skincare 🎀
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-pink-100 shadow-2xs hover:border-pink-300 transition-colors"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-xl object-cover bg-pink-50 flex-shrink-0 border border-pink-100"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[11px] text-pink-600 font-extrabold mt-0.5">
                    {formatIDR(item.product.price)}
                  </p>

                  {/* Quantity adjustment */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1.5 border border-pink-200 rounded-full px-2 py-0.5 bg-pink-50/50">
                      <button
                        onClick={() => onUpdateQty(item.product.id, -1)}
                        className="w-5 h-5 rounded-full bg-white text-pink-600 font-bold hover:bg-pink-100 flex items-center justify-center text-xs shadow-2xs"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-5 h-5 rounded-full bg-white text-pink-600 font-bold hover:bg-pink-100 flex items-center justify-center text-xs shadow-2xs disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Hapus produk ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-pink-200 bg-pink-50/40 space-y-3">
            {/* Voucher Code Form */}
            <form onSubmit={handleApplyVoucher} className="space-y-1.5">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="Kode voucher (contoh: NAZLA10)"
                  className="flex-1 px-3 py-2 text-xs bg-white border border-pink-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-pink-400 uppercase"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl text-xs font-bold border border-pink-300 transition-colors flex items-center space-x-1"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Klaim</span>
                </button>
              </div>

              {appliedVoucher && (
                <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 text-[11px] px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1 font-semibold">
                    <Check className="w-3 h-3 text-emerald-600" /> Voucher {appliedVoucher.code} aktif (-{formatIDR(appliedVoucher.discount)})
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-slate-400 hover:text-red-500 font-bold"
                  >
                    Hapus
                  </button>
                </div>
              )}

              {voucherError && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {voucherError}
                </p>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-pink-200/70 pt-2">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} produk)</span>
                <span className="font-semibold text-slate-800">{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Estimasi Ongkir</span>
                {isFreeShipping ? (
                  <span className="text-pink-600 font-bold bg-pink-100 px-1.5 py-0.5 rounded text-[10px]">
                    GRATIS 🎀
                  </span>
                ) : (
                  <span className="font-semibold text-slate-800">{formatIDR(shippingFee)}</span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Kupon</span>
                  <span>-{formatIDR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-pink-200 font-serif">
                <span>Total Bayar:</span>
                <span className="text-pink-600 text-base">{formatIDR(total)}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl font-bold text-sm shadow-md shadow-pink-300 hover:shadow-lg transition-all flex items-center justify-center space-x-2 transform active:scale-98"
            >
              <span>Lanjut ke Formulir Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
