'use client';

import React, { useMemo, useState } from 'react';
import { useFarmStore } from '@/lib/farm-store';
import { InventoryCategory, InventoryUnit } from '@/types';
import { AlertTriangle, Boxes, PackagePlus, Trash2, Warehouse, X } from 'lucide-react';

const categories: InventoryCategory[] = ['Seeds', 'Fertilizer', 'Pesticide', 'Fungicide', 'Organic input', 'Packaging', 'Fuel', 'Other'];
const units: InventoryUnit[] = ['kg', 'g', 'litre', 'ml', 'piece', 'bag', 'packet'];

export default function InventoryPage() {
  const { activeFarm, inventoryItems, inventoryTransactions, addInventoryItem, recordInventoryTransaction, deleteInventoryItem } = useFarmStore();
  const [addOpen, setAddOpen] = useState(false);
  const [stockItemId, setStockItemId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Fertilizer');
  const [unit, setUnit] = useState<InventoryUnit>('kg');
  const [openingStock, setOpeningStock] = useState('0');
  const [threshold, setThreshold] = useState('5');
  const [supplier, setSupplier] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');

  const lowStockItems = useMemo(
    () => inventoryItems.filter((item) => item.currentQuantity <= item.lowStockThreshold),
    [inventoryItems]
  );
  const stockItem = inventoryItems.find((item) => item.id === stockItemId);

  const addItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeFarm || !name.trim()) return;
    addInventoryItem({
      farmId: activeFarm.id,
      name: name.trim(),
      category,
      unit,
      currentQuantity: Math.max(0, Number(openingStock) || 0),
      lowStockThreshold: Math.max(0, Number(threshold) || 0),
      supplier: supplier.trim() || undefined,
    });
    setName(''); setOpeningStock('0'); setThreshold('5'); setSupplier(''); setAddOpen(false);
  };

  const restock = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeFarm || !stockItem || Number(quantity) <= 0) return;
    recordInventoryTransaction({
      farmId: activeFarm.id,
      inventoryItemId: stockItem.id,
      type: 'purchase',
      quantity: Number(quantity),
      unitCost: Number(unitCost) || undefined,
      supplier: supplier.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
    });
    setQuantity(''); setUnitCost(''); setSupplier(''); setStockItemId(null);
  };

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2"><Warehouse className="w-5 h-5 text-amber-600" />Input Inventory</h1>
          <p className="text-xs text-gray-500 font-medium">Track farm inputs, suppliers, purchases, and low-stock alerts.</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"><PackagePlus className="w-4 h-4" />Add input</button>
      </section>

      <section className="grid grid-cols-2 gap-2.5">
        <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200"><span className="text-[11px] font-bold text-emerald-900 block">Tracked inputs</span><span className="text-xl font-black text-emerald-950">{inventoryItems.length}</span></div>
        <div className={`rounded-2xl p-3 border ${lowStockItems.length ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}><span className="text-[11px] font-bold text-gray-700 block">Low-stock alerts</span><span className="text-xl font-black text-gray-950">{lowStockItems.length}</span></div>
      </section>

      {lowStockItems.length > 0 && <section className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 text-xs text-amber-900"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span><strong>Restock needed:</strong> {lowStockItems.map((item) => item.name).join(', ')}.</span></section>}

      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        {inventoryItems.length === 0 ? <div className="py-12 text-center"><Boxes className="w-9 h-9 text-gray-300 mx-auto mb-2" /><p className="text-sm font-bold text-gray-700">No inputs tracked yet</p><p className="text-xs text-gray-500 mt-1">Add seeds, fertilizers, crop protection, packaging, or fuel.</p></div> : <div className="space-y-2.5">{inventoryItems.map((item) => {
          const isLow = item.currentQuantity <= item.lowStockThreshold;
          return <div key={item.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div><div className="flex items-center gap-2"><h2 className="font-black text-sm text-gray-900">{item.name}</h2>{isLow && <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">Low stock</span>}</div><p className="text-xs text-gray-500 mt-0.5">{item.category} · {item.supplier || 'No supplier saved'} · reorder at {item.lowStockThreshold} {item.unit}</p></div>
            <div className="flex items-center gap-2 sm:justify-end"><div className="text-right mr-1"><span className="text-[10px] text-gray-500 block">Available</span><span className="font-black text-emerald-900">{item.currentQuantity} {item.unit}</span></div><button onClick={() => setStockItemId(item.id)} className="bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl">Restock</button><button onClick={() => deleteInventoryItem(item.id)} className="text-gray-400 hover:text-rose-600 p-1.5" aria-label={`Delete ${item.name}`}><Trash2 className="w-4 h-4" /></button></div>
          </div>;
        })}</div>}
      </section>

      {inventoryTransactions.length > 0 && <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"><h2 className="font-bold text-sm text-gray-900 mb-2">Recent purchases</h2><div className="space-y-2">{inventoryTransactions.slice(0, 5).map((transaction) => { const item = inventoryItems.find((entry) => entry.id === transaction.inventoryItemId); return <div key={transaction.id} className="text-xs flex justify-between text-gray-600"><span>{item?.name || 'Deleted input'} · {transaction.supplier || 'Supplier not saved'}</span><span className="font-bold text-emerald-800">+{transaction.quantity} {item?.unit}</span></div>; })}</div></section>}

      {addOpen && <Modal title="Add farm input" onClose={() => setAddOpen(false)}><form onSubmit={addItem} className="space-y-3 text-xs"><Input label="Input name" value={name} onChange={setName} placeholder="e.g. Neem oil" required /><div className="grid grid-cols-2 gap-2"><Select label="Category" value={category} onChange={(value) => setCategory(value as InventoryCategory)} values={categories} /><Select label="Unit" value={unit} onChange={(value) => setUnit(value as InventoryUnit)} values={units} /></div><div className="grid grid-cols-2 gap-2"><Input label="Opening stock" type="number" value={openingStock} onChange={setOpeningStock} required /><Input label="Low-stock at" type="number" value={threshold} onChange={setThreshold} required /></div><Input label="Supplier (optional)" value={supplier} onChange={setSupplier} placeholder="e.g. Green Agro Traders" /><Submit>Add input</Submit></form></Modal>}
      {stockItem && <Modal title={`Restock ${stockItem.name}`} onClose={() => setStockItemId(null)}><form onSubmit={restock} className="space-y-3 text-xs"><Input label={`Quantity (${stockItem.unit})`} type="number" value={quantity} onChange={setQuantity} required /><Input label="Unit cost (₹, optional)" type="number" value={unitCost} onChange={setUnitCost} /><Input label="Supplier (optional)" value={supplier} onChange={setSupplier} /><Submit>Record purchase</Submit></form></Modal>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"><div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl"><div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4"><h2 className="font-black text-gray-900">{title}</h2><button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button></div>{children}</div></div>; }
function Input({ label, value, onChange, type = 'text', placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) { return <label className="block font-bold text-gray-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} min={type === 'number' ? 0 : undefined} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none" /></label>; }
function Select({ label, value, onChange, values }: { label: string; value: string; onChange: (value: string) => void; values: readonly string[] }) { return <label className="block font-bold text-gray-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none">{values.map((entry) => <option key={entry}>{entry}</option>)}</select></label>; }
function Submit({ children }: { children: React.ReactNode }) { return <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-sm">{children}</button>; }
