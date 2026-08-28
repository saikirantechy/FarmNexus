'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee } from '@/lib/calculations';
import { QuickAddModal } from '@/components/layout/QuickAddModal';
import {
  IndianRupee,
  Users,
  Receipt,
  TrendingUp,
  Plus,
  Trash2,
  PieChart,
  ShieldCheck,
  Calculator,
} from 'lucide-react';

export default function MoneyPage() {
  const { t } = useLanguage();
  const {
    expenses,
    deleteExpense,
    labourRecords,
    deleteLabour,
    sales,
    financialSummary,
  } = useFarmStore();

  const [activeTab, setActiveTab] = useState<'pnl' | 'labour' | 'expenses' | 'sales'>('pnl');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'expense' | 'labour' | 'sale'>('expense');

  const openAdd = (tab: 'expense' | 'labour' | 'sale') => {
    setQuickAddTab(tab);
    setQuickAddOpen(true);
  };

  const {
    totalRevenue,
    totalExpenses,
    netProfitLoss,
    isProfit,
    profitMarginPercent,
    directExpenses,
    totalLabourCost,
    totalFoodCost,
    totalReceivables,
    totalPayables,
    costPerBox,
    costPerKg,
    averageSellingPricePerBox,
  } = financialSummary;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-emerald-700" />
            <span>Farm Financials & P&L Engine</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Strict deterministic accounting — Revenue, Expenses, Labour, Commission & Profit
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/calculator"
            className="bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </Link>
          <button
            onClick={() => openAdd('expense')}
            className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addExpense}</span>
          </button>
          <button
            onClick={() => openAdd('labour')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addLabour}</span>
          </button>
        </div>
      </div>

      {/* Hero P&L Banner */}
      <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white rounded-3xl p-5 shadow-lg border border-emerald-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Current Farm Profit & Loss Status
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
              isProfit ? 'bg-emerald-500/30 text-emerald-200' : 'bg-rose-500/30 text-rose-200'
            }`}
          >
            {isProfit ? `✅ Net Profit (+${profitMarginPercent}%)` : `⚠️ Net Loss (${profitMarginPercent}%)`}
          </span>
        </div>

        <div className="text-3xl sm:text-5xl font-black tracking-tight text-white my-2">
          {formatRupee(netProfitLoss)}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-emerald-800/80 text-xs">
          <div>
            <span className="text-emerald-300/80 block">Total Revenue:</span>
            <span className="font-bold text-white text-sm">{formatRupee(totalRevenue)}</span>
          </div>
          <div>
            <span className="text-rose-300/80 block">Total Expenses:</span>
            <span className="font-bold text-white text-sm">{formatRupee(totalExpenses)}</span>
          </div>
          <div>
            <span className="text-blue-300/80 block">Receivables (Due):</span>
            <span className="font-bold text-white text-sm">{formatRupee(totalReceivables)}</span>
          </div>
          <div>
            <span className="text-amber-300/80 block">Payables (Due):</span>
            <span className="font-bold text-white text-sm">{formatRupee(totalPayables)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1 shadow-sm gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'pnl' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>P&L Breakdown</span>
        </button>
        <button
          onClick={() => setActiveTab('labour')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'labour' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Labour Ledger ({labourRecords.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'expenses' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Expenses ({expenses.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'sales' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Sales & Commission ({sales.length})</span>
        </button>
      </div>

      {/* TAB 1: P&L BREAKDOWN */}
      {activeTab === 'pnl' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Transparent Profit / Loss Calculation</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-gray-100">
              <div className="flex justify-between py-1.5 font-bold text-emerald-900 text-sm">
                <span>1. Total Realized Revenue (Crop Sales)</span>
                <span>+{formatRupee(totalRevenue)}</span>
              </div>

              <div className="flex justify-between py-1.5 text-gray-700">
                <span className="pl-3">Direct Inputs (Seeds, Fertilizer, Pesticides, Diesel)</span>
                <span className="text-rose-700 font-semibold">-{formatRupee(directExpenses)}</span>
              </div>

              <div className="flex justify-between py-1.5 text-gray-700">
                <span className="pl-3">Labour Wages & Member Costs</span>
                <span className="text-rose-700 font-semibold">-{formatRupee(totalLabourCost - totalFoodCost)}</span>
              </div>

              {totalFoodCost > 0 && (
                <div className="flex justify-between py-1.5 text-gray-700">
                  <span className="pl-3">Labour Food & Refreshment Expenses</span>
                  <span className="text-rose-700 font-semibold">-{formatRupee(totalFoodCost)}</span>
                </div>
              )}

              <div className="flex justify-between py-2 border-t-2 border-gray-900 font-black text-base text-gray-900">
                <span>Net Farm Profit / Loss</span>
                <span className={isProfit ? 'text-emerald-700' : 'text-rose-700'}>
                  {formatRupee(netProfitLoss)}
                </span>
              </div>
            </div>
          </div>

          {/* Unit Economics Box */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-sm text-gray-900 mb-3">Unit Economics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-medium block">{t.costPerBox}</span>
                <span className="text-base font-black text-gray-900 mt-1 block">₹{costPerBox}</span>
                <span className="text-[10px] text-gray-400">Total Expenses ÷ Harvest Boxes</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-medium block">{t.costPerKg}</span>
                <span className="text-base font-black text-gray-900 mt-1 block">₹{costPerKg}</span>
                <span className="text-[10px] text-gray-400">Total Expenses ÷ Total Kg</span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="text-gray-500 font-medium block">{t.avgSellingPrice}</span>
                <span className="text-base font-black text-gray-900 mt-1 block">₹{averageSellingPricePerBox}</span>
                <span className="text-[10px] text-gray-400">Gross Sales ÷ Sold Boxes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LABOUR LEDGER */}
      {activeTab === 'labour' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Labour & Worker Entries</h3>
            <span className="text-xs text-amber-800 font-bold">
              Total: {formatRupee(totalLabourCost)} ({financialSummary.totalLabourWorkersCount} workers)
            </span>
          </div>

          <div className="space-y-2.5">
            {labourRecords.map((l) => (
              <div
                key={l.id}
                className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-sm">
                      {l.workerCount} Workers × ₹{l.dailyWage} = {formatRupee(l.workerCount * l.dailyWage)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        l.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {l.paymentStatus === 'paid' ? 'Paid' : `Due: ${formatRupee(l.balancePayable || 0)}`}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    {l.workDescription} • Date: {l.date}
                  </p>
                  {l.totalFoodCost ? (
                    <p className="text-[11px] text-gray-500">
                      Food: {formatRupee(l.totalFoodCost)} (₹{l.foodCostPerPerson}/person)
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                  <div className="text-right">
                    <span className="text-sm font-black text-gray-900 block">{formatRupee(l.totalCost)}</span>
                    <span className="text-[10px] text-gray-400">Total cost</span>
                  </div>
                  <button
                    onClick={() => deleteLabour(l.id)}
                    className="text-gray-300 hover:text-rose-600 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES LEDGER */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Direct Farm Expenses</h3>
            <span className="text-xs text-rose-700 font-bold">
              Total: {formatRupee(directExpenses)}
            </span>
          </div>

          <div className="space-y-2">
            {expenses.map((e) => (
              <div
                key={e.id}
                className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900">{e.category}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.2 rounded font-medium">
                      {e.date}
                    </span>
                  </div>
                  {e.vendor && <p className="text-gray-500 text-[11px]">{e.vendor}</p>}
                  {e.notes && <p className="text-gray-500 text-[11px] italic">{e.notes}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-rose-700">{formatRupee(e.amount)}</span>
                  <button
                    onClick={() => deleteExpense(e.id)}
                    className="text-gray-300 hover:text-rose-600 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SALES & COMMISSION */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Crop Sales & Mandi Commissions</h3>
            <span className="text-xs text-emerald-800 font-bold">
              Net: {formatRupee(totalRevenue)}
            </span>
          </div>

          <div className="space-y-2.5">
            {sales.map((s) => (
              <div
                key={s.id}
                className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-gray-900">
                    {s.boxes} boxes × ₹{s.pricePerUnit} = {formatRupee(s.grossAmount)}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      s.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {s.paymentStatus === 'paid' ? 'Received' : 'Pending'}
                  </span>
                </div>

                <p className="text-gray-600">
                  Buyer: {s.buyerName} • Market: {s.marketName} • Date: {s.saleDate}
                </p>

                {s.commissionAmount > 0 && (
                  <p className="text-emerald-800 font-semibold text-[11px]">
                    Commission ({s.commissionRate}%): -{formatRupee(s.commissionAmount)}
                  </p>
                )}

                <div className="pt-1.5 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                  <span>Net Sale Value:</span>
                  <span className="text-sm font-black text-emerald-900">{formatRupee(s.netAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultTab={quickAddTab}
      />
    </div>
  );
}
