'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { ExpenseCategory, CommissionType } from '@/types';
import {
  calculateHarvestGross,
  calculateLabourCost,
  calculateSaleDeductions,
  formatRupee,
} from '@/lib/calculations';
import {
  X,
  Package,
  Receipt,
  Users,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'harvest' | 'expense' | 'labour' | 'sale';
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Fertilizer',
  'Pesticides',
  'Seeds',
  'Seedlings',
  'Diesel',
  'Machinery',
  'Transport',
  'Packaging',
  'Food',
  'Irrigation',
  'Electricity',
  'Land preparation',
  'Rent',
  'Repairs',
  'Fungicides',
  'Organic inputs',
  'Market fees',
  'Other',
];

export function QuickAddModal({ isOpen, onClose, defaultTab = 'harvest' }: QuickAddModalProps) {
  const { t } = useLanguage();
  const { activeFarmId, activeCropId, addHarvest, addExpense, addLabour, addSale } = useFarmStore();

  const [activeTab, setActiveTab] = useState<'harvest' | 'expense' | 'labour' | 'sale'>(defaultTab);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const todayIso = new Date().toISOString().split('T')[0];

  // Harvest Form State
  const [hDate, setHDate] = useState(todayIso);
  const [hBoxes, setHBoxes] = useState<string>('50');
  const [hPrice, setHPrice] = useState<string>('240');
  const [hGrade, setHGrade] = useState<'A' | 'B' | 'C' | 'Mixed'>('A');

  // Expense Form State
  const [eDate, setEDate] = useState(todayIso);
  const [eAmount, setEAmount] = useState<string>('2500');
  const [eCategory, setECategory] = useState<ExpenseCategory>('Fertilizer');
  const [eVendor, setEVendor] = useState<string>('');
  const [eNotes, setENotes] = useState<string>('');

  // Labour Form State
  const [lDate, setLDate] = useState(todayIso);
  const [lWorkers, setLWorkers] = useState<string>('10');
  const [lWage, setLWage] = useState<string>('500');
  const [lFoodPerPerson, setLFoodPerPerson] = useState<string>('50');
  const [lTransport, setLTransport] = useState<string>('0');
  const [lAdvance, setLAdvance] = useState<string>('0');
  const [lDesc, setLDesc] = useState<string>('Tomato picking & sorting');

  // Sale Form State
  const [sDate, setSDate] = useState(todayIso);
  const [sBoxes, setSBoxes] = useState<string>('50');
  const [sPrice, setSPrice] = useState<string>('260');
  const [sBuyer, setSBuyer] = useState<string>('Local APMC Trader');
  const [sMarket] = useState<string>('APMC Mandi');
  const [sCommType] = useState<CommissionType>('percentage');
  const [sCommRate, setSCommRate] = useState<string>('10');
  const [sPaymentStatus, setSPaymentStatus] = useState<'paid' | 'pending'>('paid');

  if (!isOpen) return null;

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
      onClose();
    }, 1200);
  };

  const handleHarvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const boxes = Number(hBoxes) || 0;
    const price = Number(hPrice) || 0;
    const gross = calculateHarvestGross(boxes, price);

    addHarvest({
      farmId: activeFarmId,
      cropCycleId: activeCropId,
      date: hDate,
      boxes,
      weightPerBoxKg: 20,
      totalWeightKg: boxes * 20,
      unit: 'box',
      grade: hGrade,
      estimatedPricePerBox: price,
      estimatedGross: gross,
    });

    showSuccess(`Added ${boxes} boxes harvest (${formatRupee(gross)})!`);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(eAmount) || 0;

    addExpense({
      farmId: activeFarmId,
      cropCycleId: activeCropId,
      date: eDate,
      amount,
      category: eCategory,
      vendor: eVendor,
      notes: eNotes,
      paymentStatus: 'paid',
      paidAmount: amount,
      balanceAmount: 0,
    });

    showSuccess(`Added ${formatRupee(amount)} expense for ${eCategory}!`);
  };

  const handleLabourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const workers = Number(lWorkers) || 0;
    const wage = Number(lWage) || 0;
    const food = Number(lFoodPerPerson) || 0;
    const transport = Number(lTransport) || 0;
    const advance = Number(lAdvance) || 0;

    const calc = calculateLabourCost(workers, wage, food, transport, advance);

    addLabour({
      farmId: activeFarmId,
      cropCycleId: activeCropId,
      date: lDate,
      workerCount: workers,
      dailyWage: wage,
      workDescription: lDesc,
      foodCostPerPerson: food,
      totalFoodCost: calc.totalFoodCost,
      transportCost: calc.transportCost,
      advancePaid: advance,
      balancePayable: calc.balancePayable,
      totalCost: calc.totalCost,
      paymentStatus: calc.balancePayable === 0 ? 'paid' : advance > 0 ? 'partial' : 'pending',
    });

    showSuccess(`Recorded ${workers} workers (${formatRupee(calc.totalCost)})!`);
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const boxes = Number(sBoxes) || 0;
    const price = Number(sPrice) || 0;
    const gross = boxes * price;
    const commRate = Number(sCommRate) || 0;

    const deductions = calculateSaleDeductions(gross, boxes, sCommType, commRate, 0, 0);
    const isPaid = sPaymentStatus === 'paid';

    addSale({
      farmId: activeFarmId,
      cropCycleId: activeCropId,
      saleDate: sDate,
      boxes,
      unit: 'box',
      pricePerUnit: price,
      grossAmount: gross,
      buyerName: sBuyer,
      marketName: sMarket,
      commissionType: sCommType,
      commissionRate: commRate,
      commissionAmount: deductions.commissionAmount,
      transportCost: 0,
      otherDeductions: 0,
      netAmount: deductions.netAmount,
      amountReceived: isPaid ? deductions.netAmount : 0,
      amountPending: isPaid ? 0 : deductions.netAmount,
      paymentStatus: isPaid ? 'paid' : 'pending',
    });

    showSuccess(`Recorded ${boxes} boxes sale (${formatRupee(deductions.netAmount)})!`);
  };

  // Dynamic calculations for real-time form feedback
  const previewHarvestTotal = calculateHarvestGross(Number(hBoxes) || 0, Number(hPrice) || 0);
  const previewLabourCalc = calculateLabourCost(
    Number(lWorkers) || 0,
    Number(lWage) || 0,
    Number(lFoodPerPerson) || 0,
    Number(lTransport) || 0,
    Number(lAdvance) || 0
  );
  const previewSaleGross = (Number(sBoxes) || 0) * (Number(sPrice) || 0);
  const previewSaleDeductions = calculateSaleDeductions(
    previewSaleGross,
    Number(sBoxes) || 0,
    sCommType,
    Number(sCommRate) || 0
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white text-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-bold text-base">{t.quickAdd}</h2>
              <p className="text-[11px] text-emerald-200">Record farm activities in 5 seconds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('harvest')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'harvest'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-900/10'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t.navHarvest}</span>
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'expense'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-900/10'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{t.addExpense}</span>
          </button>
          <button
            onClick={() => setActiveTab('labour')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'labour'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-900/10'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.totalLabour}</span>
          </button>
          <button
            onClick={() => setActiveTab('sale')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'sale'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-900/10'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t.addSale}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {successToast ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 animate-bounce mb-3" />
              <h3 className="font-bold text-lg text-gray-900">{successToast}</h3>
              <p className="text-xs text-gray-500 mt-1">Farm financials updated automatically</p>
            </div>
          ) : (
            <>
              {/* TAB 1: HARVEST FORM */}
              {activeTab === 'harvest' && (
                <form onSubmit={handleHarvestSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.date}
                      </label>
                      <input
                        type="date"
                        value={hDate}
                        onChange={(e) => setHDate(e.target.value)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Quality / Grade
                      </label>
                      <select
                        value={hGrade}
                        onChange={(e) => setHGrade(e.target.value as any)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                      >
                        <option value="A">Grade A (Super Quality)</option>
                        <option value="B">Grade B (Medium)</option>
                        <option value="C">Grade C (Local)</option>
                        <option value="Mixed">Mixed Quality</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        {t.quantityBoxes}
                      </label>
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={hBoxes}
                        onChange={(e) => setHBoxes(e.target.value)}
                        className="w-full text-base font-extrabold text-emerald-900 border-2 border-emerald-600/40 rounded-xl px-3 py-2.5 bg-emerald-50/40 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        required
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {t.pricePerBox}
                      </label>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={hPrice}
                        onChange={(e) => setHPrice(e.target.value)}
                        className="w-full text-base font-extrabold text-gray-900 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        placeholder="e.g. 240"
                      />
                    </div>
                  </div>

                  {/* Harvest Live Summary Box */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-800 font-medium">Estimated Value</span>
                      <p className="text-xs text-emerald-700">
                        {hBoxes} boxes × ₹{hPrice || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-900">
                        {formatRupee(previewHarvestTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition active:scale-[0.99]"
                  >
                    + {t.addHarvest}
                  </button>
                </form>
              )}

              {/* TAB 2: EXPENSE FORM */}
              {activeTab === 'expense' && (
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.date}
                      </label>
                      <input
                        type="date"
                        value={eDate}
                        onChange={(e) => setEDate(e.target.value)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.category}
                      </label>
                      <select
                        value={eCategory}
                        onChange={(e) => setECategory(e.target.value as ExpenseCategory)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
                      >
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      Expense Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={eAmount}
                      onChange={(e) => setEAmount(e.target.value)}
                      className="w-full text-lg font-black text-rose-700 border-2 border-rose-200 rounded-xl px-3 py-2.5 bg-rose-50/30 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none"
                      required
                      placeholder="e.g. 3500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Vendor / Shop Name
                      </label>
                      <input
                        type="text"
                        value={eVendor}
                        onChange={(e) => setEVendor(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none"
                        placeholder="e.g. Kolar Krishi Seva"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.notes}
                      </label>
                      <input
                        type="text"
                        value={eNotes}
                        onChange={(e) => setENotes(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:bg-white outline-none"
                        placeholder="e.g. 2 bags 19:19:19"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition active:scale-[0.99]"
                  >
                    + {t.addExpense}
                  </button>
                </form>
              )}

              {/* TAB 3: LABOUR FORM */}
              {activeTab === 'labour' && (
                <form onSubmit={handleLabourSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.date}
                      </label>
                      <input
                        type="date"
                        value={lDate}
                        onChange={(e) => setLDate(e.target.value)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.workDescription}
                      </label>
                      <input
                        type="text"
                        value={lDesc}
                        onChange={(e) => setLDesc(e.target.value)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                        placeholder="e.g. Tomato picking"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        {t.workerCount}
                      </label>
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={lWorkers}
                        onChange={(e) => setLWorkers(e.target.value)}
                        className="w-full text-base font-extrabold text-amber-900 border-2 border-amber-300 rounded-xl px-3 py-2 bg-amber-50/40 outline-none"
                        required
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        {t.dailyWage}
                      </label>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={lWage}
                        onChange={(e) => setLWage(e.target.value)}
                        className="w-full text-base font-extrabold text-amber-900 border-2 border-amber-300 rounded-xl px-3 py-2 bg-amber-50/40 outline-none"
                        required
                        placeholder="e.g. 500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        Food (₹/person)
                      </label>
                      <input
                        type="number"
                        value={lFoodPerPerson}
                        onChange={(e) => setLFoodPerPerson(e.target.value)}
                        className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 outline-none"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        Transport (₹)
                      </label>
                      <input
                        type="number"
                        value={lTransport}
                        onChange={(e) => setLTransport(e.target.value)}
                        className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-0.5">
                        Advance Paid (₹)
                      </label>
                      <input
                        type="number"
                        value={lAdvance}
                        onChange={(e) => setLAdvance(e.target.value)}
                        className="w-full text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-2 bg-gray-50 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Labour Calculation Breakdown */}
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-1 text-xs text-amber-950">
                    <div className="flex justify-between">
                      <span>Wages ({lWorkers} × ₹{lWage}):</span>
                      <span className="font-semibold">{formatRupee(previewLabourCalc.wageSubtotal)}</span>
                    </div>
                    {previewLabourCalc.totalFoodCost > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Food ({lWorkers} × ₹{lFoodPerPerson}):</span>
                        <span>{formatRupee(previewLabourCalc.totalFoodCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-amber-200/80 pt-1 text-sm text-amber-900">
                      <span>Total Labour Cost:</span>
                      <span>{formatRupee(previewLabourCalc.totalCost)}</span>
                    </div>
                    {previewLabourCalc.balancePayable > 0 && (
                      <div className="flex justify-between font-semibold text-rose-700 text-[11px]">
                        <span>Balance Payable:</span>
                        <span>{formatRupee(previewLabourCalc.balancePayable)}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition active:scale-[0.99]"
                  >
                    + {t.addLabour}
                  </button>
                </form>
              )}

              {/* TAB 4: SALE FORM */}
              {activeTab === 'sale' && (
                <form onSubmit={handleSaleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.date}
                      </label>
                      <input
                        type="date"
                        value={sDate}
                        onChange={(e) => setSDate(e.target.value)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Payment Status
                      </label>
                      <select
                        value={sPaymentStatus}
                        onChange={(e) => setSPaymentStatus(e.target.value as any)}
                        className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                      >
                        <option value="paid">Received (Cash/UPI)</option>
                        <option value="pending">Pending (Receivable)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        {t.quantityBoxes}
                      </label>
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={sBoxes}
                        onChange={(e) => setSBoxes(e.target.value)}
                        className="w-full text-base font-extrabold text-emerald-900 border-2 border-emerald-400 rounded-xl px-3 py-2 bg-emerald-50/40 outline-none"
                        required
                        placeholder="e.g. 68"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-1">
                        {t.pricePerBox}
                      </label>
                      <input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={sPrice}
                        onChange={(e) => setSPrice(e.target.value)}
                        className="w-full text-base font-extrabold text-emerald-900 border-2 border-emerald-400 rounded-xl px-3 py-2 bg-emerald-50/40 outline-none"
                        required
                        placeholder="e.g. 270"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {t.buyer}
                      </label>
                      <input
                        type="text"
                        value={sBuyer}
                        onChange={(e) => setSBuyer(e.target.value)}
                        className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                        placeholder="e.g. Balaji Traders"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Commission (%)
                      </label>
                      <input
                        type="number"
                        value={sCommRate}
                        onChange={(e) => setSCommRate(e.target.value)}
                        className="w-full text-xs font-medium border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  {/* Sale Preview */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-xs text-emerald-950">
                    <div className="flex justify-between">
                      <span>Gross Sale:</span>
                      <span className="font-semibold">{formatRupee(previewSaleGross)}</span>
                    </div>
                    {previewSaleDeductions.commissionAmount > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Commission ({sCommRate}%):</span>
                        <span>-{formatRupee(previewSaleDeductions.commissionAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold border-t border-emerald-200 pt-1 text-sm text-emerald-900">
                      <span>Net Sale:</span>
                      <span>{formatRupee(previewSaleDeductions.netAmount)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition active:scale-[0.99]"
                  >
                    + {t.addSale}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
