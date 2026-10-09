import React from 'react';
import { ShoppingBag, Star, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { RibbonBow } from './RibbonDecoration';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onViewDetail }: ProductCardProps) {
  const [isAdded, setIsAdded] = React.useState(false);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div
      onClick={() => onViewDetail(product)}
      className="group relative bg-white rounded-3xl border border-pink-100/90 shadow-md hover:shadow-xl hover:shadow-pink-200/50 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-pink-50/50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ribbon Bow Badge in Top-Left */}
        {product.badge && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-pink-600 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide shadow-sm border border-pink-200 flex items-center space-x-1.5">
            <RibbonBow className="w-3.5 h-3.5 text-pink-500" />
            <span>{product.badge}</span>
          </div>
        )}

        {/* Discount Badge in Top-Right */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Volume Pill in Bottom-Left */}
        <div className="absolute bottom-2.5 left-3 bg-black/40 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-medium">
          {product.volume}
        </div>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-pink-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-pink-600 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" /> Lihat Detail
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal text-[11px]">
                ({product.soldCount} terjual)
              </span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>

          {/* Short Benefits Tags */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.benefits.slice(0, 2).map((b, idx) => (
                <span
                  key={idx}
                  className="text-[10px] text-pink-700/80 bg-pink-50/90 px-1.5 py-0.5 rounded text-left font-medium"
                >
                  ✓ {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing, Stock & Add to Cart Action */}
        <div className="pt-2 border-t border-pink-100/70">
          <div className="flex items-baseline space-x-2">
            <span className="text-base sm:text-lg font-extrabold text-pink-600 font-serif">
              {formatIDR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {formatIDR(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Indicator & Button */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="text-[11px]">
              {product.stock > 10 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Stok: {product.stock}
                </span>
              ) : product.stock > 0 ? (
                <span className="text-amber-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Sisa {product.stock} pcs!
                </span>
              ) : (
                <span className="text-red-500 font-bold">Stok Habis</span>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 shadow-xs ${
                product.stock <= 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-500 text-white scale-105'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white active:scale-95 shadow-pink-200'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Masuk!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Keranjang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
