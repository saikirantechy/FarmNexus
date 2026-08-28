'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee, calculateHarvestGross } from '@/lib/calculations';
import { QuickAddModal } from '@/components/layout/QuickAddModal';
import {
  Package,
  BadgeIndianRupee,
  Plus,
  Trash2,
  Filter,
  Layers,
  TrendingUp,
  CheckCircle,
  Calendar,
} from 'lucide-react';

export default function HarvestPage() {
  const { t } = useLanguage();
  const { harvests, deleteHarvest, sales, markSaleReceived, financialSummary } = useFarmStore();

  const [activeTab, setActiveTab] = useState<'harvests' | 'upcoming_sales'>('harvests');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'harvest' | 'sale'>('harvest');
  const [gradeFilter, setGradeFilter] = useState<string>('all');

  const filteredHarvests = harvests.filter(
    (h) => gradeFilter === 'all' || h.grade === gradeFilter
  );

  const pendingSales = sales.filter((s) => s.paymentStatus === 'pending' || s.amountPending > 0);

  const openAdd = (type: 'harvest' | 'sale') => {
    setQuickAddType(type);
    setQuickAddOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <span>{t.navHarvest} & Sales Ledger</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Track daily picking batches, grades, and upcoming buyer receivables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openAdd('harvest')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addHarvest}</span>
          </button>
          <button
            onClick={() => openAdd('sale')}
            className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addSale}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200">
          <span className="text-[11px] font-bold text-amber-900 block">Total Harvested</span>
          <div className="text-lg sm:text-xl font-black text-amber-950 mt-0.5">
            {financialSummary.totalHarvestBoxes} {t.boxes}
          </div>
          <span className="text-[10px] text-amber-800">
            {financialSummary.totalHarvestKg.toLocaleString('en-IN')} kg
          </span>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-900 block">Realized Sales</span>
          <div className="text-lg sm:text-xl font-black text-emerald-950 mt-0.5">
            {formatRupee(financialSummary.totalRevenue)}
          </div>
          <span className="text-[10px] text-emerald-800">
            {financialSummary.totalSoldBoxes} boxes sold
          </span>
        </div>

        <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200">
          <span className="text-[11px] font-bold text-blue-900 block">Upcoming Sales</span>
          <div className="text-lg sm:text-xl font-black text-blue-950 mt-0.5">
            {formatRupee(financialSummary.totalReceivables)}
          </div>
          <span className="text-[10px] text-blue-800">4 buyer payments</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1 shadow-sm gap-1">
        <button
          onClick={() => setActiveTab('harvests')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'harvests'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Harvest Ledger ({harvests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming_sales')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'upcoming_sales'
              ? 'bg-blue-800 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BadgeIndianRupee className="w-3.5 h-3.5" />
          <span>Upcoming Sales & Receivables ({pendingSales.length})</span>
        </button>
      </div>

      {/* TAB 1: HARVEST LEDGER */}
      {activeTab === 'harvests' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          {/* Grade Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Grade:</span>
            </div>
            <div className="flex gap-1">
              {['all', 'A', 'B', 'Mixed'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    gradeFilter === g
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g === 'all' ? 'All Grades' : `Grade ${g}`}
                </button>
              ))}
            </div>
          </div>

          {/* Harvest Table */}
          {filteredHarvests.length === 0 ? (
            <div className="py-10 text-center text-gray-500 text-xs">
              No harvest records found matching filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[11px]">
                    <th className="pb-2 pl-1">Batch #</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Boxes</th>
                    <th className="pb-2 text-right">Weight (Kg)</th>
                    <th className="pb-2 text-right">Rate / Box</th>
                    <th className="pb-2 text-right">Gross Value</th>
                    <th className="pb-2 text-center">Grade</th>
                    <th className="pb-2 pr-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredHarvests.map((h, idx) => {
                    const weight = h.totalWeightKg || h.boxes * 20;
                    const price = h.estimatedPricePerBox || 240;
                    const gross = h.estimatedGross || h.boxes * price;

                    return (
                      <tr key={h.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-2.5 pl-1 font-bold text-gray-400">
                          #{filteredHarvests.length - idx}
                        </td>
                        <td className="py-2.5 font-semibold text-gray-900 whitespace-nowrap">
                          {h.date}
                        </td>
                        <td className="py-2.5 text-right font-black text-amber-900 text-sm">
                          {h.boxes}
                        </td>
                        <td className="py-2.5 text-right font-medium text-gray-600">
                          {weight} kg
                        </td>
                        <td className="py-2.5 text-right font-medium text-gray-600">₹{price}</td>
                        <td className="py-2.5 text-right font-extrabold text-emerald-900">
                          {formatRupee(gross)}
                        </td>
                        <td className="py-2.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              h.grade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : h.grade === 'B'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {h.grade}
                          </span>
                        </td>
                        <td className="py-2.5 pr-1 text-right">
                          <button
                            onClick={() => deleteHarvest(h.id)}
                            className="text-gray-300 hover:text-rose-600 p-1 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPCOMING SALES */}
      {activeTab === 'upcoming_sales' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Expected & Pending Payments</h3>
            <span className="text-xs text-blue-700 font-bold">
              Total: {formatRupee(financialSummary.totalReceivables)}
            </span>
          </div>

          {pendingSales.length === 0 ? (
            <div className="py-10 text-center bg-emerald-50 rounded-xl text-xs text-emerald-800 font-semibold flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-emerald-600 mb-1" />
              <span>All sales payments have been collected!</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingSales.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-3.5 bg-gray-50 hover:bg-blue-50/50 rounded-xl border border-gray-200/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-gray-900">
                        {s.boxes} boxes × ₹{s.pricePerUnit} = {formatRupee(s.grossAmount)}
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Buyer: <strong className="text-gray-800">{s.buyerName}</strong> • Market:{' '}
                      {s.marketName} • Date: {s.saleDate}
                    </p>
                    {s.notes && <p className="text-[11px] text-gray-500 italic">{s.notes}</p>}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-gray-400 font-semibold block">
                        Receivable Due
                      </span>
                      <span className="text-base font-black text-blue-900">
                        {formatRupee(s.amountPending)}
                      </span>
                    </div>

                    <button
                      onClick={() => markSaleReceived(s.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t.markReceived}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultTab={quickAddType}
      />
    </div>
  );
}
