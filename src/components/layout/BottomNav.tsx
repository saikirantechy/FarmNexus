'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Home, Sprout, Package, IndianRupee, Bot, Plus } from 'lucide-react';
import { QuickAddModal } from './QuickAddModal';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: t.navHome, icon: Home },
    { href: '/farm', label: t.navFarm, icon: Sprout },
    { href: '/harvest', label: t.navHarvest, icon: Package },
    { href: '/money', label: t.navMoney, icon: IndianRupee },
    { href: '/farm-bot', label: 'Farm Mitra', icon: Bot },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe">
        <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around relative">
          {/* First 2 nav items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-700 font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          {/* Center Floating ＋ Add Button */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              onClick={() => setQuickAddOpen(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white p-3.5 shadow-lg shadow-emerald-700/30 border-4 border-white active:scale-95 transition-transform flex items-center justify-center"
              aria-label="Quick Add Record"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
            <span className="text-[10px] font-bold text-emerald-800 -mt-1">{t.quickAdd}</span>
          </div>

          {/* Last 3 nav items */}
          {navItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-700 font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-800 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick Add Bottom Sheet Modal */}
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
