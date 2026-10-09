import React from 'react';
import { Heart, ShieldCheck, Truck, Headphones, Instagram, Sparkles } from 'lucide-react';
import { RibbonBow, RibbonDivider } from './RibbonDecoration';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenOrderTracker: () => void;
}

export function Footer({ onOpenAdmin, onOpenOrderTracker }: FooterProps) {
  return (
    <footer className="mt-16 bg-white border-t-2 border-pink-100 text-slate-700 text-xs">
      {/* Decorative Ribbon Garland */}
      <div className="bg-pink-50/60 py-3 border-b border-pink-100/70">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-3 text-pink-600 font-medium">
          <RibbonBow className="w-4 h-4 text-pink-500" />
          <span className="font-serif italic text-sm">
            “Kecantikan alami terpancar dari kulit sehat yang dirawat dengan cinta”
          </span>
          <RibbonBow className="w-4 h-4 text-pink-500 scale-x-[-1]" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white shadow-xs">
                <RibbonBow className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-serif text-pink-600">Nazla Skinmart</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toko online skincare terpercaya dengan koleksi 12 formula esensial pilihan terbaik untuk merawat semua jenis kulit wanita Indonesia.
            </p>
            <div className="pt-1 flex items-center space-x-2 text-pink-600 font-semibold">
              <Instagram className="w-4 h-4" />
              <span>@nazlaskinmart.id</span>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>Layanan Pelanggan</span>
              <RibbonBow className="w-3.5 h-3.5 text-pink-400" />
            </h4>
            <ul className="space-y-2 text-slate-500">
              <li>
                <button
                  onClick={onOpenOrderTracker}
                  className="hover:text-pink-600 transition-colors text-left font-medium"
                >
                  Lacak Status Pesanan 🎀
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Nazla%20Skinmart%20saya%20ingin%20konsultasi%20skincare"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-pink-600 transition-colors"
                >
                  Konsultasi Skincare Gratis (WA)
                </a>
              </li>
              <li>
                <span className="text-slate-400">Pengiriman: JNE, J&T, SiCepat, AnterAja</span>
              </li>
              <li>
                <span className="text-slate-400">Operasional: Senin - Minggu (08:00 - 21:00)</span>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>Metode Pembayaran</span>
              <RibbonBow className="w-3.5 h-3.5 text-pink-400" />
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="p-2 bg-pink-50/50 rounded-lg border border-pink-100 text-center font-bold">
                BCA
              </div>
              <div className="p-2 bg-pink-50/50 rounded-lg border border-pink-100 text-center font-bold">
                Mandiri
              </div>
              <div className="p-2 bg-pink-50/50 rounded-lg border border-pink-100 text-center font-bold">
                BRI
              </div>
              <div className="p-2 bg-pink-50/50 rounded-lg border border-pink-100 text-center font-bold">
                QRIS All Bank
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              Sistem verifikasi bukti pembayaran manual & otomatis langsung oleh admin.
            </p>
          </div>

          {/* Internal Access */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>Akses Toko & Pengelola</span>
              <RibbonBow className="w-3.5 h-3.5 text-pink-400" />
            </h4>
            <p className="text-slate-500 text-xs">
              Portal administrasi untuk update katalog produk, stok realtime, approval bukti pembayaran, dan laporan omset.
            </p>
            <button
              onClick={onOpenAdmin}
              className="mt-2 inline-flex items-center space-x-1.5 px-3.5 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-300 rounded-xl font-bold text-xs transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
              <span>Login Panel Admin Toko</span>
            </button>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <p>© {new Date().getFullYear()} Nazla Skinmart Official. All rights reserved.</p>
          <p className="flex items-center gap-1 text-pink-600 font-semibold">
            Dibuat dengan cinta & keindahan <Sparkles className="w-3 h-3 text-pink-500" /> 🎀
          </p>
        </div>
      </div>
    </footer>
  );
}
