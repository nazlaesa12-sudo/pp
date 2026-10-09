import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, Sparkles, Check } from 'lucide-react';
import { RibbonBow } from '../RibbonDecoration';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verification check: accept official store admin credentials or demo
    if (
      (email.trim().toLowerCase() === 'admin@nazlaskinmart.com' && password === 'nazla123') ||
      (email.trim().toLowerCase() === 'merahputh65@gmail.com' && password === 'admin123') ||
      (email.trim().length > 3 && password.length >= 4)
    ) {
      onLoginSuccess(email.trim());
      onClose();
    } else {
      setError('Password minimal 4 karakter atau gunakan tombol Akun Demo di bawah.');
    }
  };

  const handleUseDemoAccount = () => {
    setEmail('admin@nazlaskinmart.com');
    setPassword('nazla123');
    setError('');
    setTimeout(() => {
      onLoginSuccess('admin@nazlaskinmart.com');
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-pink-200 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs mx-auto flex items-center justify-center border-2 border-white/40 mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-xl font-bold font-serif">Admin Nazla Skinmart</h3>
          <p className="text-xs text-pink-100 mt-1">
            Masuk untuk mengelola produk, stok, pesanan, bukti bayar & laporan sales 🎀
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Administrator:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nazlaskinmart.com"
                className="w-full px-3.5 py-2.5 bg-pink-50/50 border border-pink-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi (Password):</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-pink-50/50 border border-pink-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-bold text-xs shadow-md shadow-pink-200 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Masuk ke Panel Admin</span>
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-pink-100">
            <button
              type="button"
              onClick={handleUseDemoAccount}
              className="w-full py-2.5 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl border border-pink-200 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Gunakan Akun Demo Admin (1-Klik Cepat)</span>
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              Default demo: <code className="text-pink-600">admin@nazlaskinmart.com</code> / <code className="text-pink-600">nazla123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
