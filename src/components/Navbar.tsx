import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { RibbonBow } from './RibbonDecoration';
import { ProductCategory } from '../types';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenOrderTracker: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  isAdminLoggedIn: boolean;
}

export const CATEGORIES: { label: string; value: string }[] = [
  { label: 'Semua Produk (12)', value: 'ALL' },
  { label: 'Pembersih & Toner', value: 'Pembersih & Toner' },
  { label: 'Serum & Treatment', value: 'Serum & Treatment' },
  { label: 'Moisturizer & Sunscreen', value: 'Moisturizer & Sunscreen' },
];

export function Navbar({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
  onOpenOrderTracker,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  isAdminLoggedIn,
}: NavbarProps) {
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-200/80 shadow-xs">
      {/* Top Cute Notice Bar */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center space-x-2 tracking-wide">
        <RibbonBow className="w-3.5 h-3.5 text-pink-100" />
        <span>PROMO SPESIAL: Diskon Kilat hingga 30% + Gratis Ongkir Min. Belanja Rp 150rb 🎀</span>
        <RibbonBow className="w-3.5 h-3.5 text-pink-100 scale-x-[-1]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Ribbon */}
          <div
            onClick={() => onSelectCategory('ALL')}
            className="flex items-center space-x-3 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-md shadow-pink-300/40 group-hover:scale-105 transition-transform duration-200 border-2 border-white">
                <RibbonBow className="w-8 h-8 text-white drop-shadow-xs" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-pink-600 via-rose-500 to-pink-700 bg-clip-text text-transparent font-serif">
                  Nazla Skinmart
                </h1>
                <span className="text-base text-pink-500">🎀</span>
              </div>
              <p className="text-[11px] font-medium text-pink-700/80 tracking-widest uppercase">
                Glow & Coquette Skincare
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari serum mawar, toner oat, sunscreen..."
                className="w-full pl-10 pr-4 py-2.5 bg-pink-50/60 border border-pink-200 rounded-full text-sm text-slate-800 placeholder-pink-400/80 focus:outline-hidden focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-xs text-pink-400 hover:text-pink-600 px-1.5 py-0.5 rounded-full"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Lacak Pesanan Button */}
            <button
              onClick={onOpenOrderTracker}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-full transition-colors shadow-2xs"
              title="Lacak status pesanan dan upload bukti bayar"
            >
              <Truck className="w-3.5 h-3.5 text-pink-500" />
              <span>Cek Pesanan</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-full border transition-all duration-200 shadow-2xs ${
                isAdminLoggedIn
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-200'
                  : 'bg-white hover:bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-300'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdminLoggedIn ? 'text-white' : 'text-pink-500'}`} />
              <span>{isAdminLoggedIn ? 'Panel Admin (Aktif)' : 'Admin'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2.5 rounded-full shadow-md shadow-pink-300/50 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-white text-pink-600 font-extrabold text-[11px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-pink-500 shadow-xs animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">
                {cartTotal > 0 ? formatIDR(cartTotal) : 'Keranjang'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari skincare kesukaanmu..."
              className="w-full pl-9 pr-4 py-2 bg-pink-50/60 border border-pink-200 rounded-full text-xs text-slate-800 placeholder-pink-400/80 focus:outline-hidden focus:ring-2 focus:ring-pink-400 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Category Pill Navigation */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none border-t border-pink-100">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-300'
                    : 'bg-pink-50/80 text-pink-700 hover:bg-pink-100/80 border border-pink-200/60'
                }`}
              >
                {isSelected && <RibbonBow className="w-3 h-3 text-pink-100 inline" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
