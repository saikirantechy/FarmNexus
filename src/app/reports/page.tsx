'use client';

import React, { useMemo, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee } from '@/lib/calculations';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Receipt,
  PieChart,
} from 'lucide-react';

type ReportType = 'season' | 'daily' | 'weekly' | 'crop';

export default function ReportsPage() {
  const { t } = useLanguage();
  const { activeFarm, activeCrop, harvests, labourRecords, expenses, sales, financialSummary } = useFarmStore();

  const [reportType, setReportType] = useState<ReportType>('season');
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from: thirtyDaysAgo.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
  });

  // Filter data by date range
  const filteredHarvests = useMemo(() =>
    harvests.filter((h) => h.date >= dateRange.from && h.date <= dateRange.to),
    [harvests, dateRange]
  );

  const filteredExpenses = useMemo(() =>
    expenses.filter((e) => e.date >= dateRange.from && e.date <= dateRange.to),
    [expenses, dateRange]
  );

  const filteredLabour = useMemo(() =>
    labourRecords.filter((l) => l.date >= dateRange.from && l.date <= dateRange.to),
    [labourRecords, dateRange]
  );

  const filteredSales = useMemo(() =>
    sales.filter((s) => s.saleDate >= dateRange.from && s.saleDate <= dateRange.to),
    [sales, dateRange]
  );

  // Category breakdown
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [filteredExpenses]);

  const maxExpense = expenseByCategory.length > 0 ? expenseByCategory[0][1] : 1;

  const filteredRevenue = filteredSales.reduce((sum, s) => sum + s.netAmount, 0);
  const filteredExpensesTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0) + filteredLabour.reduce((sum, l) => sum + l.totalCost, 0);
  const filteredProfit = filteredRevenue - filteredExpensesTotal;

  const exportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    csv += 'FARMNEXUS REPORT\n';
    csv += `Farm,${activeFarm?.name || 'Farm'}\n`;
    csv += `Crop,${activeCrop?.cropName || 'Tomato'}\n`;
    csv += `Period,${dateRange.from} to ${dateRange.to}\n`;
    csv += `Revenue,${filteredRevenue}\n`;
    csv += `Expenses,${filteredExpensesTotal}\n`;
    csv += `Net Profit/Loss,${filteredProfit}\n\n`;

    csv += 'HARVEST LEDGER\nDate,Boxes,PricePerBox,Grade,GrossValue\n';
    filteredHarvests.forEach((h) => {
      csv += `${h.date},${h.boxes},${h.estimatedPricePerBox || 240},${h.grade},${h.estimatedGross || h.boxes * 240}\n`;
    });

    csv += '\nEXPENSES\nDate,Category,Amount,Vendor,Status\n';
    filteredExpenses.forEach((e) => {
      csv += `${e.date},${e.category},${e.amount},${e.vendor || ''},${e.paymentStatus}\n`;
    });

    csv += '\nLABOUR\nDate,Workers,Wage,TotalCost,Description\n';
    filteredLabour.forEach((l) => {
      csv += `${l.date},${l.workerCount},${l.dailyWage},${l.totalCost},${l.workDescription}\n`;
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FarmNexus_${reportType}_${dateRange.from}_to_${dateRange.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>{t.reportsTitle}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Export audit-ready farm accounting statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex bg-white rounded-2xl p-1 border border-gray-200 shadow-sm gap-1 overflow-x-auto text-xs">
        {([
          { key: 'season', label: t.seasonReport, icon: Calendar },
          { key: 'crop', label: t.cropReport, icon: PieChart },
          { key: 'weekly', label: t.weeklyReport, icon: BarChart3 },
          { key: 'daily', label: t.dailyReport, icon: FileText },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setReportType(key)}
            className={`flex-1 py-2 px-3 rounded-xl font-bold transition whitespace-nowrap flex items-center justify-center gap-1.5 ${
              reportType === key ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm flex items-center gap-2 text-xs">
        <Filter className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-gray-600">Period:</span>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none text-xs"
        />
        <span className="text-gray-400">to</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none text-xs"
        />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className={`rounded-2xl p-3 border ${filteredProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <span className="text-[11px] font-bold text-gray-600 block">Net Profit/Loss</span>
          <div className={`text-lg font-black mt-0.5 ${filteredProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
            {formatRupee(filteredProfit)}
          </div>
          <span className={`text-[10px] font-bold ${filteredProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {filteredProfit >= 0 ? '✅ Profit' : '⚠️ Loss'}
          </span>
        </div>

        <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200">
          <span className="text-[11px] font-bold text-blue-800 block">Revenue</span>
          <div className="text-lg font-black text-blue-950 mt-0.5">{formatRupee(filteredRevenue)}</div>
          <span className="text-[10px] text-blue-700">{filteredSales.length} sales</span>
        </div>

        <div className="bg-rose-50 rounded-2xl p-3 border border-rose-200">
          <span className="text-[11px] font-bold text-rose-800 block">Expenses</span>
          <div className="text-lg font-black text-rose-950 mt-0.5">{formatRupee(filteredExpensesTotal)}</div>
          <span className="text-[10px] text-rose-700">{filteredExpenses.length + filteredLabour.length} entries</span>
        </div>

        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200">
          <span className="text-[11px] font-bold text-amber-800 block">Harvested</span>
          <div className="text-lg font-black text-amber-950 mt-0.5">{filteredHarvests.reduce((s, h) => s + h.boxes, 0)} boxes</div>
          <span className="text-[10px] text-amber-700">{filteredHarvests.length} batches</span>
        </div>
      </div>

      {/* Printable Report */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md space-y-6 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-emerald-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h2 className="text-2xl font-black text-emerald-900">{t.appName} Farm Ledger</h2>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              {activeFarm?.name} • {activeFarm?.village}, {activeFarm?.district}, {activeFarm?.state}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-gray-400 block font-bold uppercase">Statement Period</span>
            <span className="font-extrabold text-gray-900 text-sm">{dateRange.from} to {dateRange.to}</span>
            <span className="text-gray-500 block">Generated: {new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-3">
          <h3 className="font-black text-sm text-emerald-950 uppercase tracking-wide">Executive Financial Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block font-semibold">Total Revenue</span>
              <span className="text-lg font-black text-emerald-900">{formatRupee(filteredRevenue)}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-semibold">Total Expenses</span>
              <span className="text-lg font-black text-rose-700">{formatRupee(filteredExpensesTotal)}</span>
            </div>
            <div>
              <span className="text-gray-500 block font-semibold">Net Profit/Loss</span>
              <span className={`text-lg font-black ${filteredProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatRupee(filteredProfit)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block font-semibold">Harvest Volume</span>
              <span className="text-lg font-black text-amber-900">{filteredHarvests.reduce((s, h) => s + h.boxes, 0)} boxes</span>
            </div>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        {expenseByCategory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              Expense Breakdown by Category
            </h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-[11px]">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 w-32">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {expenseByCategory.map(([cat, amount]) => (
                    <tr key={cat}>
                      <td className="p-2.5 font-bold text-gray-900">{cat}</td>
                      <td className="p-2.5 text-right font-black text-gray-900">{formatRupee(amount)}</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${(amount / maxExpense) * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-500 font-semibold text-[10px] w-8 text-right">
                            {Math.round((amount / filteredExpensesTotal) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-black text-gray-900">
                    <td className="p-2.5">Total Expenses</td>
                    <td className="p-2.5 text-right text-rose-700">{formatRupee(filteredExpensesTotal)}</td>
                    <td className="p-2.5 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Labour Summary */}
        {filteredLabour.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Labour Summary
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <div>
                <span className="text-gray-500 block font-medium">Total Entries</span>
                <span className="text-base font-black text-gray-900">{filteredLabour.length}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Workers Involved</span>
                <span className="text-base font-black text-gray-900">{filteredLabour.reduce((s, l) => s + l.workerCount, 0)}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Total Labour Cost</span>
                <span className="text-base font-black text-amber-900">{formatRupee(filteredLabour.reduce((s, l) => s + l.totalCost, 0))}</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>FarmNexus Certified Deterministic Ledger</span>
          </div>
          <span>Generated {new Date().toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}
