'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Eraser,
  Lightbulb,
  Pencil,
  Trash2,
  UserRoundPen,
  Type,
  Square,
  Circle,
  Minus,
  Undo2,
  Download,
  Layers,
} from 'lucide-react';

const colors = [
  { name: 'Green', value: '#16734b' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Orange', value: '#d97706' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Black', value: '#1f2937' },
  { name: 'Purple', value: '#7c3aed' },
];

const TEMPLATES = [
  {
    id: 'field-layout',
    name: 'Field Layout',
    icon: '🌾',
    description: 'Draw field boundaries, irrigation lines, crop rows',
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Field border
      ctx.strokeStyle = '#16734b';
      ctx.lineWidth = 3;
      ctx.strokeRect(w * 0.1, h * 0.15, w * 0.8, h * 0.7);
      // Field name
      ctx.fillStyle = '#16734b';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('FIELD 1', w * 0.4, h * 0.12);
      // Irrigation lines
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(w * 0.1, h * (0.15 + i * 0.14));
        ctx.lineTo(w * 0.9, h * (0.15 + i * 0.14));
        ctx.stroke();
      }
      ctx.setLineDash([]);
      // Labels
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#2563eb';
      ctx.fillText('Drip line', w * 0.12, h * 0.28);
      ctx.fillText('Drip line', w * 0.12, h * 0.42);
      // Entry point
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.85, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.font = '12px sans-serif';
      ctx.fillText('Entry', w * 0.47, h * 0.92);
    },
  },
  {
    id: 'crop-rows',
    name: 'Crop Rows',
    icon: '🍅',
    description: 'Planting layout with spacing guide',
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = '#16734b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Crop Row Layout', w * 0.35, h * 0.08);
      // Rows
      for (let row = 0; row < 6; row++) {
        const y = h * (0.2 + row * 0.12);
        // Row line
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.1, y);
        ctx.lineTo(w * 0.9, y);
        ctx.stroke();
        // Plants
        for (let col = 0; col < 8; col++) {
          const x = w * (0.15 + col * 0.1);
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#166534';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Row label
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Row ${row + 1}`, w * 0.92, y + 4);
      }
      // Spacing
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(w * 0.15, h * 0.32);
      ctx.lineTo(w * 0.15, h * 0.44);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#d97706';
      ctx.font = '11px sans-serif';
      ctx.fillText('60cm spacing', w * 0.04, h * 0.39);
    },
  },
  {
    id: 'pest-symptom',
    name: 'Pest / Symptom',
    icon: '🐛',
    description: 'Circle plant symptoms for advisor',
    draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Plant drawing
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, 60, 0, Math.PI * 2);
      ctx.fill();
      // Stem
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.56);
      ctx.lineTo(w * 0.5, h * 0.85);
      ctx.stroke();
      // Leaves
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(w * 0.42, h * 0.45, 25, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(w * 0.58, h * 0.45, 25, 12, 0.4, 0, Math.PI * 2);
      ctx.fill();
      // Problem circles
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.arc(w * 0.45, h * 0.43, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.56, h * 0.48, 15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Labels
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('⚠️ Yellow spots here', w * 0.6, h * 0.42);
      ctx.fillText('⚠️ Brown edges', w * 0.62, h * 0.52);
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.fillText('Circle symptoms and send to advisor', w * 0.25, h * 0.93);
    },
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    icon: '📝',
    description: 'Start with empty whiteboard',
    draw: () => {},
  },
];

type Tool = 'pen' | 'eraser' | 'text' | 'rect' | 'circle' | 'line';

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState(colors[0].value);
  const [tool, setTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState<{ x: number; y: number } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const setupCanvas = useCallback((template?: typeof TEMPLATES[number]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (template && template.id !== 'blank') {
      template.draw(ctx, canvas.width, canvas.height);
    }

    try {
      if (!template) {
        const saved = localStorage.getItem('farmnexus_whiteboard');
        if (saved) {
          const image = new Image();
          image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          image.src = saved;
        }
      }
      setNotes(localStorage.getItem('farmnexus_whiteboard_notes') || '');
    } catch { /* local drawing still works */ }
  }, []);

  useEffect(() => { setupCanvas(); }, [setupCanvas]);

  const save = () => {
    try {
      localStorage.setItem('farmnexus_whiteboard', canvasRef.current?.toDataURL('image/png') || '');
      localStorage.setItem('farmnexus_whiteboard_notes', notes);
    } catch { /* ignore */ }
  };

  const pushHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    setHistory((prev) => [...prev.slice(-20), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || history.length === 0) return;
    const last = history[history.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
    save();
  };

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const pt = point(event);

    if (tool === 'text') {
      setTextPos(pt);
      return;
    }

    drawingRef.current = true;
    lastPointRef.current = pt;
    pushHistory();

    if (tool === 'rect' || tool === 'circle' || tool === 'line') {
      // Store start for shape drawing
      lastPointRef.current = pt;
    }
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const next = point(event);

    if (tool === 'pen' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(next.x, next.y);
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctx.lineWidth = tool === 'eraser' ? 30 : lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      lastPointRef.current = next;
    }
  };

  const stop = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const end = point(event);

    if (tool === 'rect') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(lastPointRef.current.x, lastPointRef.current.y, end.x - lastPointRef.current.x, end.y - lastPointRef.current.y);
    } else if (tool === 'circle') {
      const rx = Math.abs(end.x - lastPointRef.current.x) / 2;
      const ry = Math.abs(end.y - lastPointRef.current.y) / 2;
      const cx = (lastPointRef.current.x + end.x) / 2;
      const cy = (lastPointRef.current.y + end.y) / 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    drawingRef.current = false;
    lastPointRef.current = null;
    save();
  };

  const handleTextSubmit = () => {
    if (!textInput.trim() || !textPos || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    pushHistory();
    ctx.fillStyle = color;
    ctx.font = `${lineWidth * 5 + 10}px sans-serif`;
    ctx.fillText(textInput, textPos.x, textPos.y);
    setTextInput('');
    setTextPos(null);
    save();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setNotes('');
    setHistory([]);
    try { localStorage.removeItem('farmnexus_whiteboard'); localStorage.removeItem('farmnexus_whiteboard_notes'); } catch { /* ignore */ }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `farm-whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <section className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <UserRoundPen className="w-6 h-6 text-emerald-200" />
              <h1 className="text-xl font-black">Farm Whiteboard</h1>
            </div>
            <p className="text-xs text-emerald-100 mt-1">Draw field maps, crop layouts, or explain issues to your advisor.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="bg-white/15 hover:bg-white/25 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Layers className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={downloadCanvas}
              className="bg-white/15 hover:bg-white/25 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </section>

      {/* Template Picker */}
      {showTemplates && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            Farm Templates
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => { setupCanvas(tpl); setShowTemplates(false); }}
                className="p-3 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition text-left"
              >
                <span className="text-xl">{tpl.icon}</span>
                <p className="font-bold text-xs text-gray-900 mt-1">{tpl.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{tpl.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Canvas + Tools */}
      <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
          {/* Tools */}
          <span className="text-xs font-black text-gray-700 mr-1">Tools</span>
          {[
            { key: 'pen' as Tool, icon: Pencil, label: 'Pen' },
            { key: 'eraser' as Tool, icon: Eraser, label: 'Eraser' },
            { key: 'text' as Tool, icon: Type, label: 'Text' },
            { key: 'rect' as Tool, icon: Square, label: 'Rectangle' },
            { key: 'circle' as Tool, icon: Circle, label: 'Circle' },
            { key: 'line' as Tool, icon: Minus, label: 'Line' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTool(key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                tool === key
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}

          <div className="h-5 w-px bg-gray-200 mx-1" />

          {/* Colors */}
          {colors.map((item) => (
            <button
              key={item.value}
              onClick={() => { setColor(item.value); setTool('pen'); }}
              className={`w-7 h-7 rounded-lg border-2 transition ${
                color === item.value && tool !== 'eraser' ? 'border-gray-900 scale-110' : 'border-white'
              } shadow-sm`}
              style={{ backgroundColor: item.value }}
              aria-label={`${item.name} pen`}
            />
          ))}

          <div className="h-5 w-px bg-gray-200 mx-1" />

          {/* Line width */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-gray-500">Size</span>
            {[1, 3, 6, 10].map((w) => (
              <button
                key={w}
                onClick={() => setLineWidth(w)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                  lineWidth === w ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
              >
                <span className="rounded-full bg-gray-700" style={{ width: `${w * 2 + 2}px`, height: `${w * 2 + 2}px` }} />
              </button>
            ))}
          </div>

          <div className="ml-auto flex gap-1.5">
            <button onClick={undo} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition" title="Undo">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={clear} className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition" title="Clear all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="p-3 bg-[#f7faf8] relative">
          <canvas
            ref={canvasRef}
            width={1200}
            height={700}
            onPointerDown={start}
            onPointerMove={draw}
            onPointerUp={stop}
            onPointerCancel={stop}
            className="w-full h-[52vw] max-h-[520px] min-h-[280px] bg-white rounded-2xl border border-emerald-200 touch-none cursor-crosshair shadow-inner"
            aria-label="Farm whiteboard drawing area"
          />

          {/* Text input overlay */}
          {textPos && (
            <div
              className="absolute z-10"
              style={{ left: `${(textPos.x / 1200) * 100}%`, top: `${(textPos.y / 700) * 100}%` }}
            >
              <div className="bg-white border border-emerald-400 rounded-lg shadow-lg p-1.5 flex gap-1.5">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') setTextPos(null); }}
                  placeholder="Type label..."
                  className="text-xs border-0 outline-none px-1 py-0.5 w-32"
                  autoFocus
                />
                <button onClick={handleTextSubmit} className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">OK</button>
                <button onClick={() => setTextPos(null)} className="text-[10px] text-gray-400 px-1">✕</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Notes + Tips */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-emerald-700" />
            <h2 className="font-black text-sm text-gray-900">Add simple notes</h2>
          </div>
          <textarea
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              try { localStorage.setItem('farmnexus_whiteboard_notes', event.target.value); } catch { /* ignore */ }
            }}
            placeholder="Example: Water Field 1 on Monday. Check tomato leaves on Wednesday."
            rows={6}
            className="mt-3 w-full text-sm border border-gray-200 rounded-2xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <h2 className="font-black text-sm text-amber-950">Easy ways to use it</h2>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-amber-900 leading-relaxed">
            <li>• Use <strong>Field Layout</strong> template to map irrigation lines and boundaries.</li>
            <li>• Use <strong>Crop Rows</strong> template to plan planting spacing.</li>
            <li>• Use <strong>Pest / Symptom</strong> template to circle issues for your advisor.</li>
            <li>• Draw sale calculations: boxes × price − costs.</li>
            <li>• Add <strong>text labels</strong> to mark important areas.</li>
            <li>• Use shapes (rect, circle, line) for clean diagrams.</li>
            <li>• <strong>Undo</strong> mistakes anytime.</li>
          </ul>
          <p className="mt-3 text-[11px] font-semibold text-amber-800">Your drawing and notes stay saved on this device. Download as PNG to share.</p>
        </div>
      </section>
    </div>
  );
}
