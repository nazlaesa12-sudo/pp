import React, { useState } from 'react';
import { X, ShoppingBag, Star, ShieldCheck, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import { Product } from '../types';
import { RibbonBow } from './RibbonDecoration';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}: ProductDetailModalProps) {
  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  if (!product) return null;

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const handleBuy = () => {
    onBuyNow(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-pink-200 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-600 hover:text-pink-600 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Side */}
          <div className="relative aspect-square md:aspect-auto h-full bg-pink-50/60 overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-white/95 text-pink-600 px-3 py-1 rounded-full text-xs font-bold shadow-md border border-pink-200 flex items-center space-x-1.5">
                <RibbonBow className="w-4 h-4 text-pink-500" />
                <span>{product.badge}</span>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-lg font-medium">
              Netto: {product.volume}
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({product.soldCount} terjual)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-slate-900 leading-snug font-serif">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline space-x-2.5 bg-pink-50/60 p-3 rounded-2xl border border-pink-100">
                <span className="text-2xl font-extrabold text-pink-600 font-serif">
                  {formatIDR(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatIDR(product.originalPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Hemat {discountPercent}%
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center text-xs">
                {product.stock > 0 ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Tersedia {product.stock} pcs di gudang
                  </span>
                ) : (
                  <span className="text-red-600 bg-red-50 px-2.5 py-1 rounded-full font-bold border border-red-200">
                    Stok Kosong
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Deskripsi Formula 🎀
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Benefits */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Manfaat Utama:
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {product.benefits.map((b, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-xs text-pink-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How To Use */}
              {product.howToUse && (
                <div className="bg-pink-50/50 p-3 rounded-xl border border-pink-100 text-xs text-slate-700">
                  <span className="font-bold text-pink-700 block mb-1">Cara Pemakaian:</span>
                  {product.howToUse}
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && (
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Kandungan Utama: </span>
                  {product.ingredients}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-pink-100 space-y-3">
              {product.stock > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Jumlah Beli:</span>
                    <div className="flex items-center space-x-2 border border-pink-200 rounded-full px-2 py-1 bg-pink-50/50">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        className="w-6 h-6 rounded-full bg-white text-pink-600 font-bold hover:bg-pink-100 flex items-center justify-center disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-800">{qty}</span>
                      <button
                        onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                        disabled={qty >= product.stock}
                        className="w-6 h-6 rounded-full bg-white text-pink-600 font-bold hover:bg-pink-100 flex items-center justify-center disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleAdd}
                      className={`w-full py-2.5 px-3 rounded-full text-xs font-bold border border-pink-400 transition-all flex items-center justify-center space-x-1.5 ${
                        addedAnimation
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{addedAnimation ? 'Dimasukkan!' : '+ Keranjang'}</span>
                    </button>

                    <button
                      onClick={handleBuy}
                      className="w-full py-2.5 px-3 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-200 flex items-center justify-center space-x-1.5 transition-all transform active:scale-95"
                    >
                      <RibbonBow className="w-3.5 h-3.5 text-pink-100" />
                      <span>Beli Langsung</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-2 text-xs font-bold text-red-500 bg-red-50 rounded-xl">
                  Produk ini sedang habis stok. Silakan cek produk lainnya 🎀
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
