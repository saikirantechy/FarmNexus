'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Eraser, Lightbulb, Pencil, Trash2, UserRoundPen } from 'lucide-react';

const colors = [
  { name: 'Green', value: '#16734b' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Orange', value: '#d97706' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Black', value: '#1f2937' },
];

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(colors[0].value);
  const [eraser, setEraser] = useState(false);
  const [notes, setNotes] = useState('');

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    try {
      const saved = localStorage.getItem('farmnexus_whiteboard');
      if (saved) {
        const image = new Image();
        image.onload = () => context.drawImage(image, 0, 0, canvas.width, canvas.height);
        image.src = saved;
      }
      setNotes(localStorage.getItem('farmnexus_whiteboard_notes') || '');
    } catch { /* local drawing still works without storage */ }
  };

  useEffect(() => { setupCanvas(); }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const save = () => {
    try {
      localStorage.setItem('farmnexus_whiteboard', canvasRef.current?.toDataURL('image/png') || '');
      localStorage.setItem('farmnexus_whiteboard_notes', notes);
    } catch { /* drawing remains usable when storage is full */ }
  };
  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    lastPointRef.current = point(event);
  };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;
    const next = point(event);
    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(next.x, next.y);
    context.strokeStyle = eraser ? '#ffffff' : color;
    context.lineWidth = eraser ? 26 : 7;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();
    lastPointRef.current = next;
  };
  const stop = () => { if (drawingRef.current) save(); drawingRef.current = false; lastPointRef.current = null; };
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setNotes('');
    try { localStorage.removeItem('farmnexus_whiteboard'); localStorage.removeItem('farmnexus_whiteboard_notes'); } catch { /* ignore */ }
  };

  return <div className="space-y-4 max-w-5xl mx-auto">
    <section className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-lg">
      <div className="flex items-center gap-2"><UserRoundPen className="w-6 h-6 text-emerald-200" /><h1 className="text-xl font-black">Farm Whiteboard</h1></div>
      <p className="text-xs text-emerald-100 mt-1">Draw with your finger or mouse to explain a farm plan, field layout, crop issue, or calculation.</p>
    </section>

    <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black text-gray-700 mr-1">Draw</span>
        {colors.map((item) => <button key={item.value} onClick={() => { setColor(item.value); setEraser(false); }} className={`w-9 h-9 rounded-xl border-2 ${color === item.value && !eraser ? 'border-gray-900 scale-105' : 'border-white'} shadow-sm`} style={{ backgroundColor: item.value }} aria-label={`${item.name} pen`} />)}
        <button onClick={() => setEraser((value) => !value)} className={`ml-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border ${eraser ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-100 text-gray-700 border-gray-200'}`}><Eraser className="w-4 h-4" />Eraser</button>
        <button onClick={clear} className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"><Trash2 className="w-4 h-4" />Clear</button>
      </div>
      <div className="p-3 bg-[#f7faf8]"><canvas ref={canvasRef} width={1200} height={700} onPointerDown={start} onPointerMove={draw} onPointerUp={stop} onPointerCancel={stop} className="w-full h-[52vw] max-h-[520px] min-h-[280px] bg-white rounded-2xl border border-emerald-200 touch-none cursor-crosshair shadow-inner" aria-label="Farm whiteboard drawing area" /></div>
    </section>

    <section className="grid sm:grid-cols-2 gap-4"><div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4"><div className="flex items-center gap-2"><Pencil className="w-4 h-4 text-emerald-700" /><h2 className="font-black text-sm text-gray-900">Add simple notes</h2></div><textarea value={notes} onChange={(event) => { setNotes(event.target.value); try { localStorage.setItem('farmnexus_whiteboard_notes', event.target.value); } catch { /* ignore */ } }} placeholder="Example: Water Field 1 on Monday. Check tomato leaves on Wednesday." rows={6} className="mt-3 w-full text-sm border border-gray-200 rounded-2xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-600" /></div><div className="bg-amber-50 rounded-3xl border border-amber-200 p-4"><div className="flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-700" /><h2 className="font-black text-sm text-amber-950">Easy ways to use it</h2></div><ul className="mt-3 space-y-2 text-xs text-amber-900 leading-relaxed"><li>• Draw fields, crop rows, and irrigation lines.</li><li>• Circle plant symptoms to explain them to an advisor.</li><li>• Write the sale calculation: boxes × price − costs.</li><li>• Make a simple harvest or labour plan with your family.</li></ul><p className="mt-3 text-[11px] font-semibold text-amber-800">Your drawing and notes stay saved on this device.</p></div></section>
  </div>;
}
