'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAgricultureHelpAnswer } from '@/lib/ai-service';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageCode } from '@/types';
import { Mic, MicOff, Send, Square, Volume2, VolumeX } from 'lucide-react';

const speechLanguages: Record<LanguageCode, string> = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN', te: 'te-IN', ta: 'ta-IN' };

export function FarmerVoiceHelp() {
  const { language } = useLanguage();
  const [input, setInput] = useState('');
  const [answer, setAnswer] = useState('Namaste! Tap the microphone and ask any farming question. I can also read my answer aloud.');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const recognitionRef = useRef<any>(null);

  const speak = (message: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = speechLanguages[language];
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };
  const ask = (question: string) => {
    if (!question.trim()) return;
    const response = getAgricultureHelpAnswer(question);
    setInput('');
    setAnswer(response);
    if (autoSpeak) speak(response);
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = speechLanguages[language];
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const question = event.results[0][0].transcript as string;
      setInput(question);
      ask(question);
    };
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [language, autoSpeak]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) recognitionRef.current.stop();
    else { recognitionRef.current.lang = speechLanguages[language]; recognitionRef.current.start(); }
  };

  return <section className="bg-gradient-to-br from-sky-50 to-emerald-50 rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-md space-y-3">
    <div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-base text-gray-900">Ask Farm Mitra</h2><p className="text-xs text-gray-600 mt-0.5">Speak in your language. Ask about crops, pests, water, fertilizer, harvest, prices, or how to use the app.</p></div><button onClick={() => setAutoSpeak((value) => !value)} className={`p-2 rounded-xl border ${autoSpeak ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-gray-500 border-gray-200'}`} title="Toggle spoken answers">{autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button></div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{['My crop has pests', 'How much water do I need?', 'What fertilizer should I use?', 'When should I harvest?'].map((question) => <button key={question} onClick={() => ask(question)} className="text-left p-2.5 rounded-xl border border-emerald-100 bg-white/80 hover:bg-emerald-100 text-xs font-bold text-emerald-900">{question}</button>)}</div>
    <div className="bg-white rounded-2xl p-3 border border-gray-200 text-sm text-gray-800 leading-relaxed"><span className="text-[10px] font-black uppercase tracking-wide text-emerald-700">Farm Help says</span><p className="mt-1">{answer}</p><button onClick={() => speak(answer)} className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1"><Volume2 className="w-3.5 h-3.5" />Listen again</button></div>
    {listening && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold flex items-center gap-2 animate-pulse"><span className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />Listening… speak your question now.</div>}
    {!supported && <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2">Voice input is not supported by this browser. You can type here or use the voice record tool above.</div>}
    <div className="flex gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && ask(input)} placeholder="Type your farming question…" className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none" /><button onClick={toggleListening} disabled={!supported} className={`p-2.5 rounded-xl text-white disabled:opacity-40 ${listening ? 'bg-rose-600' : 'bg-sky-700 hover:bg-sky-800'}`} title="Speak your question">{listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}</button><button onClick={() => ask(input)} className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white" title="Ask"><Send className="w-4 h-4" /></button><button onClick={() => window.speechSynthesis?.cancel()} className="p-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700" title="Stop speaking"><Square className="w-3.5 h-3.5" /></button></div>
  </section>;
}
