'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getAgricultureHelpAnswer } from '@/lib/ai-service';
import { Bot, MessageCircle, Send, X } from 'lucide-react';

type Message = { sender: 'farmer' | 'bot'; text: string };

export function FarmChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Namaste! I am Farm Mitra. Ask me about crops, pests, water, fertilizer, harvesting, or farm costs.' },
  ]);
  const ask = (question: string) => {
    if (!question.trim()) return;
    setMessages((previous) => [...previous, { sender: 'farmer', text: question }, { sender: 'bot', text: getAgricultureHelpAnswer(question) }]);
    setInput('');
  };
  return <div className="fixed right-4 bottom-20 sm:bottom-6 z-50">
    {open && <div className="mb-3 w-[min(22rem,calc(100vw-2rem))] bg-white rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden">
      <div className="bg-emerald-800 text-white p-3 flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center"><Bot className="w-4 h-4" /></div><div><h2 className="font-black text-sm">Farm Mitra</h2><p className="text-[10px] text-emerald-200">Easy farming help</p></div></div><button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg" aria-label="Close chat"><X className="w-4 h-4" /></button></div>
      <div className="p-3 bg-gray-50 max-h-72 overflow-y-auto space-y-2 text-xs">{messages.map((message, index) => <div key={index} className={`flex ${message.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[88%] rounded-2xl p-2.5 leading-relaxed ${message.sender === 'farmer' ? 'bg-emerald-700 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>{message.text}</p></div>)}</div>
      <div className="px-3 pt-2 flex gap-1 overflow-x-auto">{['Crop pests', 'Irrigation help', 'Fertilizer help'].map((prompt) => <button key={prompt} onClick={() => ask(prompt)} className="shrink-0 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-1">{prompt}</button>)}</div>
      <div className="p-3 flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && ask(input)} placeholder="Ask Farm Mitra…" className="min-w-0 flex-1 text-xs border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-600" /><button onClick={() => ask(input)} className="p-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl" aria-label="Send question"><Send className="w-4 h-4" /></button></div>
      <Link href="/farm-bot" onClick={() => setOpen(false)} className="block text-center pb-3 text-[11px] font-bold text-emerald-700 hover:underline">Open full voice bot</Link>
    </div>}
    <button onClick={() => setOpen((value) => !value)} className="ml-auto w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl shadow-emerald-900/30 flex items-center justify-center transition active:scale-95" aria-label="Open Farm Mitra chat">{open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}</button>
  </div>;
}
