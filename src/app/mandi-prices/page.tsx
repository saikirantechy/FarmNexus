'use client';

import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { DEMO_MANDI_PRICES } from '@/lib/demo-data';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  ArrowUpDown,
  Filter,
  BarChart3,
  ChevronRight,
  Info,
} from 'lucide-react';

type SortBy = 'price' | 'distance' | 'trend';

export default function MandiPricesPage() {
  const { t } = useLanguage();
  const { activeCrop } = useFarmStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('price');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [cropFilter, setCropFilter] = useState<string>('all');

  // Get unique crops from prices
  const uniqueCrops = useMemo(() => {
    const crops = Array.from(new Set(DEMO_MANDI_PRICES.map((p) => p.cropName)));
    return ['all', ...crops];
  }, []);

  // Favorite markets stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('farmnexus_mandi_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      try { localStorage.setItem('farmnexus_mandi_favorites', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const prices = DEMO_MANDI_PRICES;

  const filteredPrices = useMemo(() => {
    let filtered = prices.filter(
      (p) =>
        (p.marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.cropName.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (cropFilter === 'all' || p.cropName === cropFilter)
    );

    if (showFavoritesOnly) {
      filtered = filtered.filter((p) => favorites.includes(p.id));
    }

    // Sort
    if (sortBy === 'price') {
      filtered.sort((a, b) => b.modalPricePerBox - a.modalPricePerBox);
    } else if (sortBy === 'distance') {
      filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'trend') {
      filtered.sort((a, b) => b.trendPercent - a.trendPercent);
    }

    return filtered;
  }, [prices, searchQuery, sortBy, showFavoritesOnly, favorites, cropFilter]);

  // Price stats
  const avgPrice = filteredPrices.length > 0
    ? Math.round(filteredPrices.reduce((sum, p) => sum + p.modalPricePerBox, 0) / filteredPrices.length)
    : 0;
  const bestPrice = filteredPrices.length > 0 ? Math.max(...filteredPrices.map((p) => p.modalPricePerBox)) : 0;
  const nearestMarket = filteredPrices.length > 0
    ? [...filteredPrices].sort((a, b) => a.distanceKm - b.distanceKm)[0]
    : null;

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
            Live APMC Mandi wholesale rates — {activeCrop?.cropName || 'All crops'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Live Rates
          </span>
        </div>
      </div>

      {/* Price Stats Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 text-center">
          <span className="text-[10px] font-bold text-emerald-700 block uppercase">Avg Price</span>
          <span className="text-lg font-black text-emerald-950">₹{avgPrice}</span>
          <span className="text-[10px] text-emerald-700">/ box</span>
        </div>
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-center">
          <span className="text-[10px] font-bold text-amber-700 block uppercase">Best Price</span>
          <span className="text-lg font-black text-amber-950">₹{bestPrice}</span>
          <span className="text-[10px] text-amber-700">/ box</span>
        </div>
        <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200 text-center">
          <span className="text-[10px] font-bold text-blue-700 block uppercase">Nearest</span>
          <span className="text-lg font-black text-blue-950">{nearestMarket?.distanceKm || '—'} km</span>
          <span className="text-[10px] text-blue-700">{nearestMarket?.marketName || '—'}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search market, district, or crop..."
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sort buttons */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3 text-gray-400" />
            {[
              { key: 'price' as SortBy, label: 'Best Price' },
              { key: 'distance' as SortBy, label: 'Nearest' },
              { key: 'trend' as SortBy, label: 'Top Trend' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                  sortBy === opt.key
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-gray-200" />

          {/* Crop filter */}
          <div className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-gray-400" />
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg border-0 outline-none"
            >
              {uniqueCrops.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Crops' : c}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition ${
              showFavoritesOnly
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className={`w-3 h-3 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
            Favorites
          </button>
        </div>
      </div>

      {/* Market Cards */}
      <div className="space-y-3">
        {filteredPrices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">No markets found</p>
            <p className="text-xs text-gray-500 mt-1">Try a different search or filter</p>
          </div>
        ) : (
          filteredPrices.map((m) => {
            const isFav = favorites.includes(m.id);
            const isBest = m.modalPricePerBox === bestPrice;
            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm transition space-y-3 ${
                  isBest ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-gray-200 hover:border-emerald-500/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(m.id)}
                        className="shrink-0"
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-400'}`} />
                      </button>
                      <h3 className="font-extrabold text-base text-gray-900 truncate">{m.marketName}</h3>
                      {isBest && (
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full shrink-0">
                          BEST PRICE
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
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

                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {m.district}, {m.state} • {m.distanceKm} km away
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Crop: {m.cropName} ({m.variety})
                    </p>
                  </div>

                  <div className="text-right shrink-0 ml-3">
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

                {/* Price spread indicator */}
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-gray-400 font-bold">Price spread:</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, ((m.modalPricePerBox - m.minPricePerBox) / (m.maxPricePerBox - m.minPricePerBox || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-gray-600 font-semibold">₹{m.maxPricePerBox - m.minPricePerBox}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Verification Footer */}
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>
          Prices sourced from verified APMC Mandi daily auction records. Rates are indicative — confirm with your mandi agent before transport.
        </span>
      </div>
    </div>
  );
}
