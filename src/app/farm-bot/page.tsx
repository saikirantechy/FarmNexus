'use client';

import React from 'react';
import { FarmerVoiceHelp } from '@/components/ai/FarmerVoiceHelp';
import Link from 'next/link';
import { Bot, Mic, Phone, Volume2 } from 'lucide-react';

export default function FarmBotPage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <section className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-6 shadow-lg text-center">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-white/15 border border-white/20 flex items-center justify-center"><Bot className="w-9 h-9 text-emerald-100" /></div>
        <h1 className="mt-3 text-2xl font-black">Farm Mitra</h1>
        <p className="mt-1 text-sm text-emerald-100">Your easy farming helper. Speak naturally; no typing needed.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold"><div className="bg-white/10 rounded-xl p-2 flex items-center justify-center gap-1.5"><Mic className="w-3.5 h-3.5" />Tap and speak</div><div className="bg-white/10 rounded-xl p-2 flex items-center justify-center gap-1.5"><Volume2 className="w-3.5 h-3.5" />Listen to answer</div></div>
      </section>
      <Link href="/call-agent" className="block bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white rounded-3xl p-4 shadow-lg transition"><div className="flex items-center justify-between"><div><p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Voice conversation</p><h2 className="font-black text-lg mt-0.5">Call Farm Mitra</h2><p className="text-xs text-emerald-100 mt-1">A premium call screen with live voice answers.</p></div><span className="w-12 h-12 rounded-2xl bg-emerald-300 text-emerald-950 flex items-center justify-center shadow-lg"><Phone className="w-6 h-6" /></span></div></Link>
      <FarmerVoiceHelp />
      <p className="text-center text-[11px] text-gray-500 px-4">For leaf disease, tap the AI Assistant tab and use Crop Doctor with a clear photo.</p>
    </div>
  );
}
