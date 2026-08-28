'use client';

import React, { useMemo, useState } from 'react';
import { useFarmStore } from '@/lib/farm-store';
import { FarmTaskType } from '@/types';
import { AlarmClock, CalendarDays, CheckCircle2, Circle, ListTodo, Plus, Trash2, X } from 'lucide-react';

const taskTypes: FarmTaskType[] = ['Irrigation', 'Spraying', 'Scouting', 'Harvest', 'Labour', 'Other'];
const today = () => new Date().toISOString().slice(0, 10);

export default function TasksPage() {
  const { activeFarm, activeCrop, tasks, addTask, toggleTaskCompleted, deleteTask } = useFarmStore();
  const [addOpen, setAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<FarmTaskType>('Irrigation');
  const [dueDate, setDueDate] = useState(today());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('07:00');
  const [notes, setNotes] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const openTasks = useMemo(() => tasks.filter((task) => !task.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [tasks]);
  const todayTasks = openTasks.filter((task) => task.dueDate <= today());
  const upcomingTasks = openTasks.filter((task) => task.dueDate > today());
  const completedTasks = tasks.filter((task) => task.completed).sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

  const submitTask = (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeFarm || !title.trim()) return;
    addTask({ farmId: activeFarm.id, cropCycleId: activeCrop?.id, title: title.trim(), type, dueDate, reminderEnabled, reminderTime: reminderEnabled ? reminderTime : undefined, notes: notes.trim() || undefined });
    setTitle(''); setType('Irrigation'); setDueDate(today()); setReminderEnabled(true); setReminderTime('07:00'); setNotes(''); setAddOpen(false);
  };

  return <div className="space-y-4">
    <section className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div><h1 className="text-xl font-black text-gray-900 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-sky-700" />Task calendar</h1><p className="text-xs text-gray-500 font-medium">Plan farm work and get timely in-app reminders.</p></div>
      <button onClick={() => setAddOpen(true)} className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5"><Plus className="w-4 h-4" />Schedule task</button>
    </section>

    <section className={`rounded-2xl p-4 border ${todayTasks.length ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
      <div className="flex items-center gap-2"><AlarmClock className={`w-5 h-5 ${todayTasks.length ? 'text-amber-700' : 'text-emerald-700'}`} /><div><h2 className="font-black text-sm text-gray-900">{todayTasks.length ? `${todayTasks.length} reminder${todayTasks.length > 1 ? 's' : ''} need attention` : 'You are clear for today'}</h2><p className="text-xs text-gray-600">{todayTasks.length ? todayTasks.map((task) => task.title).join(' · ') : 'Your scheduled work will appear here on its due date.'}</p></div></div>
    </section>

    <TaskSection title="Today & overdue" tasks={todayTasks} empty="No work due today." onToggle={toggleTaskCompleted} onDelete={deleteTask} />
    <TaskSection title="Upcoming schedule" tasks={upcomingTasks} empty="No upcoming tasks scheduled." onToggle={toggleTaskCompleted} onDelete={deleteTask} />

    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"><button onClick={() => setShowCompleted((value) => !value)} className="w-full flex items-center justify-between text-sm font-bold text-gray-800"><span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-700" />Completed ({completedTasks.length})</span><span className="text-xs text-gray-500">{showCompleted ? 'Hide' : 'Show'}</span></button>{showCompleted && <div className="mt-3"><TaskSection tasks={completedTasks} empty="No completed tasks yet." onToggle={toggleTaskCompleted} onDelete={deleteTask} compact /></div>}</section>

    {addOpen && <Modal onClose={() => setAddOpen(false)}><form onSubmit={submitTask} className="space-y-3 text-xs"><h2 className="font-black text-base text-gray-900">Schedule farm task</h2><Input label="Task" value={title} onChange={setTitle} placeholder="e.g. Inspect drip lines" required /><div className="grid grid-cols-2 gap-2"><Select label="Work type" value={type} onChange={(value) => setType(value as FarmTaskType)} values={taskTypes} /><Input label="Due date" type="date" value={dueDate} onChange={setDueDate} required /></div><label className="flex items-center gap-2 font-bold text-gray-700"><input type="checkbox" checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.target.checked)} className="accent-emerald-700" />Enable reminder</label>{reminderEnabled && <Input label="Reminder time" type="time" value={reminderTime} onChange={setReminderTime} required />}<label className="block font-bold text-gray-700">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none" rows={2} placeholder="Optional instructions" /></label><button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 rounded-xl text-sm">Schedule task</button></form></Modal>}
  </div>;
}

function TaskSection({ title, tasks, empty, onToggle, onDelete, compact = false }: { title?: string; tasks: ReturnType<typeof useFarmStore>['tasks']; empty: string; onToggle: (id: string) => void; onDelete: (id: string) => void; compact?: boolean }) { return <section className={compact ? '' : 'bg-white rounded-2xl border border-gray-200 shadow-sm p-4'}>{title && <h2 className="font-bold text-sm text-gray-900 mb-3">{title}</h2>}{tasks.length === 0 ? <p className="py-5 text-center text-xs text-gray-500">{empty}</p> : <div className="space-y-2">{tasks.map((task) => <div key={task.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2"><button onClick={() => onToggle(task.id)} className="shrink-0 text-emerald-700" aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}>{task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}</button><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className={`font-bold text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</span><span className="text-[10px] bg-sky-100 text-sky-900 font-bold px-1.5 py-0.5 rounded">{task.type}</span></div><p className="text-xs text-gray-500 mt-0.5">{task.dueDate}{task.reminderEnabled && ` · reminder ${task.reminderTime || 'on'}`}{task.notes && ` · ${task.notes}`}</p></div><button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-rose-600 p-1" aria-label={`Delete ${task.title}`}><Trash2 className="w-4 h-4" /></button></div>)}</div>}</section>; }
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"><div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl relative"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>{children}</div></div>; }
function Input({ label, value, onChange, type = 'text', placeholder, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }) { return <label className="block font-bold text-gray-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none" /></label>; }
function Select({ label, value, onChange, values }: { label: string; value: string; onChange: (value: string) => void; values: readonly string[] }) { return <label className="block font-bold text-gray-700">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none">{values.map((entry) => <option key={entry}>{entry}</option>)}</select></label>; }
