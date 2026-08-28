'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ShieldCheck,
  Users,
  Sprout,
  Package,
  TrendingUp,
} from 'lucide-react';

export default function AdminPage() {
  useLanguage();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl font-black text-gray-900">FPO & Organization Admin</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Aggregated metrics for Farmer Producer Organizations (FPOs), clusters & agriculture officers
          </p>
        </div>

        <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-300">
          Role: FPO Administrator
        </span>
      </div>

      {/* Aggregate Cluster KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Registered Farmers</span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">1,240</div>
          <span className="text-[10px] text-emerald-700 font-bold">+18 this week</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Active Acreage</span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">3,480 Ac</div>
          <span className="text-[10px] text-gray-500 font-medium">Tomato, Onion, Chilli</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <Package className="w-4 h-4 text-amber-600" />
            <span>Aggregated Harvest</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">4.8M Boxes</div>
          <span className="text-[10px] text-gray-500 font-medium">Season total</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Platform GMV</span>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2">₹14.2 Cr</div>
          <span className="text-[10px] text-blue-700 font-bold">Total crop trade</span>
        </div>
      </div>

      {/* Cluster Crop Breakdown */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-900">Cluster Crop Portfolio (Kolar & Chittoor Region)</h3>
        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between font-bold text-gray-800 mb-1">
              <span>🍅 Tomato (Hybrid US 440 / Shivam)</span>
              <span>1,850 Acres (53%)</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full w-[53%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-gray-800 mb-1">
              <span>🧅 Onion (Nashik Red / Bhima Super)</span>
              <span>820 Acres (24%)</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full w-[24%]" />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-gray-800 mb-1">
              <span>🌶️ Chilli (Guntur Teja / US 341)</span>
              <span>510 Acres (15%)</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full w-[15%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Security & Data Privacy Notice */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1">
        <span className="font-extrabold text-gray-900 block">Farmer Data Privacy Safeguards:</span>
        <p>
          Individual farmer financial books are encrypted and strictly partitioned. FPO / Admin views only display anonymized cluster-level aggregated yields, market supply trends, and regional crop health indicators.
        </p>
      </div>
    </div>
  );
}
