import { LanguageCode } from '@/types';

export type AgentCallState = 'ready' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error' | 'ended';
export type CallSpeaker = 'farmer' | 'mitra' | 'system';

export interface CallMessage {
  id: string;
  speaker: CallSpeaker;
  text: string;
  language: LanguageCode;
  createdAt: number;
}

export interface FarmerCallProfile {
  displayName: string;
  location?: string;
  farmName?: string;
  primaryCrops?: string[];
  avatar: { skin: 'sun' | 'earth' | 'warm'; scarf: 'emerald' | 'saffron' | 'sky'; initials: string };
}

export interface FarmMitraContext {
  profile?: FarmerCallProfile;
  activeCrops?: string[];
  farmName?: string;
  /** Future adapters can attach weather, prices, records, images and reminders here. */
  integrations?: Record<string, unknown>;
}

export const CALL_LANGUAGES: Array<{ code: LanguageCode; label: string; native: string; speechLocale: string }> = [
  { code: 'en', label: 'English', native: 'English', speechLocale: 'en-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', speechLocale: 'hi-IN' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', speechLocale: 'mr-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', speechLocale: 'te-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', speechLocale: 'ta-IN' },
];

export const getSpeechLocale = (language: LanguageCode) => CALL_LANGUAGES.find((item) => item.code === language)?.speechLocale || 'en-IN';

const scriptLanguage: Array<[LanguageCode, RegExp]> = [
  ['hi', /[\u0900-\u097F]/], ['kn', /[\u0C80-\u0CFF]/], ['mr', /[\u0900-\u097F]/],
  ['te', /[\u0C00-\u0C7F]/], ['ta', /[\u0B80-\u0BFF]/],
];
const wordLanguage: Array<[LanguageCode, RegExp]> = [
  ['hi', /\b(namaste|krishi|paani|fasal|kheti|madad)\b/i], ['kn', /\b(namaskara|neeru|beley|sahaaya)\b/i],
  ['mr', /\b(namaskar|paani|sheti|madat)\b/i], ['te', /\b(namaskaram|neeru|panta|sahayam)\b/i],
  ['ta', /\b(vanakkam|neer|payir|uthavi)\b/i],
];

/** Lightweight local hint only; browsers still transcribe in the selected locale. */
export function detectCallLanguage(text: string, fallback: LanguageCode): { language: LanguageCode; mixed: boolean } {
  const matches = [...scriptLanguage, ...wordLanguage].filter(([, pattern]) => pattern.test(text)).map(([language]) => language);
  const unique: LanguageCode[] = [];
  for (const language of matches) {
    if (!unique.includes(language)) unique.push(language);
  }
  return { language: unique[0] || fallback, mixed: unique.length > 1 };
}

export function callGreeting(language: LanguageCode) {
  const greetings: Record<LanguageCode, string> = {
    en: 'Namaste! I am Farm Mitra. You can speak naturally. What would you like help with today?',
    hi: 'नमस्ते! मैं फार्म मित्र हूँ। आप अपनी भाषा में आराम से बोल सकते हैं। आज मैं आपकी कैसे मदद करूँ?',
    kn: 'ನಮಸ್ಕಾರ! ನಾನು ಫಾರ್ಮ್ ಮಿತ್ರ. ನೀವು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸಹಜವಾಗಿ ಮಾತನಾಡಬಹುದು. ಇಂದು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    mr: 'नमस्कार! मी फार्म मित्र आहे. तुम्ही तुमच्या भाषेत सहज बोलू शकता. आज मी कशी मदत करू?',
    te: 'నమస్కారం! నేను ఫార్మ్ మిత్రను. మీరు మీ భాషలో సహజంగా మాట్లాడవచ్చు. ఈ రోజు నేను ఎలా సహాయం చేయగలను?',
    ta: 'வணக்கம்! நான் ஃபார்ம் மித்ரா. உங்கள் மொழியில் இயல்பாகப் பேசலாம். இன்று எப்படி உதவலாம்?',
  };
  return greetings[language];
}

export function languageConfirmation(language: LanguageCode) {
  const label = CALL_LANGUAGES.find((item) => item.code === language)?.native || 'English';
  return `I may have heard more than one language. Would you like me to continue in ${label}? You can also choose a language below.`;
}

export const LANGUAGE_CONFIRMATION_TEXT =
  'I heard more than one language in your question. Please choose the language you want me to answer in below.';

/* ------------------------------------------------------------------ */
/* Reusable agent foundation: avatars, sessions, summaries, next steps */
/* ------------------------------------------------------------------ */

export type AvatarSkin = 'sun' | 'earth' | 'warm';
export type AvatarAccent = 'emerald' | 'saffron' | 'sky' | 'violet';
export type AvatarKind = 'mitra' | 'farmer';

export interface AvatarSpec {
  kind: AvatarKind;
  skin: AvatarSkin;
  accent: AvatarAccent;
  initials: string;
}

export const AVATAR_SKINS: AvatarSkin[] = ['sun', 'earth', 'warm'];
export const AVATAR_ACCENTS: AvatarAccent[] = ['emerald', 'saffron', 'sky', 'violet'];

export const DEFAULT_MITRA_AVATAR: AvatarSpec = { kind: 'mitra', skin: 'warm', accent: 'emerald', initials: 'FM' };

/** One saved call in local history (privacy-conscious: stays on device). */
export interface CallSessionRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  language: LanguageCode;
  messages: CallMessage[];
}

export const CALL_HISTORY_KEY = 'farmnexus_call_history_v1';
export const MAX_SAVED_CALLS = 10;

export function loadCallHistory(): CallSessionRecord[] | null {
  try {
    const raw = localStorage.getItem(CALL_HISTORY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCallSession(session: CallSessionRecord) {
  try {
    const existing = loadCallHistory() || [];
    const next = [session, ...existing.filter((s) => s.id !== session.id)].slice(0, MAX_SAVED_CALLS);
    localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota / privacy mode
  }
}

export function buildCallSummary(messages: CallMessage[], profile?: FarmMitraContext): string {
  const mitraLines: string[] = [];
  const farmerLines: string[] = [];
  for (const message of messages) {
    if (message.speaker === 'mitra') mitraLines.push(message.text);
    else if (message.speaker === 'farmer') farmerLines.push(message.text);
  }
  const summary: string[] = [`Call completed with ${farmerLines.length} question${farmerLines.length === 1 ? '' : 's'} and ${mitraLines.length} answer${mitraLines.length === 1 ? '' : 's'}.`];
  if (farmerLines.length > 0 && mitraLines.length > 0) {
    const lastAnswered = [...messages].reverse().find((m) => m.speaker === 'mitra');
    if (lastAnswered) summary.push(lastAnswered.text);
  } else if (farmerLines.length === 0) {
    summary.push('No spoken questions were recorded during this call.');
  }
  if (profile?.farmName) summary.push(`Farm: ${profile.farmName}.`);
  return summary.join('\n');
}

export interface SuggestedAction {
  label: string;
  href?: string;
  topic: 'inventory' | 'tasks' | 'calculator' | 'weather' | 'reports' | 'crop-doctor' | 'farm' | 'money';
}

export function suggestNextActions(question: string): SuggestedAction[] {
  const text = question.toLowerCase();
  const actions: SuggestedAction[] = [];
  if (/water|irrig|rain|soil|drip|पानी|ಸಿಂಚನ|నీరు|பாசன/i.test(text)) actions.push({ label: 'Check rain forecast', href: '/weather', topic: 'weather' });
  if (/pest|insect|disease|yellow|boroer|spray|कीट|ರೋಗ|తెగులు|பூச்சி/i.test(text)) actions.push({ label: 'Open Crop Doctor', href: '/ai-assistant', topic: 'crop-doctor' });
  if (/seed|fertili|fertiliz|input|stock|खाद|ಬೀಜ|ఎరువు|உரம்/i.test(text)) actions.push({ label: 'Check input stock', href: '/inventory', topic: 'inventory' });
  if (/market|price|mandi|sale|बाजार|ಮಾರುಕಟ್ಟೆ|మార్కెట్|சந்தை/i.test(text)) actions.push({ label: 'See mandi prices', href: '/mandi-prices', topic: 'reports' });
  if (/labour|worker|wage|मजदूर|ಕೂಲಿ|కూలీ|தொழிலாளர்/i.test(text)) actions.push({ label: 'Record labour cost', href: '/money', topic: 'money' });
  if (/harvest|pick|कटाई|கொயில்/i.test(text)) actions.push({ label: 'Log harvest', href: '/harvest', topic: 'farm' });
  if (/task|remind|plan|टास्क/i.test(text)) actions.push({ label: 'Plan farm task', href: '/tasks', topic: 'tasks' });
  if (/profit|loss|expense|cost|लाभ|ನಷ್ಟ|లాభం|லாபம்/i.test(text)) actions.push({ label: 'View profit & loss', href: '/reports', topic: 'reports' });
  if (actions.length === 0) actions.push({ label: 'Open farm dashboard', href: '/dashboard', topic: 'farm' });
  return actions.slice(0, 4);
}
