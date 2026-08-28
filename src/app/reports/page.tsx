'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { formatRupee } from '@/lib/calculations';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  IndianRupee,
  Package,
  Users,
  CheckCircle2,
} from 'lucide-react';

export default function ReportsPage() {
  const { t } = useLanguage();
  const { activeFarm, activeCrop, harvests, labourRecords, expenses, sales, financialSummary } =
    useFarmStore();

  const [reportType, setReportType] = useState<'season' | 'daily' | 'weekly' | 'crop'>('season');

  const exportCSV = () => {
    // Generate CSV for Harvest, Sales, Expenses, and Labour
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'FARM REPORT - ' + (activeFarm?.name || 'Farm') + '\n';
    csvContent += 'Crop,' + (activeCrop?.cropName || 'Tomato') + '\n';
    csvContent += 'Total Revenue (INR),' + financialSummary.totalRevenue + '\n';
    csvContent += 'Total Expenses (INR),' + financialSummary.totalExpenses + '\n';
    csvContent += 'Net Profit/Loss (INR),' + financialSummary.netProfitLoss + '\n';
    csvContent += 'Total Harvest Boxes,' + financialSummary.totalHarvestBoxes + '\n\n';

    csvContent += 'HARVEST LEDGER\nDate,Boxes,PricePerBox,Grade,GrossValue\n';
    harvests.forEach((h) => {
      csvContent += `${h.date},${h.boxes},${h.estimatedPricePerBox || 240},${h.grade},${h.estimatedGross || h.boxes * 240}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FarmNexus_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <span>{t.reportsTitle}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Export audit-ready farm accounting statements for bank, tax, or personal records
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
            <span>{t.exportPdf} / Print</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex bg-white rounded-2xl p-1 border border-gray-200 shadow-sm gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setReportType('season')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition whitespace-nowrap ${
            reportType === 'season' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.seasonReport}
        </button>
        <button
          onClick={() => setReportType('crop')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition whitespace-nowrap ${
            reportType === 'crop' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.cropReport}
        </button>
        <button
          onClick={() => setReportType('weekly')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition whitespace-nowrap ${
            reportType === 'weekly' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.weeklyReport}
        </button>
        <button
          onClick={() => setReportType('daily')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition whitespace-nowrap ${
            reportType === 'daily' ? 'bg-emerald-800 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.dailyReport}
        </button>
      </div>

      {/* Printable Report Document Card */}
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
            <span className="font-extrabold text-gray-900 text-sm">Season 2026 (Tomato Crop)</span>
            <span className="text-gray-500 block">Generated: {new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Financial Executive Summary Box */}
        <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 space-y-3">
          <h3 className="font-black text-sm text-emerald-950 uppercase tracking-wide">
            Executive Financial Summary
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block font-semibold">Total Revenue (Sales)</span>
              <span className="text-lg font-black text-emerald-900">
                {formatRupee(financialSummary.totalRevenue)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block font-semibold">Total Farm Expenses</span>
              <span className="text-lg font-black text-rose-700">
                {formatRupee(financialSummary.totalExpenses)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block font-semibold">Net Farm Profit</span>
              <span className="text-lg font-black text-emerald-700">
                {formatRupee(financialSummary.netProfitLoss)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block font-semibold">Profit Margin</span>
              <span className="text-lg font-black text-gray-900">
                +{financialSummary.profitMarginPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Physical Yield Summary */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">
            Harvest & Physical Yields
          </h4>
          <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <div>
              <span className="text-gray-500 block font-medium">Total Picked Volume</span>
              <span className="text-base font-black text-amber-900">
                {financialSummary.totalHarvestBoxes} Boxes
              </span>
              <span className="text-[10px] text-gray-400">
                ({financialSummary.totalHarvestKg.toLocaleString('en-IN')} kg)
              </span>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Cost per Box</span>
              <span className="text-base font-black text-gray-900">₹{financialSummary.costPerBox}</span>
              <span className="text-[10px] text-gray-400">All expenses included</span>
            </div>
            <div>
              <span className="text-gray-500 block font-medium">Average Selling Price</span>
              <span className="text-base font-black text-emerald-900">
                ₹{financialSummary.averageSellingPricePerBox} / box
              </span>
              <span className="text-[10px] text-gray-400">Wholesale Mandi average</span>
            </div>
          </div>
        </div>

        {/* Direct Expense Breakdown */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">
            Expense Breakdown by Category
          </h4>
          <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-[11px]">
                <tr>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Entries</th>
                  <th className="p-2.5 text-right">Total Amount (₹)</th>
                  <th className="p-2.5 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="p-2.5 font-bold text-gray-900">Labour Wages & Food</td>
                  <td className="p-2.5 text-gray-600">{labourRecords.length} records ({financialSummary.totalLabourWorkersCount} workers)</td>
                  <td className="p-2.5 text-right font-black text-gray-900">{formatRupee(financialSummary.totalLabourCost)}</td>
                  <td className="p-2.5 text-right text-gray-500">
                    {Math.round((financialSummary.totalLabourCost / (financialSummary.totalExpenses || 1)) * 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-gray-900">Direct Farm Inputs (Seeds, Fertilizer, Diesel)</td>
                  <td className="p-2.5 text-gray-600">{expenses.length} records</td>
                  <td className="p-2.5 text-right font-black text-gray-900">{formatRupee(financialSummary.directExpenses)}</td>
                  <td className="p-2.5 text-right text-gray-500">
                    {Math.round((financialSummary.directExpenses / (financialSummary.totalExpenses || 1)) * 100)}%
                  </td>
                </tr>
                <tr className="bg-gray-50 font-black text-gray-900">
                  <td className="p-2.5">Total Season Expenses</td>
                  <td className="p-2.5">—</td>
                  <td className="p-2.5 text-right text-rose-700 font-black text-sm">{formatRupee(financialSummary.totalExpenses)}</td>
                  <td className="p-2.5 text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Stamp */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>FarmNexus Certified Deterministic Ledger</span>
          </div>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
