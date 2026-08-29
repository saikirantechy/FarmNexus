'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFarmStore } from '@/lib/farm-store';
import { DEMO_WEATHER } from '@/lib/demo-data';
import { formatRupee } from '@/lib/calculations';
import { OpsActivityType } from '@/types';
import {
  AlertTriangle,
  CalendarDays,
  Calculator,
  CheckCircle2,
  Circle,
  ClipboardList,
  CloudSun,
  Droplets,
  Eye,
  Flower2,
  ListChecks,
  MoreHorizontal,
  Package,
  PencilRuler,
  Plus,
  Scissors,
  SprayCan,
  Sprout,
  Tractor,
  Trash2,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react';

const ACTIVITY_TYPES: OpsActivityType[] = [
  'Irrigation',
  'Spraying',
  'Fertilizing',
  'Ploughing',
  'Seeding',
  'Weeding',
  'Scouting',
  'Harvest',
  'Other',
];

const ACTIVITY_META: Record<OpsActivityType, { icon: LucideIcon; color: string }> = {
  Irrigation: { icon: Droplets, color: 'bg-sky-100 text-sky-700' },
  Spraying: { icon: SprayCan, color: 'bg-violet-100 text-violet-700' },
  Fertilizing: { icon: Flower2, color: 'bg-emerald-100 text-emerald-700' },
  Ploughing: { icon: Tractor, color: 'bg-amber-100 text-amber-700' },
  Seeding: { icon: Sprout, color: 'bg-green-100 text-green-700' },
  Weeding: { icon: Scissors, color: 'bg-orange-100 text-orange-700' },
  Scouting: { icon: Eye, color: 'bg-indigo-100 text-indigo-700' },
  Harvest: { icon: Package, color: 'bg-rose-100 text-rose-700' },
  Other: { icon: MoreHorizontal, color: 'bg-gray-100 text-gray-700' },
};

const today = () => new Date().toISOString().slice(0, 10);

export default function OperationsPage() {
  const { activeFarm, activeCrop, tasks, inventoryItems, activities, addActivity, toggleActivityStatus, deleteActivity } = useFarmStore();
  const [fieldFilter, setFieldFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);

  const todayDate = today();
  const weather = DEMO_WEATHER;
  const topAlert = weather.agriculturalAlerts.find((alert) => alert.crop === activeCrop?.cropName) || weather.agriculturalAlerts[0];

  const openTasks = useMemo(() => tasks.filter((task) => !task.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [tasks]);
  const focusTasks = openTasks.filter((task) => task.dueDate <= todayDate);
  const lowStock = inventoryItems.filter((item) => item.currentQuantity <= item.lowStockThreshold).length;

  const thisWeekCount = useMemo(() => {
    const start = new Date(todayDate);
    start.setDate(start.getDate() - 6);
    const startStr = start.toISOString().slice(0, 10);
    return activities.filter((activity) => activity.date >= startStr && activity.date <= todayDate).length;
  }, [activities, todayDate]);

  const plannedCount = activities.filter((activity) => activity.status === 'planned').length;

  const visibleActivities = useMemo(() => {
    const filtered = fieldFilter === 'all' ? activities : activities.filter((activity) => activity.fieldId === fieldFilter);
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  }, [activities, fieldFilter]);

  const fields = activeFarm?.fields || [];
  const fieldName = (id: string) => fields.find((f) => f.id === id)?.name || 'Unassigned';

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-5 shadow-lg shadow-emerald-900/10 border border-emerald-900/20">
        <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-[0.16em]">FarmNexus Pro</p>
        <div className="flex items-center justify-between gap-3 mt-1">
          <h1 className="text-xl font-black flex items-center gap-2"><ClipboardList className="w-5 h-5 text-emerald-300" />Farm Operations</h1>
          <button onClick={() => setAddOpen(true)} className="bg-white text-emerald-800 text-xs font-extrabold px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 hover:bg-emerald-50 transition"><Plus className="w-4 h-4" />Log activity</button>
        </div>
        <p className="text-xs text-emerald-100 mt-1.5 font-medium">{activeFarm?.name} · {todayDate}{activeCrop ? ` · ${activeCrop.cropName} (${activeCrop.stage})` : ''}</p>
      </section>

      {/* Focus / weather strip */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center"><CloudSun className="w-5 h-5" /></span>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Today · {weather.location}</p>
                <p className="text-sm font-black text-gray-900">{weather.temperature}°C · Rain {weather.rainProbability}%</p>
              </div>
            </div>
            {topAlert && (
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${topAlert.type === 'critical' ? 'bg-rose-100 text-rose-800' : topAlert.type === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}><AlertTriangle className={`w-3 h-3 ${topAlert.type === 'critical' ? '' : 'hidden'}`} />{topAlert.title}</span>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{topAlert.message}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Summary stats */}
      <section className="grid grid-cols-2 gap-3">
        <Stat label="Activities this week" value={String(thisWeekCount)} emoji={<ListChecks className="w-4 h-4" />} tone="bg-emerald-100 text-emerald-800" />
        <Stat label="Planned ahead" value={String(plannedCount)} emoji={<CalendarDays className="w-4 h-4" />} tone="bg-sky-100 text-sky-800" />
        <Stat label={`Work due today (${focusTasks.length})`} value={focusTasks.length > 0 ? focusTasks[0].title : 'All done'} emoji={<CheckCircle2 className="w-4 h-4" />} tone={focusTasks.length > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'} />
        <Stat label={lowStock > 0 ? 'Low stock items' : 'Stock healthy'} value={String(lowStock)} emoji={<Package className="w-4 h-4" />} tone={lowStock > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'} />
      </section>

      {/* Focus tasks */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-sm text-gray-900 flex items-center gap-2"><Wind className="w-4 h-4 text-sky-700" />Today&apos;s focus</h2>
          <Link href="/tasks" className="text-[11px] font-bold text-emerald-700 hover:underline">View all tasks</Link>
        </div>
        {focusTasks.length === 0 ? (
          <p className="text-xs text-gray-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />You are clear for today — no work due.</p>
        ) : (
          <div className="space-y-2">
            {focusTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs">
                <span className="text-sky-700"><CalendarDays className="w-4 h-4" /></span>
                <div className="min-w-0 flex-1"><p className="font-bold text-gray-900 truncate">{task.title}</p><p className="text-gray-500">Due {task.dueDate}</p></div>
                <span className="shrink-0 text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-1 rounded">{task.type}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Activity log */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="font-black text-sm text-gray-900 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-emerald-700" />Field activity log</h2>
          <select value={fieldFilter} onChange={(event) => setFieldFilter(event.target.value)} className="text-xs font-bold border border-gray-200 rounded-xl px-2.5 py-2 bg-gray-50 outline-none text-gray-700">
            <option value="all">All fields</option>
            {fields.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}
          </select>
        </div>

        {visibleActivities.length === 0 ? (
          <p className="py-8 text-center text-xs text-gray-500">No farm activities logged yet.</p>
        ) : (
          <div className="space-y-2">
            {visibleActivities.map((activity) => {
              const meta = ACTIVITY_META[activity.type];
              const Icon = meta.icon;
              return (
                <div key={activity.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-start justify-between gap-2">
                  <button onClick={() => toggleActivityStatus(activity.id)} className="shrink-0 mt-0.5 text-emerald-600" aria-label={activity.status === 'completed' ? 'Mark as planned' : 'Mark as completed'}>
                    {activity.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-gray-300" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-7 h-7 rounded-lg ${meta.color} flex items-center justify-center shrink-0`}><Icon className="w-4 h-4" /></span>
                      <span className={`font-bold text-sm ${activity.status === 'planned' ? 'text-sky-900' : 'text-gray-900'}`}>{activity.type}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${activity.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>{activity.status === 'completed' ? 'Completed' : 'Planned'}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{activity.description || 'No notes'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{fieldName(activity.fieldId)} · {activity.date}{activity.cost ? ` · ${formatRupee(activity.cost)}` : ''}</p>
                  </div>
                  <button onClick={() => deleteActivity(activity.id)} className="shrink-0 text-gray-300 hover:text-rose-600 p-1 mt-0.5" aria-label={`Delete ${activity.type} activity`}><Trash2 className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 px-1">Operations tools</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <QuickLink href="/inventory" icon={Package} label="Input Inventory" sub="Stock & suppliers" tone="bg-amber-50 text-amber-700" />
          <QuickLink href="/tasks" icon={CalendarDays} label="Task Calendar" sub="Work & reminders" tone="bg-sky-50 text-sky-700" />
          <QuickLink href="/calculator" icon={Calculator} label="Farm Calculator" sub="Profit in seconds" tone="bg-emerald-50 text-emerald-700" />
          <QuickLink href="/weather" icon={CloudSun} label="Weather" sub="Forecast & alerts" tone="bg-blue-50 text-blue-700" />
          <QuickLink href="/whiteboard" icon={PencilRuler} label="Whiteboard" sub="Draw field maps" tone="bg-orange-50 text-orange-700" />
          <QuickLink href="/reports" icon={Sprout} label="Reports" sub="Farm performance" tone="bg-rose-50 text-rose-700" />
        </div>
      </section>

      {/* Add activity modal */}
      {addOpen && <AddActivityModal onClose={() => setAddOpen(false)} onAdd={(input) => { addActivity({ farmId: activeFarm?.id || '', cropCycleId: activeCrop?.id, ...input }); setAddOpen(false); }} fields={fields} />}
    </div>
  );
}

function Stat({ label, value, emoji, tone }: { label: string; value: string; emoji: React.ReactNode; tone: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
      <span className={`inline-flex w-7 h-7 rounded-lg ${tone} items-center justify-center mb-2`}>{emoji}</span>
      <p className="font-black text-lg text-gray-900 leading-tight truncate" title={value}>{value}</p>
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, sub, tone }: { href: string; icon: LucideIcon; label: string; sub: string; tone: string }) {
  return (
    <Link href={href} className="group bg-white border border-gray-200 rounded-2xl p-3.5 transition hover:border-emerald-300 hover:shadow-md flex items-center gap-3">
      <span className={`w-9 h-9 rounded-xl ${tone} flex items-center justify-center shrink-0`}><Icon className="w-5 h-5" /></span>
      <span className="min-w-0"><span className="block text-xs font-black text-gray-900 group-hover:text-emerald-800 truncate">{label}</span><span className="block text-[10px] text-gray-500 mt-0.5 truncate">{sub}</span></span>
    </Link>
  );
}

function AddActivityModal({ onClose, onAdd, fields }: { onClose: () => void; onAdd: (input: { fieldId: string; date: string; type: OpsActivityType; description?: string; cost?: number; status: 'completed' | 'planned' }) => void; fields: { id: string; name: string }[] }) {
  const [type, setType] = useState<OpsActivityType>('Irrigation');
  const [fieldId, setFieldId] = useState(fields[0]?.id || '');
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState<'completed' | 'planned'>('completed');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fieldId) return;
    const parsedCost = cost ? Number(cost) : 0;
    onAdd({ fieldId, date, type, status, description: description.trim() || undefined, cost: parsedCost > 0 ? parsedCost : undefined });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close"><X className="w-5 h-5" /></button>
        <h2 className="font-black text-base text-gray-900 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-emerald-700" />Log farm activity</h2>
        <form onSubmit={submit} className="mt-4 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <label className="block font-bold text-gray-700">Activity<select value={type} onChange={(event) => setType(event.target.value as OpsActivityType)} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none">{ACTIVITY_TYPES.map((entry) => <option key={entry}>{entry}</option>)}</select></label>
            <label className="block font-bold text-gray-700">Field<select value={fieldId} onChange={(event) => setFieldId(event.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none">{fields.map((field) => <option key={field.id} value={field.id}>{field.name}</option>)}</select></label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block font-bold text-gray-700">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none" required /></label>
            <label className="block font-bold text-gray-700">Status<select value={status} onChange={(event) => setStatus(event.target.value as 'completed' | 'planned')} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none"><option>completed</option><option>planned</option></select></label>
          </div>
          <label className="block font-bold text-gray-700">Cost (₹, optional)<input type="number" min="0" value={cost} onChange={(event) => setCost(event.target.value)} placeholder="e.g. 850" className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none" /></label>
          <label className="block font-bold text-gray-700">Notes<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} placeholder="What was done, inputs used, observations…" className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none" /></label>
          <button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-sm">Save activity</button>
        </form>
      </div>
    </div>
  );
}