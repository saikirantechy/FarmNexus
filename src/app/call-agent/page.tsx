'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage, LANGUAGE_OPTIONS } from '@/lib/i18n/LanguageContext';
import { getAgricultureHelpAnswer } from '@/lib/ai-service';
import { LanguageCode } from '@/types';
import { Bot, Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import { getSpeechRecognition, SpeechRecognitionLike } from '@/lib/speech';

type CallState = 'idle' | 'connecting' | 'connected' | 'ended';
const speechLanguages: Record<LanguageCode, string> = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', mr: 'mr-IN', te: 'te-IN', ta: 'ta-IN' };

export default function CallAgentPage() {
  const { language } = useLanguage();
  const [callState, setCallState] = useState<CallState>('idle');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [callerText, setCallerText] = useState('');
  const [agentText, setAgentText] = useState('Tap the green button to call Farm Mitra.');
  const [dialled, setDialled] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = speechLanguages[language];
    voice.rate = 0.88;
    window.speechSynthesis.speak(voice);
  }, [language]);
  const answer = useCallback((question: string) => {
    if (!question.trim()) return;
    setCallerText(question);
    const response = getAgricultureHelpAnswer(question);
    setAgentText(response);
    speak(response);
  }, [speak]);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) { setSupported(false); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = speechLanguages[language];
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => answer(event.results[0][0].transcript);
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [language, answer]);

  useEffect(() => () => { if (connectTimer.current) clearTimeout(connectTimer.current); window.speechSynthesis?.cancel(); }, []);

  const startCall = () => {
    setCallState('connecting');
    setAgentText('Connecting securely to Farm Mitra…');
    connectTimer.current = setTimeout(() => {
      setCallState('connected');
      const greeting = `Namaste! I am Farm Mitra. You can speak in ${LANGUAGE_OPTIONS.find((item) => item.code === language)?.label || 'your language'}. How can I help your farm today?`;
      setAgentText(greeting);
      speak(greeting);
    }, 900);
  };
  const endCall = () => {
    if (connectTimer.current) clearTimeout(connectTimer.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setListening(false);
    setCallState('ended');
    setAgentText('Call ended. Tap green to call Farm Mitra again.');
  };
  const toggleListening = () => {
    if (!recognitionRef.current || callState !== 'connected') return;
    if (listening) recognitionRef.current.stop();
    else { recognitionRef.current.lang = speechLanguages[language]; recognitionRef.current.start(); }
  };

  const active = callState === 'connected' || callState === 'connecting';
  return <div className="max-w-md mx-auto pb-4">
    <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-[#082f28] via-[#0b4d3e] to-[#0b6b56] text-white p-5 shadow-2xl min-h-[680px] flex flex-col">
      <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-emerald-300/15 blur-3xl" /><div className="absolute bottom-10 -left-24 w-56 h-56 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="relative flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">FarmNexus Voice</p><h1 className="text-lg font-black">Call Farm Mitra</h1></div><span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${active ? 'bg-emerald-300/20 text-emerald-100' : 'bg-white/10 text-white/70'}`}>{callState === 'connected' ? 'LIVE AI CALL' : callState === 'connecting' ? 'CONNECTING' : 'READY'}</span></div>
      <div className="relative flex-1 flex flex-col items-center justify-center"><div className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-emerald-200 via-teal-300 to-cyan-200 p-1 shadow-[0_0_0_12px_rgba(110,231,183,0.10),0_0_60px_rgba(110,231,183,0.35)] ${callState === 'connected' ? 'animate-pulse' : ''}`}><div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center"><Bot className="w-16 h-16 text-emerald-200" /></div>{callState === 'connected' && <span className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-emerald-950" />}</div><h2 className="mt-6 text-2xl font-black">Farm Mitra</h2><p className="text-xs text-emerald-100 mt-1">Your multilingual farming assistant</p><div className="mt-5 text-center min-h-12 px-3"><p className="text-sm leading-relaxed text-white/95">{agentText}</p></div></div>
      <div className="relative space-y-3"><div className="bg-black/15 border border-white/10 rounded-2xl p-3 min-h-[62px]"><p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">You said</p><p className="text-xs text-white mt-1">{callerText || 'Speak after the call connects. Your words will appear here.'}</p></div>{listening && <div className="text-xs font-bold text-center text-emerald-100 animate-pulse flex items-center justify-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />Listening to you…</div>}{!supported && <div className="text-xs text-amber-100 bg-amber-500/20 p-2 rounded-xl text-center">This browser does not support voice input. Use Farm Mitra chat instead.</div>}
        {active && <div className="grid grid-cols-3 gap-2 pt-1">{['1','2','3','4','5','6','7','8','9','*','0','#'].map((key) => <button key={key} onClick={() => setDialled((value) => `${value}${key}`.slice(-12))} className="h-9 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold">{key}</button>)}</div>}
        {dialled && <p className="text-center text-xs tracking-[0.3em] text-emerald-100">{dialled}</p>}
        <div className="flex items-center justify-center gap-5 pt-2"><button onClick={active ? endCall : startCall} className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition active:scale-95 ${active ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-950/30' : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-950/30'}`} aria-label={active ? 'End Farm Mitra call' : 'Call Farm Mitra'}>{active ? <PhoneOff className="w-7 h-7" /> : <Phone className="w-7 h-7 text-emerald-950" />}</button>{callState === 'connected' && <button onClick={toggleListening} disabled={!supported} className={`w-14 h-14 rounded-full border border-white/20 flex items-center justify-center ${listening ? 'bg-rose-500' : 'bg-white/15 hover:bg-white/25'} disabled:opacity-40`} aria-label="Speak to Farm Mitra">{listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}</button>}<button onClick={() => speak(agentText)} className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center" aria-label="Repeat Farm Mitra answer"><Volume2 className="w-6 h-6" /></button></div><p className="text-center text-[11px] text-emerald-200 mt-2">{active ? 'Tap the microphone, ask your question, then hear the answer.' : 'Tap green to start • Red ends the call'}</p></div>
    </section>
  </div>;
}
