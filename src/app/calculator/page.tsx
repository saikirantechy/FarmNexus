'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { calculateLabourCost, calculateSaleDeductions, calculateHarvestGross, formatRupee } from '@/lib/calculations';
import { Calculator, ChevronRight, CircleDollarSign, Sparkles } from 'lucide-react';

const number = (value: string) => Math.max(0, Number(value) || 0);

export default function CalculatorPage() {
  const [boxes, setBoxes] = useState('100');
  const [price, setPrice] = useState('250');
  const [commission, setCommission] = useState('10');
  const [transport, setTransport] = useState('1200');
  const [workers, setWorkers] = useState('5');
  const [wage, setWage] = useState('500');
  const [food, setFood] = useState('50');
  const [inputCost, setInputCost] = useState('6000');

  const result = useMemo(() => {
    const totalBoxes = number(boxes);
    const gross = calculateHarvestGross(totalBoxes, number(price));
    const sale = calculateSaleDeductions(gross, totalBoxes, 'percentage', number(commission), number(transport));
    const labour = calculateLabourCost(number(workers), number(wage), number(food));
    const totalCost = labour.totalCost + number(inputCost);
    const profit = sale.netAmount - totalCost;
    return { gross, sale, labour, totalCost, profit };
  }, [boxes, price, commission, transport, workers, wage, food, inputCost]);

  const explanation = result.profit >= 0
    ? `You keep ${formatRupee(result.sale.netAmount)} after sale deductions. After labour and farm inputs, the estimated profit is ${formatRupee(result.profit)}.`
    : `You keep ${formatRupee(result.sale.netAmount)} after sale deductions, but your labour and input costs are higher. The estimated loss is ${formatRupee(Math.abs(result.profit))}. Try checking price, transport, labour, or input costs.`;

  return <div className="space-y-4 max-w-3xl mx-auto">
    <section className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-lg">
      <div className="flex items-center gap-2"><Calculator className="w-6 h-6 text-emerald-200" /><h1 className="text-xl font-black">Farm Calculator</h1></div>
      <p className="text-xs text-emerald-100 mt-1">Enter simple numbers. FarmNexus calculates sale value, costs, and profit automatically.</p>
    </section>

    <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 space-y-4">
      <div><h2 className="font-black text-sm text-gray-900">1. Crop sale</h2><p className="text-xs text-gray-500">How much produce did you sell and at what price?</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2"><NumberField label="Boxes / units" value={boxes} onChange={setBoxes} /><NumberField label="Price per box (₹)" value={price} onChange={setPrice} /><NumberField label="Commission (%)" value={commission} onChange={setCommission} /><NumberField label="Transport (₹)" value={transport} onChange={setTransport} /></div>
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between text-sm"><span className="font-bold text-emerald-900">Gross crop sale</span><span className="font-black text-emerald-950">{formatRupee(result.gross)}</span></div>
    </section>

    <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 space-y-4">
      <div><h2 className="font-black text-sm text-gray-900">2. Labour and input costs</h2><p className="text-xs text-gray-500">Add the costs for this sale or harvest.</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2"><NumberField label="Workers" value={workers} onChange={setWorkers} /><NumberField label="Daily wage (₹)" value={wage} onChange={setWage} /><NumberField label="Food per worker (₹)" value={food} onChange={setFood} /><NumberField label="Other inputs (₹)" value={inputCost} onChange={setInputCost} /></div>
      <div className="grid grid-cols-2 gap-2 text-xs"><div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl"><span className="text-amber-900 block font-bold">Labour cost</span><span className="text-lg font-black text-amber-950">{formatRupee(result.labour.totalCost)}</span></div><div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl"><span className="text-rose-900 block font-bold">Total farm costs</span><span className="text-lg font-black text-rose-950">{formatRupee(result.totalCost)}</span></div></div>
    </section>

    <section className={`rounded-3xl p-5 shadow-lg text-white ${result.profit >= 0 ? 'bg-gradient-to-br from-emerald-700 to-emerald-900' : 'bg-gradient-to-br from-rose-700 to-rose-900'}`}><span className="text-xs font-bold uppercase tracking-wider text-white/75">Estimated profit / loss</span><div className="text-4xl font-black my-1">{formatRupee(result.profit)}</div><div className="grid grid-cols-2 gap-2 text-xs border-t border-white/20 pt-3"><div><span className="text-white/70 block">Commission</span><strong>-{formatRupee(result.sale.commissionAmount)}</strong></div><div><span className="text-white/70 block">Money after sale deductions</span><strong>{formatRupee(result.sale.netAmount)}</strong></div></div></section>

    <section className="bg-sky-50 border border-sky-200 rounded-3xl p-4"><div className="flex gap-2"><Sparkles className="w-5 h-5 text-sky-700 shrink-0" /><div><h2 className="font-black text-sm text-sky-950">Farm Mitra explains</h2><p className="text-sm text-sky-900 mt-1 leading-relaxed">{explanation}</p><Link href="/farm-bot" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-sky-800">Ask Farm Mitra another calculation question <ChevronRight className="w-3.5 h-3.5" /></Link></div></div></section>
  </div>;
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="text-xs font-bold text-gray-700">{label}<input type="number" min="0" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-600" /></label>; }
