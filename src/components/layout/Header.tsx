'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage, LANGUAGE_OPTIONS } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import {
  Globe,
  CloudSun,
  Bell,
  Sparkles,
  WifiOff,
  RefreshCw,
  ChevronDown,
  Sprout,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { activeFarm, activeCrop, isOffline, resetToDemoData, notifications } = useFarmStore();
  const pathname = usePathname();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md">
      {/* Top Banner for Offline */}
      {isOffline && (
        <div className="bg-amber-600 px-4 py-1 text-center text-xs font-semibold text-white flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode: Changes saved locally and will sync when internet returns.</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Farm Name */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <span className="text-xl">🌱</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-emerald-50">
                {t.appName}
              </span>
              <span className="text-[10px] bg-emerald-700/90 text-emerald-200 px-1.5 py-0.5 rounded font-medium">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/90 leading-tight font-medium">
              {activeFarm?.name || 'My Farm'} • {activeCrop?.cropName || 'Tomato'} 🍅
            </p>
          </div>
        </Link>

        {/* Right Actions: Weather Pill, Language Switcher, Demo Reset */}
        <div className="flex items-center gap-2">
          {/* Weather Shortcut */}
          <Link
            href="/weather"
            className="hidden sm:flex items-center gap-1 text-xs bg-emerald-800/80 hover:bg-emerald-700/80 px-2.5 py-1.5 rounded-full border border-emerald-700 transition"
          >
            <CloudSun className="w-4 h-4 text-amber-300" />
            <span className="font-medium text-emerald-100">28°C</span>
          </Link>

          {/* Mandi Shortcut */}
          <Link
            href="/mandi-prices"
            className="hidden md:flex items-center gap-1 text-xs bg-emerald-800/80 hover:bg-emerald-700/80 px-2.5 py-1.5 rounded-full border border-emerald-700 transition"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
            <span className="font-medium text-emerald-100">{t.navMandi}</span>
          </Link>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 text-xs font-semibold bg-emerald-800/90 hover:bg-emerald-700 border border-emerald-600/70 px-2.5 py-1.5 rounded-lg transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {LANGUAGE_OPTIONS.find((l) => l.code === language)?.native || 'English'}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-44 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setLangMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Language
                </div>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => setLanguage(opt.code)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 transition ${
                      language === opt.code
                        ? 'bg-emerald-100/60 font-bold text-emerald-900'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{opt.native}</span>
                    <span className="text-[11px] text-gray-400">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="p-1.5 text-emerald-300 hover:text-white bg-emerald-800/80 hover:bg-emerald-700 rounded-lg transition border border-emerald-700"
            title="Reset to Tomato Demo Data (1,542 Boxes)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Demo Reset Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <Sprout className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900">Load Tomato Demo Farm?</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              This will populate real demonstration data for a 2-acre tomato farm with{' '}
              <strong>1,542 harvest boxes</strong>, <strong>166 labour entries</strong>,{' '}
              <strong>₹34,560 upcoming sales</strong>, and a calculated profit balance.
            </p>
            <div className="mt-4 flex gap-2.5">
              <button
                onClick={() => {
                  resetToDemoData();
                  setResetConfirmOpen(false);
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
              >
                Load Demo Data
              </button>
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
