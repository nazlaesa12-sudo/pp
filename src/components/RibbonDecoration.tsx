import React from 'react';

// Cute Pink Coquette Bow SVG
export function RibbonBow({ className = 'w-6 h-6 text-pink-500' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Loop */}
      <path
        d="M45 35 C35 15, 10 12, 8 28 C6 44, 30 46, 45 40 Z"
        className="opacity-95"
      />
      <path
        d="M42 36 C32 24, 16 22, 14 30 C12 38, 28 41, 40 38 Z"
        fill="white"
        fillOpacity="0.25"
      />
      {/* Right Loop */}
      <path
        d="M55 35 C65 15, 90 12, 92 28 C94 44, 70 46, 55 40 Z"
        className="opacity-95"
      />
      <path
        d="M58 36 C68 24, 84 22, 86 30 C88 38, 72 41, 60 38 Z"
        fill="white"
        fillOpacity="0.25"
      />
      {/* Left Tail */}
      <path
        d="M44 42 C38 52, 28 65, 20 75 C25 72, 33 67, 36 72 C42 63, 46 52, 48 44 Z"
      />
      {/* Right Tail */}
      <path
        d="M56 42 C62 52, 72 65, 80 75 C75 72, 67 67, 64 72 C58 63, 54 52, 52 44 Z"
      />
      {/* Center Knot */}
      <ellipse cx="50" cy="38" rx="7" ry="8" />
      <ellipse cx="48" cy="36" rx="4" ry="4" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

// Corner Ribbon for Cards & Banners
export function CornerRibbon({ text = 'Spesial 🎀' }: { text?: string }) {
  return (
    <div className="absolute top-0 right-0 overflow-hidden w-28 h-28 pointer-events-none z-10">
      <div className="absolute top-4 -right-8 w-36 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-[11px] font-bold py-1 text-center transform rotate-45 shadow-md border-y border-pink-200/40 tracking-wider">
        {text}
      </div>
    </div>
  );
}

// Ribbon Divider with Bow in Center
export function RibbonDivider({ text }: { text?: string }) {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="flex-grow border-t-2 border-dashed border-pink-200"></div>
      <div className="mx-4 flex items-center space-x-2 bg-pink-50 px-4 py-1.5 rounded-full border border-pink-200 shadow-xs">
        <RibbonBow className="w-5 h-5 text-pink-500" />
        {text && <span className="text-xs font-bold text-pink-600 tracking-wide">{text}</span>}
        <RibbonBow className="w-5 h-5 text-pink-500 scale-x-[-1]" />
      </div>
      <div className="flex-grow border-t-2 border-dashed border-pink-200"></div>
    </div>
  );
}

// Floating Bow Garland background motif
export function BowGarland() {
  return (
    <div className="flex items-center justify-center space-x-4 py-1 opacity-70">
      <span className="text-pink-300">✧</span>
      <RibbonBow className="w-4 h-4 text-pink-400" />
      <span className="w-8 border-t border-pink-200 border-dashed"></span>
      <span className="text-pink-400 font-serif text-xs italic">Nazla Boutique</span>
      <span className="w-8 border-t border-pink-200 border-dashed"></span>
      <RibbonBow className="w-4 h-4 text-pink-400" />
      <span className="text-pink-300">✧</span>
    </div>
  );
}
