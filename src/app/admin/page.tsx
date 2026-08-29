'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ShieldCheck,
  Users,
  Sprout,
  Package,
  TrendingUp,
  MapPin,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Award,
  AlertTriangle,
  Phone,
  Mail,
} from 'lucide-react';

const DEMO_FARMERS = [
  { id: '1', name: 'Ramesh Patel', village: 'Vemagal', district: 'Kolar', state: 'Karnataka', crops: ['Tomato', 'Onion'], acreage: 4.5, totalHarvest: 1240, status: 'active', phone: '9876543210' },
  { id: '2', name: 'Suresh Kumar', village: 'Bangarpet', district: 'Kolar', state: 'Karnataka', crops: ['Tomato'], acreage: 3.0, totalHarvest: 890, status: 'active', phone: '9876543211' },
  { id: '3', name: 'Lakshmi Devi', village: 'Srinivaspur', district: 'Kolar', state: 'Karnataka', crops: ['Onion', 'Chilli'], acreage: 2.5, totalHarvest: 650, status: 'active', phone: '9876543212' },
  { id: '4', name: 'Venkatesh Reddy', village: 'Mulbagal', district: 'Kolar', state: 'Karnataka', crops: ['Tomato', 'Potato'], acreage: 6.0, totalHarvest: 2100, status: 'active', phone: '9876543213' },
  { id: '5', name: 'Annapurna Bai', village: 'Kolar', district: 'Kolar', state: 'Karnataka', crops: ['Chilli'], acreage: 1.5, totalHarvest: 420, status: 'active', phone: '9876543214' },
  { id: '6', name: 'Prakash Gowda', village: 'Malur', district: 'Kolar', state: 'Karnataka', crops: ['Tomato', 'Onion'], acreage: 5.2, totalHarvest: 1680, status: 'active', phone: '9876543215' },
  { id: '7', name: 'Sarojini', village: 'Kolar', district: 'Kolar', state: 'Karnataka', crops: ['Potato'], acreage: 2.0, totalHarvest: 560, status: 'inactive', phone: '9876543216' },
  { id: '8', name: 'Manjunath', village: 'Bangarpet', district: 'Kolar', state: 'Karnataka', crops: ['Tomato'], acreage: 3.8, totalHarvest: 1020, status: 'active', phone: '9876543217' },
];

const CROP_COLORS: Record<string, string> = {
  Tomato: 'bg-rose-500',
  Onion: 'bg-amber-500',
  Chilli: 'bg-emerald-600',
  Potato: 'bg-orange-500',
};

const RECENT_ACTIVITY = [
  { id: '1', farmer: 'Ramesh Patel', action: 'logged 42 boxes harvest', time: '2 hours ago', type: 'harvest' },
  { id: '2', farmer: 'Suresh Kumar', action: 'recorded 3 workers labour', time: '4 hours ago', type: 'labour' },
  { id: '3', farmer: 'Lakshmi Devi', action: 'added new crop cycle — Chilli', time: 'Yesterday', type: 'crop' },
  { id: '4', farmer: 'Venkatesh Reddy', action: 'sold 120 boxes at Kolar Mandi', time: 'Yesterday', type: 'sale' },
  { id: '5', farmer: 'Annapurna Bai', action: 'reported leaf curl issue', time: '2 days ago', type: 'alert' },
];

export default function AdminPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [farmerListOpen, setFarmerListOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'harvest' | 'acreage'>('harvest');

  const filteredFarmers = DEMO_FARMERS.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.crops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'harvest') return b.totalHarvest - a.totalHarvest;
    if (sortBy === 'acreage') return b.acreage - a.acreage;
    return a.name.localeCompare(b.name);
  });

  const activeFarmers = DEMO_FARMERS.filter((f) => f.status === 'active');
  const totalAcreage = DEMO_FARMERS.reduce((sum, f) => sum + f.acreage, 0);
  const totalHarvest = DEMO_FARMERS.reduce((sum, f) => sum + f.totalHarvest, 0);

  // Crop distribution
  const cropCounts: Record<string, number> = {};
  DEMO_FARMERS.forEach((f) => f.crops.forEach((c) => { cropCounts[c] = (cropCounts[c] || 0) + 1; }));
  const maxCropCount = Math.max(...Object.values(cropCounts));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-800" />
            <h1 className="text-xl font-black text-gray-900">FPO & Organization Admin</h1>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Aggregated metrics for Farmer Producer Organizations, clusters & agriculture officers
          </p>
        </div>

        <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-300">
          Role: FPO Administrator
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Registered Farmers</span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{DEMO_FARMERS.length.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-700 font-bold">+{activeFarmers.length} active this season</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Total Acreage</span>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">{totalAcreage.toLocaleString()} Ac</div>
          <span className="text-[10px] text-gray-500 font-medium">Across {Object.keys(cropCounts).length} crop types</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
            <Package className="w-4 h-4 text-amber-600" />
            <span>Aggregated Harvest</span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">{(totalHarvest / 1000).toFixed(1)}K Boxes</div>
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

      {/* Crop Distribution + Regional Performance */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Crop Distribution */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-gray-900">Cluster Crop Portfolio</h3>
          </div>
          <div className="space-y-2.5 text-xs">
            {Object.entries(cropCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([crop, count]) => {
                const pct = Math.round((count / maxCropCount) * 100);
                return (
                  <div key={crop}>
                    <div className="flex justify-between font-bold text-gray-800 mb-1">
                      <span>{crop}</span>
                      <span>{count} farmers</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${CROP_COLORS[crop] || 'bg-gray-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Regional Performance */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-gray-900">Top Performers</h3>
          </div>
          <div className="space-y-2">
            {[...DEMO_FARMERS]
              .sort((a, b) => b.totalHarvest - a.totalHarvest)
              .slice(0, 4)
              .map((farmer, idx) => (
                <div key={farmer.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-gray-100 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-gray-900 truncate">{farmer.name}</p>
                    <p className="text-[10px] text-gray-500">{farmer.village} • {farmer.acreage} Ac</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xs text-emerald-900">{farmer.totalHarvest.toLocaleString()} boxes</p>
                    <p className="text-[10px] text-gray-400">{farmer.crops.join(', ')}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-700" />
          <h3 className="font-bold text-sm text-gray-900">Recent Cluster Activity</h3>
        </div>
        <div className="space-y-2">
          {RECENT_ACTIVITY.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-xl text-xs">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                item.type === 'harvest' ? 'bg-emerald-500' :
                item.type === 'labour' ? 'bg-amber-500' :
                item.type === 'crop' ? 'bg-sky-500' :
                item.type === 'sale' ? 'bg-blue-500' :
                'bg-rose-500'
              }`} />
              <div className="min-w-0 flex-1">
                <p className="text-gray-900">
                  <span className="font-bold">{item.farmer}</span>{' '}
                  <span className="text-gray-600">{item.action}</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farmer List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setFarmerListOpen(!farmerListOpen)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-gray-900">All Registered Farmers ({DEMO_FARMERS.length})</h3>
          </div>
          {farmerListOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {farmerListOpen && (
          <div className="px-4 pb-4 space-y-3">
            {/* Search and sort */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search farmer, village, or crop..."
                  className="w-full text-xs outline-none bg-transparent"
                />
              </div>
              <div className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-gray-400" />
                {(['harvest', 'acreage', 'name'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg transition ${
                      sortBy === opt ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {opt === 'harvest' ? 'Top Harvest' : opt === 'acreage' ? 'Most Acreage' : 'A-Z'}
                  </button>
                ))}
              </div>
            </div>

            {/* Farmer table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px]">
                    <th className="pb-2 pl-1">Farmer</th>
                    <th className="pb-2">Location</th>
                    <th className="pb-2">Crops</th>
                    <th className="pb-2 text-right">Acreage</th>
                    <th className="pb-2 text-right">Harvest</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 pr-1 text-right">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredFarmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-2.5 pl-1">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                            {farmer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-bold text-gray-900">{farmer.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {farmer.village}, {farmer.district}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-1 flex-wrap">
                          {farmer.crops.map((c) => (
                            <span key={c} className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-full font-bold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-black text-gray-900">{farmer.acreage} Ac</td>
                      <td className="py-2.5 text-right font-black text-emerald-900">{farmer.totalHarvest.toLocaleString()}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          farmer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {farmer.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-1 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="text-gray-300 hover:text-emerald-600 p-1" title={`Call ${farmer.name}`}>
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Data Privacy Notice */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-1">
        <span className="font-extrabold text-gray-900 block flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Farmer Data Privacy Safeguards
        </span>
        <p>
          Individual farmer financial books are encrypted and strictly partitioned. FPO / Admin views only display anonymized cluster-level aggregated yields, market supply trends, and regional crop health indicators.
        </p>
      </div>
    </div>
  );
}
