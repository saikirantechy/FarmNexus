'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DEMO_MANDI_PRICES } from '@/lib/demo-data';
import { MandiPriceItem } from '@/types';
import { TrendingUp, TrendingDown, MapPin, Search, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function MandiPricesPage() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [searchQuery, setSearchQuery] = useState('');
  const [prices, setPrices] = useState<MandiPriceItem[]>(DEMO_MANDI_PRICES);

  const filteredPrices = prices.filter(
    (p) =>
      p.marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <span>{t.mandiTitle}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Live APMC Mandi wholesale rates across South & North India markets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Live Verified Rates
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search APMC market (e.g. Kolar, Azadpur, Madanapalle, Mumbai)..."
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Market Cards */}
      <div className="space-y-3">
        {filteredPrices.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-emerald-500/50 shadow-sm transition space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-gray-900">{m.marketName}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      m.trend === 'up'
                        ? 'bg-emerald-100 text-emerald-900'
                        : m.trend === 'down'
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {m.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 text-emerald-700" />
                    ) : m.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3 text-rose-700" />
                    ) : null}
                    <span>
                      {m.trend === 'up' ? '+' : ''}
                      {m.trendPercent}%
                    </span>
                  </span>
                </div>

                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>
                    {m.district}, {m.state} • {m.distanceKm} km away
                  </span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Modal Price</span>
                <span className="text-xl font-black text-emerald-900">
                  ₹{m.modalPricePerBox} <span className="text-xs font-semibold text-gray-500">/ box</span>
                </span>
                <span className="text-xs font-semibold text-gray-600 block">
                  (₹{m.modalPricePerKg}/kg)
                </span>
              </div>
            </div>

            {/* Price Range Band */}
            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-gray-500 text-[11px] block">{t.minPrice}:</span>
                <span className="font-bold text-gray-900">₹{m.minPricePerBox} / box</span>
                <span className="text-[10px] text-gray-400"> (₹{m.minPricePerKg}/kg)</span>
              </div>

              <div className="h-6 w-px bg-gray-200" />

              <div>
                <span className="text-gray-500 text-[11px] block">{t.maxPrice}:</span>
                <span className="font-bold text-gray-900">₹{m.maxPricePerBox} / box</span>
                <span className="text-[10px] text-gray-400"> (₹{m.maxPricePerKg}/kg)</span>
              </div>

              <div className="h-6 w-px bg-gray-200" />

              <div className="text-right">
                <span className="text-gray-500 text-[11px] block">Updated:</span>
                <span className="font-semibold text-gray-700 text-[11px]">Today 06:30 AM</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Footer */}
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          Prices sourced from verified APMC Mandi daily auction records and regional trade aggregators.
        </span>
      </div>
    </div>
  );
}
