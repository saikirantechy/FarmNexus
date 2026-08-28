'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee } from '@/lib/calculations';
import { HeroProfitLossCard } from '@/components/dashboard/HeroProfitLossCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentHarvestTable } from '@/components/dashboard/RecentHarvestTable';
import { UpcomingSalesCard } from '@/components/dashboard/UpcomingSalesCard';
import { VoiceTransactionRecorder } from '@/components/ai/VoiceTransactionRecorder';
import { CropDoctorModal } from '@/components/ai/CropDoctorModal';
import { QuickAddModal } from '@/components/layout/QuickAddModal';
import {
  Package,
  Users,
  BadgeIndianRupee,
  Receipt,
  Leaf,
  TrendingUp,
  CloudSun,
  FileText,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { DEMO_WEATHER } from '@/lib/demo-data';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user, activeFarm, activeCrop, financialSummary } = useFarmStore();

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'harvest' | 'expense' | 'labour' | 'sale'>('harvest');
  const [cropDoctorOpen, setCropDoctorOpen] = useState(false);

  const openAdd = (tab: 'harvest' | 'expense' | 'labour' | 'sale') => {
    setQuickAddTab(tab);
    setQuickAddOpen(true);
  };

  const weatherAlert = DEMO_WEATHER.agriculturalAlerts[0];

  return (
    <div className="space-y-4">
      {/* Top Greeting & Active Farm Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-2xl p-3.5 border border-gray-200/70 shadow-sm">
        <div>
          <h1 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
            <span>{t.greetingMorning}, {user.name}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {activeFarm?.name} • Field 1 ({activeFarm?.fields[0]?.areaAcres || 2} Acres) •{' '}
            <span className="text-emerald-700 font-bold">🍅 {activeCrop?.cropName || 'Tomato'}</span>
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCropDoctorOpen(true)}
            className="flex-1 sm:flex-initial text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Crop Doctor</span>
          </button>

          <Link
            href="/reports"
            className="flex-1 sm:flex-initial text-xs font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <FileText className="w-3.5 h-3.5 text-gray-500" />
            <span>{t.navReports}</span>
          </Link>
        </div>
      </div>

      {/* Weather Agronomic Alert Banner if active */}
      {weatherAlert && (
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold text-amber-900">{weatherAlert.title}: </span>
            <span>{weatherAlert.message}</span>
          </div>
          <Link href="/weather" className="text-amber-800 font-bold underline shrink-0">
            Details
          </Link>
        </div>
      )}

      {/* Hero Profit / Loss Card */}
      <HeroProfitLossCard />

      {/* Secondary Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title={t.totalHarvest}
          value={`${financialSummary.totalHarvestBoxes} ${t.boxes}`}
          subtitle={`${financialSummary.totalHarvestKg.toLocaleString('en-IN')} kg picked`}
          icon={Package}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-800"
          href="/harvest"
        />

        <StatCard
          title={t.totalLabour}
          value={`${financialSummary.totalLabourWorkersCount} ${t.workers}`}
          subtitle={`${formatRupee(financialSummary.totalLabourCost)} total wage`}
          icon={Users}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-800"
          href="/money"
        />

        <StatCard
          title={t.receivables}
          value={formatRupee(financialSummary.totalReceivables)}
          subtitle="4 buyer payments due"
          icon={BadgeIndianRupee}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-800"
          badge="Due"
          badgeColor="bg-blue-100 text-blue-900"
          href="/harvest"
        />

        <StatCard
          title="Direct Expenses"
          value={formatRupee(financialSummary.directExpenses)}
          subtitle="Seeds, Fert, Diesel"
          icon={Receipt}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-800"
          href="/money"
        />
      </div>

      {/* AI Voice & Natural Language Record Assistant */}
      <VoiceTransactionRecorder />

      {/* Upcoming Sales / Receivables Section */}
      <UpcomingSalesCard onOpenAddSale={() => openAdd('sale')} />

      {/* Recent Harvest Ledger */}
      <RecentHarvestTable onOpenAdd={() => openAdd('harvest')} limit={6} />

      {/* Mandi & Weather Quick Link Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/mandi-prices"
          className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Kolar Mandi: ₹330 / box</h4>
              <p className="text-xs text-emerald-700 font-semibold">▲ +8.2% price trend today</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/weather"
          className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between transition group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <CloudSun className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Kolar: 28°C (65% Rain)</h4>
              <p className="text-xs text-amber-700 font-semibold">Showers expected tomorrow</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Crop Doctor Modal */}
      <CropDoctorModal isOpen={cropDoctorOpen} onClose={() => setCropDoctorOpen(false)} />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultTab={quickAddTab}
      />
    </div>
  );
}
