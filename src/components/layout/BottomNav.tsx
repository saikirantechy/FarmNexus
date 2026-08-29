'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  BarChart3,
  Bot,
  Calculator,
  CloudSun,
  Menu,
  Package,
  Plus,
  Settings,
  Sprout,
  Warehouse,
  CalendarDays,
  IndianRupee,
  Home,
  TrendingUp,
  PencilRuler,
  Phone,
} from 'lucide-react';
import { QuickAddModal } from './QuickAddModal';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: t.navHome, icon: Home },
    { href: '/farm', label: t.navFarm, icon: Sprout },
    { href: '/harvest', label: t.navHarvest, icon: Package },
    { href: '/money', label: t.navMoney, icon: IndianRupee },
    { href: '#menu', label: 'More', icon: Menu },
  ];

  const menuGroups = [
    {
      title: 'Farm operations',
      items: [
        { href: '/inventory', label: 'Input Inventory', description: 'Stock & suppliers', icon: Warehouse, color: 'text-amber-700 bg-amber-50' },
        { href: '/tasks', label: 'Task Calendar', description: 'Work & reminders', icon: CalendarDays, color: 'text-sky-700 bg-sky-50' },
        { href: '/calculator', label: 'Farm Calculator', description: 'Profit in seconds', icon: Calculator, color: 'text-emerald-700 bg-emerald-50' },
      ],
    },
    {
      title: 'Insights',
      items: [
        { href: '/weather', label: 'Weather', description: 'Forecast & alerts', icon: CloudSun, color: 'text-blue-700 bg-blue-50' },
        { href: '/mandi-prices', label: 'Mandi Prices', description: 'Market rates', icon: TrendingUp, color: 'text-violet-700 bg-violet-50' },
        { href: '/reports', label: 'Reports', description: 'Farm performance', icon: BarChart3, color: 'text-rose-700 bg-rose-50' },
      ],
    },
    {
      title: 'Help & account',
      items: [
        { href: '/farm-bot', label: 'Farm Mitra', description: 'Speak to your helper', icon: Bot, color: 'text-emerald-700 bg-emerald-50' },
        { href: '/call-agent', label: 'Call Farm Mitra', description: 'Live voice screen', icon: Phone, color: 'text-green-700 bg-green-50' },
        { href: '/ai-assistant', label: 'AI Assistant', description: 'Voice & Crop Doctor', icon: Bot, color: 'text-teal-700 bg-teal-50' },
        { href: '/whiteboard', label: 'Whiteboard', description: 'Draw & explain', icon: PencilRuler, color: 'text-orange-700 bg-orange-50' },
        { href: '/settings', label: 'Settings', description: 'Profile & language', icon: Settings, color: 'text-gray-700 bg-gray-100' },
      ],
    },
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
            const isMenu = item.href === '#menu';
            const isActive = isMenu
              ? !['/dashboard', '/farm', '/harvest', '/money'].includes(pathname)
              : pathname === item.href;
            if (isMenu) {
              return (
                <button
                  key={item.href}
                  onClick={() => setMenuOpen(true)}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                    isActive ? 'text-emerald-700 font-bold scale-105' : 'text-gray-500 hover:text-gray-800 font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                </button>
              );
            }
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

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button className="absolute inset-0" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <section className="relative w-full sm:max-w-xl bg-[#f7faf8] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl border border-white overflow-hidden max-h-[88vh] overflow-y-auto">
            <header className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-5 flex items-center justify-between">
              <div><p className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.16em]">FarmNexus Pro</p><h2 className="text-xl font-black mt-0.5">Your farm workspace</h2><p className="text-xs text-emerald-100 mt-1">Everything you need, organised clearly.</p></div>
              <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-xl">×</button>
            </header>
            <div className="p-4 space-y-5">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 px-1">{group.title}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="group bg-white hover:border-emerald-300 border border-gray-200 rounded-2xl p-3 transition shadow-sm hover:shadow-md flex sm:flex-col items-center sm:items-start gap-3"><span className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}><Icon className="w-5 h-5" /></span><span><span className="block text-xs font-black text-gray-900 group-hover:text-emerald-800">{item.label}</span><span className="block text-[10px] text-gray-500 mt-0.5">{item.description}</span></span></Link>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Quick Add Bottom Sheet Modal */}
      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
