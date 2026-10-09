import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Truck, Tag, ArrowDown } from 'lucide-react';
import { RibbonBow, CornerRibbon } from './RibbonDecoration';

interface HeroBannerProps {
  onExploreClick: () => void;
}

export function HeroBanner({ onExploreClick }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden my-6 rounded-3xl mx-4 sm:mx-6 lg:mx-8 bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 text-white shadow-xl shadow-pink-200/60 border-2 border-pink-200/50">
      {/* Decorative Corner Ribbon */}
      <CornerRibbon text="GLOW 🎀 PINK" />

      {/* Ribbon and Bows Floating Background Elements */}
      <div className="absolute top-2 left-6 opacity-20 pointer-events-none">
        <RibbonBow className="w-24 h-24 text-white" />
      </div>
      <div className="absolute -bottom-6 right-16 opacity-20 pointer-events-none">
        <RibbonBow className="w-36 h-36 text-white scale-x-[-1]" />
      </div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none transform -translate-y-1/2"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 sm:py-14 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left space-y-4 max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/40 text-xs font-bold tracking-wide">
            <RibbonBow className="w-3.5 h-3.5 text-pink-100" />
            <span>Koleksi Skincare Coquette Terlengkap</span>
            <Sparkles className="w-3 h-3 text-yellow-200" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-serif drop-shadow-xs">
            Wajah Glowing & Bersinar Setiap Hari 🎀
          </h2>

          <p className="text-pink-100 text-sm sm:text-base leading-relaxed max-w-lg">
            Temukan 12 formula skincare pilihan terbaik di <strong className="text-white underline decoration-pink-300">Nazla Skinmart</strong>. Formula lembut, mencerahkan bintik kusam, menguatkan skin barrier, dan merawat kulit agar tampak sehat merona!
          </p>

          {/* Promo Coupon Pill */}
          <div className="inline-flex items-center space-x-2 bg-white text-pink-700 px-4 py-2 rounded-2xl shadow-md text-xs font-semibold border-2 border-dashed border-pink-300">
            <Tag className="w-4 h-4 text-pink-500" />
            <span>KODE KUPON: <strong className="font-extrabold text-pink-600 tracking-wider">NAZLA10</strong> (Diskon 10%)</span>
          </div>

          {/* CTA & Scroll */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-white text-pink-600 hover:bg-pink-50 rounded-full font-bold text-sm shadow-lg shadow-pink-900/10 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center space-x-2 group"
            >
              <span>Belanja Sekarang</span>
              <RibbonBow className="w-4 h-4 text-pink-500 group-hover:rotate-12 transition-transform" />
            </button>

            <span className="text-xs text-pink-100 flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" /> 100% Produk Asli & Terdaftar
            </span>
          </div>
        </div>

        {/* Right Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3 w-full md:w-72">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/30 flex items-center space-x-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Gratis Ongkir</p>
              <p className="text-[11px] text-pink-100">Min. belanja 150rb se-Indonesia</p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/30 flex items-center space-x-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">100% Original</p>
              <p className="text-[11px] text-pink-100">Bahan klinis aman & teruji</p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/30 flex items-center space-x-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Approval Cepat</p>
              <p className="text-[11px] text-pink-100">Verifikasi bukti bayar kilat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
