'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage, LANGUAGE_OPTIONS } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { getAgricultureHelpAnswer } from '@/lib/ai-service';
import { LanguageCode } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  MessageSquarePlus,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  Volume2,
  WifiOff,
} from 'lucide-react';
import { getSpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionLike } from '@/lib/speech';
import {
  AgentCallState,
  AvatarSpec,
  AVATAR_ACCENTS,
  AVATAR_SKINS,
  CallMessage,
  CallSessionRecord,
  callGreeting,
  DEFAULT_MITRA_AVATAR,
  detectCallLanguage,
  getSpeechLocale,
  LANGUAGE_CONFIRMATION_TEXT,
  loadCallHistory,
  saveCallSession,
  buildCallSummary,
  suggestNextActions,
  SuggestedAction,
} from '@/lib/farm-mitra-call';

const IDLE_PROMPT = 'Tap the green button to call Farm Mitra. Help is available for every crop, in six languages.';

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]).join('').toUpperCase() || 'R';
}

export default function CallAgentPage() {
  const { language } = useLanguage();
  const { user, activeFarm, cropCycles } = useFarmStore();

  const [callState, setCallState] = useState<AgentCallState>('ready');
  const [supported, setSupported] = useState(true);
  const [offline, setOffline] = useState(false);
  const [callLanguage, setCallLanguage] = useState<LanguageCode>(language);
  const [messages, setMessages] = useState<CallMessage[]>([]);
  const [interim, setInterim] = useState('');
  const [langConfirm, setLangConfirm] = useState<{ candidate: LanguageCode; reason: string } | null>(null);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedAction[]>([]);
  const [history, setHistory] = useState<CallSessionRecord[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [farmerAvatar, setFarmerAvatar] = useState<AvatarSpec>(() => {
    try {
      const raw = localStorage.getItem('farmnexus_farmer_avatar_v1');
      if (raw) return { kind: 'farmer', ...JSON.parse(raw) } as AvatarSpec;
    } catch { /* ignore */ }
    return { kind: 'farmer', skin: 'earth', accent: 'saffron', initials: '' };
  });
  const [inCall, setInCall] = useState(false);
  const [demoProfile] = useState({
    displayName: user?.name || 'Ramesh Patel',
    location: `${user?.village || ''}${user?.district ? `, ${user.district}` : ''}`,
    farmName: activeFarm?.name || '',
  });

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callStateRef = useRef<AgentCallState>('ready');
  const callLanguageRef = useRef<LanguageCode>(callLanguage);
  const speechSupportedRef = useRef(false);
  const startedAtRef = useRef<number | null>(null);
  const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  callStateRef.current = callState;
  callLanguageRef.current = callLanguage;

  const activeCrops = useMemo(
    () => cropCycles.filter((c) => c.status === 'active').map((c) => c.cropName),
    [cropCycles]
  );

  // Offline detection
  useEffect(() => {
    const apply = () => setOffline(!navigator.onLine);
    apply();
    window.addEventListener('online', apply);
    window.addEventListener('offline', apply);
    return () => {
      window.removeEventListener('online', apply);
      window.removeEventListener('offline', apply);
    };
  }, []);

  // Load local call history (device-only, privacy conscious)
  useEffect(() => {
    setHistory(loadCallHistory() || []);
  }, []);

  // Persist farmer avatar edits
  useEffect(() => {
    try {
      const { kind, ...rest } = farmerAvatar;
      void kind;
      localStorage.setItem('farmnexus_farmer_avatar_v1', JSON.stringify(rest));
    } catch { /* ignore */ }
  }, [farmerAvatar]);

  // Speech synthesis
  const speak = useCallback(
    (text: string) => {
      setSummary(null);
      if (!('speechSynthesis' in window)) {
        if (callStateRef.current === 'connecting' || callStateRef.current === 'thinking') setCallState('ready');
        return;
      }
      window.speechSynthesis.cancel();
      const voice = new SpeechSynthesisUtterance(text);
      voice.lang = getSpeechLocale(callLanguageRef.current);
      voice.rate = 0.88;
      voice.onstart = () => setCallState('speaking');
      voice.onend = () => {
        if (callStateRef.current === 'speaking') setCallState('ready');
      };
      voice.onerror = () => {
        if (callStateRef.current === 'speaking') setCallState('ready');
      };
      window.speechSynthesis.speak(voice);
    },
    []
  );

  const handleUtterance = useCallback(
    (transcript: string, final: boolean) => {
      const text = transcript.trim();
      if (!text) return;
      setInterim('');
      if (!final) {
        setInterim(text);
        return;
      }
      setMessages((prev) => [...prev, { id: `m${Date.now()}`, speaker: 'farmer', text, language: callLanguage, createdAt: Date.now() }]);
      const detected = detectCallLanguage(text, callLanguage);
      if (detected.mixed && detected.language !== callLanguage) {
        setLangConfirm({ candidate: detected.language, reason: LANGUAGE_CONFIRMATION_TEXT });
        speak(LANGUAGE_CONFIRMATION_TEXT);
        return;
      }
      setCallLanguage(detected.language);
      setCallState('thinking');
      setTimeout(() => {
        const response = getAgricultureHelpAnswer(text);
        setMessages((prev) => [...prev, { id: `m${Date.now()}`, speaker: 'mitra', text: response, language: detected.language, createdAt: Date.now() }]);
        speak(response);
      }, 500);
    },
    [callLanguage, speak]
  );

  // Speech recognition (one instance per call language)
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      speechSupportedRef.current = false;
      setSupported(false);
      return;
    }
    speechSupportedRef.current = true;
    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = getSpeechLocale(callLanguage);
    recognition.onstart = () => setCallState('listening');
    recognition.onend = () => {
      if (callStateRef.current === 'listening') setCallState('ready');
    };
    recognition.onerror = (event: SpeechRecognitionEvent) => {
      const reason = event.error || 'unknown';
      if (reason === 'not-allowed' || reason === 'service-not-allowed') {
        setError('Microphone access was blocked. Please allow the microphone in your browser, then try again.');
      } else if (reason === 'no-speech') {
        setError('I could not hear anything. Please speak again, or type your question below.');
      } else {
        setError('Voice input had a problem. Please try again, or type your question below.');
      }
      setCallState('ready');
    };
    recognition.onresult = (event) => {
      const results = event.results;
      if (!results || results.length === 0) return;
      const last = results[results.length - 1];
      const transcript = last?.[0]?.transcript || '';
      handleUtterance(transcript, !!last?.[0]?.isFinal);
    };
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [callLanguage, handleUtterance]);

  useEffect(() => () => {
    if (connectTimer.current) clearTimeout(connectTimer.current);
    window.speechSynthesis?.cancel();
  }, []);

  const startCall = useCallback(() => {
    if (offline) {
      setError('You are offline. Farm Mitra calls need an internet connection. Please reconnect and try again.');
      return;
    }
    setSummary(null);
    setSuggestions([]);
    setError('');
    setLangConfirm(null);
    setMessages([]);
    startedAtRef.current = Date.now();
    setCallState('connecting');
    setInCall(true);
    connectTimer.current = setTimeout(() => {
      const greeting = callGreeting(callLanguage);
      setMessages([
        { id: `m${Date.now()}`, speaker: 'mitra', text: greeting, language: callLanguage, createdAt: Date.now() },
      ]);
      speak(greeting);
      if (callStateRef.current === 'connecting') setTimeout(() => { if (callStateRef.current === 'connecting') setCallState('ready'); }, 1500);
    }, 800);
  }, [callLanguage, offline, speak]);

  const confirmLanguage = useCallback((code: LanguageCode) => {
    setLangConfirm(null);
    setCallLanguage(code);
    const greeting = callGreeting(code);
    setMessages((prev) => [...prev, { id: `m${Date.now()}`, speaker: 'mitra', text: greeting, language: code, createdAt: Date.now() }]);
    speak(greeting);
  }, [speak]);

  const endCall = useCallback(() => {
    if (connectTimer.current) clearTimeout(connectTimer.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setInterim('');
    setLangConfirm(null);
    setCallState('ended');
    setInCall(false);
    if (startedAtRef.current && messages.length > 0) {
      const session: CallSessionRecord = {
        id: `call-${startedAtRef.current}`,
        startedAt: startedAtRef.current,
        endedAt: Date.now(),
        language: callLanguage,
        messages,
      };
      saveCallSession(session);
      setHistory(loadCallHistory() || []);
      setSummary(buildCallSummary(messages, { farmName: activeFarm?.name }));
      setSuggestions(suggestNextActions(messages.map((m) => m.text).join(' ')));
    }
    startedAtRef.current = null;
  }, [callLanguage, messages, activeFarm]);

  const toggleMic = useCallback(() => {
    if (!inCall || callState === 'connecting') return;
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError('Voice input is not available in this browser. Please type your question below.');
      return;
    }
    if (callState === 'listening') {
      recognition.abort();
      setCallState('ready');
      return;
    }
    window.speechSynthesis?.cancel();
    setError('');
    setInterim('');
    try {
      recognition.lang = getSpeechLocale(callLanguageRef.current);
      recognition.start();
    } catch {
      setError('Could not start the microphone. Please try again.');
    }
  }, [inCall, callState]);

  const sendText = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (callState === 'connecting') return;
      setMessages((prev) => [...prev, { id: `m${Date.now()}`, speaker: 'farmer', text: trimmed, language: callLanguage, createdAt: Date.now() }]);
      setCallState('thinking');
      setTimeout(() => {
        const response = getAgricultureHelpAnswer(trimmed);
        setMessages((prev) => [...prev, { id: `m${Date.now()}`, speaker: 'mitra', text: response, language: callLanguage, createdAt: Date.now() }]);
        speak(response);
      }, 400);
    },
    [callLanguage, callState, speak]
  );

  const clearHistory = () => {
    try {
      localStorage.removeItem('farmnexus_call_history_v1');
      setHistory([]);
    } catch { /* ignore */ }
  };

  const setFarmerAvatarAttr = (part: Partial<Pick<AvatarSpec, 'skin' | 'accent'>>) => {
    setFarmerAvatar((prev) => ({ ...prev, ...part, kind: 'farmer' }));
  };

  const initials = farmerAvatar.initials || initialsOf(demoProfile.displayName || user?.name || 'R');

  const active = inCall;
  const stateLabel: Record<AgentCallState, string> = {
    ready: 'READY',
    connecting: 'CONNECTING',
    listening: 'LISTENING',
    thinking: 'THINKING',
    speaking: 'SPEAKING',
    error: 'RETRY',
    ended: 'ENDED',
  };

  return (
    <div className="max-w-5xl mx-auto px-3 py-4 pb-28">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        {/* CALL STAGE */}
        <section className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-b from-[#082f28] via-[#0b4d3e] to-[#0b6b56] text-white shadow-2xl border border-emerald-900/30">
          <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-emerald-300/15 blur-3xl motion-reduce:animate-none" />
          <div className="absolute bottom-10 -left-24 w-56 h-56 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">FarmNexus Voice</p>
              <h1 className="text-lg font-black flex items-center gap-2">Call Farm Mitra <Sparkles className="w-4 h-4 text-emerald-300" /></h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {offline && <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-rose-500/20 text-rose-100"><WifiOff className="w-3 h-3" />Offline</span>}
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${active ? 'bg-emerald-300/20 text-emerald-100' : 'bg-white/10 text-white/70'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-300 animate-pulse' : 'bg-white/40'} motion-reduce:animate-none`} />
                {stateLabel[callState]}
              </span>
            </div>
          </div>

          <div className="relative px-4 sm:px-6 pb-6">
            {/* Two avatars */}
            <div className="flex items-end justify-center gap-4 sm:gap-6 pt-2">
              <AvatarDuo
                mitra={DEFAULT_MITRA_AVATAR}
                farmer={{ ...farmerAvatar, initials }}
                speaking={callState === 'speaking' ? 'mitra' : callState === 'listening' || callState === 'thinking' ? 'farmer' : null}
              />
            </div>

            <div className="mt-4 text-center min-h-14">
              <p aria-live="polite" className="text-sm sm:text-base leading-relaxed text-white/95 max-w-xl mx-auto">
                {messages.length > 0 ? messages[messages.length - 1]?.text : IDLE_PROMPT}
              </p>
            </div>

            {langConfirm && (
              <div className="mt-3 rounded-2xl bg-amber-400/15 border border-amber-300/30 p-3 text-center">
                <p className="text-xs font-bold text-amber-100">{langConfirm.reason}</p>
                <div className="flex flex-wrap justify-center gap-1.5 mt-2">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => confirmLanguage(option.code)}
                      className={`text-[11px] font-black px-2.5 py-1.5 rounded-full border transition ${option.code === langConfirm.candidate ? 'bg-white text-emerald-900 border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                    >
                      {option.native}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-2xl bg-rose-500/15 border border-rose-300/30 p-3 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-200 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-100 min-w-0">
                  <p className="font-bold">{error}</p>
                  <button onClick={() => { setError(''); toggleMic(); }} className="mt-1.5 inline-flex items-center gap-1.5 bg-white text-rose-900 font-black px-3 py-1.5 rounded-full text-[11px] hover:bg-rose-100">
                    <Mic className="w-3.5 h-3.5" /> Retry microphone
                  </button>
                </div>
              </div>
            )}

            {/* Call controls */}
            <div className="mt-4 flex items-center justify-center gap-5">
              <button
                onClick={active ? endCall : startCall}
                className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition active:scale-95 focus-visible:ring-4 focus-visible:ring-emerald-300/40 focus-visible:outline-none ${active ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-950/30' : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-950/30'}`}
                aria-label={active ? 'End Farm Mitra call' : 'Call Farm Mitra'}
              >
                {active ? <PhoneOff className="w-7 h-7" /> : <Phone className="w-7 h-7 text-emerald-950" />}
              </button>
              {(active && callState !== 'connecting') && (
                <button
                  onClick={toggleMic}
                  disabled={!supported}
                  className={`w-14 h-14 rounded-full border border-white/20 flex items-center justify-center transition focus-visible:ring-4 focus-visible:ring-rose-300/40 focus-visible:outline-none disabled:opacity-40 ${callState === 'listening' ? 'bg-rose-500 animate-pulse motion-reduce:animate-none' : callState === 'thinking' || callState === 'speaking' ? 'bg-amber-500/80' : 'bg-white/15 hover:bg-white/25'}`}
                  aria-label={callState === 'listening' ? 'Stop listening' : 'Speak to Farm Mitra'}
                >
                  {callState === 'listening' ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              )}
              <button
                onClick={() => { const last = [...messages].reverse().find((m) => m.speaker === 'mitra'); if (last) speak(last.text); }}
                className={`w-14 h-14 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition focus-visible:ring-4 focus-visible:ring-emerald-300/40 focus-visible:outline-none ${active ? '' : 'opacity-50'}`}
                aria-label="Repeat Farm Mitra answer"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            <p className="text-center text-[11px] text-emerald-200 mt-3">
              {active
                ? callState === 'listening'
                  ? 'Listening… speak your question, then it will reach Farm Mitra.'
                  : callState === 'thinking'
                    ? 'Farm Mitra is thinking…'
                    : callState === 'speaking'
                      ? 'Farm Mitra is speaking… you can press the mic to interrupt.'
                      : 'Tap the microphone, ask your question, then hear the answer.'
                : 'Tap green to start • Red ends the call • Works on this device only'}
            </p>
            {!supported && (
              <p className="mt-2 text-center text-xs text-amber-100 bg-amber-500/20 p-2 rounded-xl">
                This browser does not support voice input — type your question below.
              </p>
            )}
          </div>
        </section>

        {/* SIDE PANEL */}
        <div className="space-y-4 min-w-0">
          {/* Live transcript */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-sm text-gray-900 flex items-center gap-2"><MessageSquarePlus className="w-4 h-4 text-emerald-700" />Call conversation</h2>
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{messages.length} lines</span>
            </div>
            <div role="log" aria-live="polite" className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-6">The live conversation will appear here.</p>
              ) : (
                messages.slice(-40).map((message) => (
                  <div key={message.id} className={`flex ${message.speaker === 'farmer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${message.speaker === 'farmer' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                      <p className="font-bold text-[9px] uppercase tracking-wide mb-0.5 text-gray-400">{message.speaker === 'farmer' ? 'You' : 'Farm Mitra'}</p>
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
              {interim && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs bg-emerald-50 text-gray-500 border border-dashed border-emerald-200">
                    <p className="italic">“{interim}”</p>
                  </div>
                </div>
              )}
            </div>
            {/* Text fallback */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const input = event.currentTarget.elements.namedItem('call-text') as HTMLInputElement;
                sendText(input.value);
                input.value = '';
              }}
              className="mt-3 flex gap-2"
            >
              <input
                name="call-text"
                type="text"
                placeholder="Type your question here…"
                className="min-w-0 flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-600"
                aria-label="Type your question to Farm Mitra"
              />
              <button type="submit" className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white w-11 rounded-xl flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none" aria-label="Send typed question"><Send className="w-4 h-4" /></button>
            </form>
          </section>

          {/* Call summary + next actions */}
          {summary && (
            <section className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><h2 className="font-black text-sm text-gray-900">Call summary</h2></div>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{summary}</p>
              {suggestions.length > 0 && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mt-3 mb-1.5">Suggested next steps</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map((s) => (
                      <a key={s.label} href={s.href || '/dashboard'} className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1.5 rounded-full transition">{s.label}</a>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {/* Farmer profile */}
          <FarmerProfileCard
            profile={demoProfile}
            avatar={{ ...farmerAvatar, initials }}
            activeCrops={activeCrops}
            onSkinChange={(skin) => setFarmerAvatarAttr({ skin })}
            onAccentChange={(accent) => setFarmerAvatarAttr({ accent })}
          />

          {/* Previous calls */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <button onClick={() => setHistoryOpen((value) => !value)} className="w-full flex items-center justify-between text-sm font-bold text-gray-800" aria-expanded={historyOpen}>
              <span className="flex items-center gap-2"><History className="w-4 h-4 text-sky-700" />Previous calls ({history.length})</span>
              {historyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {historyOpen && (
              <div className="mt-3 space-y-2">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">No saved calls yet. Call history stays on this device only.</p>
                ) : (
                  history.slice(0, 6).map((session) => (
                    <details key={session.id} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs">
                      <summary className="cursor-pointer font-bold text-gray-800 flex items-center justify-between gap-2">
                        <span className="truncate">{new Date(session.startedAt).toLocaleString()}</span>
                        <span className="bg-sky-100 text-sky-800 font-black px-1.5 py-0.5 rounded-full shrink-0">{session.messages.length} lines</span>
                      </summary>
                      <div className="mt-2 space-y-1.5">
                        {session.messages.slice(0, 6).map((m) => (
                          <p key={m.id} className="text-gray-600"><b className={m.speaker === 'farmer' ? 'text-emerald-700' : 'text-gray-900'}>{m.speaker === 'farmer' ? 'You: ' : 'Mitra: '}</b>{m.text.slice(0, 160)}{m.text.length > 160 ? '…' : ''}</p>
                        ))}
                      </div>
                    </details>
                  ))
                )}
                {history.length > 0 && (
                  <button onClick={clearHistory} className="w-full text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1 py-1.5"><Trash2 className="w-3.5 h-3.5" />Clear call history</button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AvatarDuo({ mitra, farmer, speaking }: { mitra: AvatarSpec; farmer: AvatarSpec; speaking: 'mitra' | 'farmer' | null }) {
  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <AvatarGraphic spec={farmer} speaking={speaking === 'farmer'} size="md" />
      <div className="flex flex-col items-center gap-1">
        <span className={`w-14 sm:w-20 border-t-2 border-dashed ${speaking ? 'border-emerald-300 animate-pulse motion-reduce:animate-none' : 'border-white/25'}`} />
        <span className="text-[10px] font-black text-emerald-200 tracking-widest">{speaking === 'farmer' ? '◄' : speaking === 'mitra' ? '►' : '· · ·'}</span>
      </div>
      <AvatarGraphic spec={mitra} speaking={speaking === 'mitra'} size="md" />
    </div>
  );
}

const SKIN_TONES: Record<AvatarSpec['skin'], string> = {
  sun: 'from-amber-300 via-amber-200 to-orange-200',
  earth: 'from-[#8d5a3b] via-[#a97247] to-[#c98f63]',
  warm: 'from-[#e8b88a] via-[#d99a6c] to-[#c07d52]',
};
const ACCENT_COLORS: Record<AvatarSpec['accent'], string> = {
  emerald: 'from-emerald-400 to-teal-500',
  saffron: 'from-orange-400 to-amber-500',
  sky: 'from-sky-400 to-blue-500',
  violet: 'from-violet-400 to-purple-500',
};
const ACCENT_TEXT: Record<AvatarSpec['accent'], string> = {
  emerald: 'bg-emerald-100 text-emerald-800',
  saffron: 'bg-orange-100 text-orange-800',
  sky: 'bg-sky-100 text-sky-800',
  violet: 'bg-violet-100 text-violet-800',
};
const SKIN_TEXT: Record<AvatarSpec['skin'], string> = {
  sun: 'bg-amber-100 text-amber-800',
  earth: 'bg-orange-100 text-orange-900',
  warm: 'bg-rose-100 text-rose-900',
};

function AvatarGraphic({ spec, speaking, size = 'lg' }: { spec: AvatarSpec; speaking: boolean; size?: 'md' | 'lg' }) {
  const isMitra = spec.kind === 'mitra';
  const wrap = size === 'lg' ? 'w-28 h-28 sm:w-36 sm:h-36' : 'w-24 h-24 sm:w-32 sm:h-32';
  const icon = spec.initials ? spec.initials.slice(0, 2) : isMitra ? 'FM' : '';
  return (
    <div className="flex flex-col items-center">
      <div className={`relative rounded-full bg-gradient-to-br ${SKIN_TONES[spec.skin]} p-1 ${wrap} shadow-[0_0_0_10px_rgba(110,231,183,0.10),0_0_50px_rgba(110,231,183,0.30)] transition-transform ${speaking ? 'scale-105' : ''}`}>
        <div className="w-full h-full rounded-full bg-clip-text flex items-center justify-center relative overflow-hidden">
          <div className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t ${ACCENT_COLORS[spec.accent]} ${speaking ? 'animate-pulse motion-reduce:animate-none' : ''} opacity-90`} />
          <span className={`relative text-xl sm:text-2xl font-black ${isMitra ? 'text-emerald-950' : 'text-white'} drop-shadow-sm`}>{icon}</span>
          {isMitra && <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/90" />}
          {!isMitra && <span className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/70" />}
        </div>
        {speaking && (
          <span className="absolute -inset-1.5 rounded-full border-2 border-emerald-300/60 animate-ping motion-reduce:animate-none" />
        )}
      </div>
      <span className="mt-2 text-xs font-black text-emerald-50">{isMitra ? 'Farm Mitra' : 'You'}</span>
      <span className="text-[9px] text-emerald-200">{isMitra ? 'AI Farm Assistant' : 'Farmer'}</span>
    </div>
  );
}

function FarmerProfileCard({
  profile,
  avatar,
  activeCrops,
  onSkinChange,
  onAccentChange,
}: {
  profile: { displayName: string; location: string; farmName: string };
  avatar: AvatarSpec;
  activeCrops: string[];
  onSkinChange: (skin: AvatarSpec['skin']) => void;
  onAccentChange: (accent: AvatarSpec['accent']) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-black text-gray-700">{avatar.initials}</div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-sm text-gray-900 truncate">{profile.displayName}</p>
          <p className="text-[11px] text-gray-500 truncate">{profile.farmName}{profile.location ? ` · ${profile.location}` : ''}</p>
          {activeCrops.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {activeCrops.map((crop) => <span key={crop} className="text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-full">{crop}</span>)}
            </div>
          )}
        </div>
        <button onClick={() => setOpen((value) => !value)} className="shrink-0 text-xs font-bold text-emerald-700" aria-expanded={open}>{open ? 'Done' : 'Edit avatar'}</button>
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Colour shade</p>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_SKINS.map((skin) => (
                <button key={skin} onClick={() => onSkinChange(skin)} className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full border transition ${avatar.skin === skin ? 'ring-2 ring-emerald-600' : ''} ${SKIN_TEXT[skin]}`}>{skin}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Scarf / accent</p>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_ACCENTS.map((accent) => (
                <button key={accent} onClick={() => onAccentChange(accent)} className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full border transition ${avatar.accent === accent ? 'ring-2 ring-emerald-600' : ''} ${ACCENT_TEXT[accent]}`}>{accent}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Preview</p>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <AvatarGraphic spec={avatar} speaking={false} size="md" />
              <div className="text-xs text-gray-600 space-y-0.5">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Farmer speaker looks like this on your call</p>
                <p>Initials change automatically from your name.</p>
                <p className="text-[10px] text-gray-400">Stored on this device only.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <p className="mt-3 text-[10px] text-gray-400 flex items-center gap-1"><RotateCcw className="w-3 h-3" />Feeds and answers prepared from FarmNexus help knowledge. No call leaves this device.</p>
    </section>
  );
}