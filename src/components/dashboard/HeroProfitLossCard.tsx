'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee } from '@/lib/calculations';
import {
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  ShieldCheck,
  Package,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export function HeroProfitLossCard() {
  const { t } = useLanguage();
  const { financialSummary, activeCrop } = useFarmStore();
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);

  const {
    totalRevenue,
    totalExpenses,
    netProfitLoss,
    isProfit,
    profitMarginPercent,
    costPerBox,
    averageSellingPricePerBox,
    directExpenses,
    totalLabourCost,
    totalCommissions,
  } = financialSummary;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-[#0b2917] text-white p-5 sm:p-6 shadow-xl border border-emerald-700/50">
      {/* Background Decorative Rings */}
      <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-emerald-600/10 pointer-events-none blur-2xl" />
      <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none blur-xl" />

      {/* Header with Crop Badge & Info Toggle */}
      <div className="flex items-center justify-between relative z-10 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-300/90 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t.netProfitLoss}
          </span>
          <span className="text-[11px] bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 px-2 py-0.5 rounded-full font-medium">
            {activeCrop?.cropName || 'Tomato'} • {activeCrop?.stage || 'Harvesting'}
          </span>
        </div>

        <button
          onClick={() => setShowCalculationInfo(!showCalculationInfo)}
          className="text-emerald-300 hover:text-white p-1 rounded-lg transition text-xs flex items-center gap-1 bg-emerald-800/50 px-2"
          title="See calculation transparency"
        >
          <Info className="w-3.5 h-3.5" />
          <span className="text-[11px]">How calculated?</span>
        </button>
      </div>

      {/* Hero P&L Big Number */}
      <div className="relative z-10 my-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
            {formatRupee(netProfitLoss)}
          </span>
          <span
            className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${
              isProfit
                ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
            }`}
          >
            {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isProfit ? t.profit : t.loss}</span>
            {profitMarginPercent !== 0 && (
              <span className="opacity-90">({profitMarginPercent > 0 ? `+${profitMarginPercent}%` : `${profitMarginPercent}%`})</span>
            )}
          </span>
        </div>
        <p className="text-[11px] text-emerald-200/80 mt-1">
          {isProfit
            ? '✅ Net profit after all labour, fertilizer, pesticides & commission expenses.'
            : '⚠️ Farm expenses currently exceed realized sales. Keep tracking upcoming sales.'}
        </p>
      </div>

      {/* Revenue vs Expenses Summary Bars */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-emerald-800/60 relative z-10">
        <div className="bg-emerald-800/40 rounded-2xl p-3 border border-emerald-700/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-semibold">{t.totalRevenue}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
            {formatRupee(totalRevenue)}
          </p>
          <span className="text-[10px] text-emerald-300/80">From crop sales</span>
        </div>

        <div className="bg-emerald-800/40 rounded-2xl p-3 border border-emerald-700/40">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-300 font-semibold">{t.totalExpenses}</span>
            <Layers className="w-3.5 h-3.5 text-rose-300" />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
            {formatRupee(totalExpenses)}
          </p>
          <span className="text-[10px] text-rose-200/80">Direct + Labour</span>
        </div>
      </div>

      {/* Unit Economics Bar (Cost/Box vs Avg Price) */}
      <div className="mt-3 bg-black/20 rounded-2xl p-2.5 border border-emerald-700/30 flex items-center justify-between text-xs relative z-10">
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-200 text-[11px]">{t.costPerBox}:</span>
          <span className="font-extrabold text-white">₹{costPerBox}</span>
        </div>
        <div className="h-3 w-px bg-emerald-700/60" />
        <div>
          <span className="text-emerald-200 text-[11px]">{t.avgSellingPrice}:</span>{' '}
          <span className="font-extrabold text-white">₹{averageSellingPricePerBox}</span>
        </div>
        <div className="h-3 w-px bg-emerald-700/60" />
        <Link
          href="/money"
          className="text-emerald-300 hover:text-white font-bold text-[11px] flex items-center gap-0.5"
        >
          <span>Ledger</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Transparent Calculation Breakdown Drawer */}
      {showCalculationInfo && (
        <div className="mt-4 p-3.5 bg-emerald-950/90 rounded-2xl border border-emerald-600/50 text-xs space-y-2 animate-in fade-in relative z-10 text-emerald-100">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Financial Formula:</span>
          </div>
          <p className="text-[11px] text-emerald-200">
            <strong>Net Profit/Loss</strong> = Total Realized Sales ({formatRupee(totalRevenue)}) −
            Total Expenses ({formatRupee(totalExpenses)}).
          </p>
          <div className="bg-black/30 p-2 rounded-xl text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>Direct Inputs (Seeds, Fertilizer, Diesel):</span>
              <span className="font-semibold">{formatRupee(directExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span>Labour & Food Costs:</span>
              <span className="font-semibold">{formatRupee(totalLabourCost)}</span>
            </div>
            {totalCommissions > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Commission Deductions:</span>
                <span>{formatRupee(totalCommissions)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
