import { LanguageCode } from '@/types';

export type AgentCallState = 'ready' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error' | 'ended';
export type CallSpeaker = 'farmer' | 'mitra' | 'system';

export interface CallMessage {
  id: string;
  speaker: CallSpeaker;
  text: string;
  language: LanguageCode;
  createdAt: number;
  /** Round-trip response time in ms (user speech end → AI speech start). Only set on mitra messages. */
  responseTimeMs?: number;
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
    en: 'Namaste! I am Farm Mitra. I am listening. Tell me about your farm, your crops, or any problem you are facing and I will help you step by step.',
    hi: 'नमस्ते! मैं फार्म मित्र हूँ। मैं सुन रहा हूँ। अपने खेत, फसल, या किसी भी समस्या के बारे में बताएं और मैं आपकी कदम-दर-कदम मदद करूँगा।',
    kn: 'ನಮಸ್ಕಾರ! ನಾನು ಫಾರ್ಮ್ ಮಿತ್ರ. ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ. ನಿಮ್ಮ ಹೊಲ, ಬೆಳೆ, ಅಥವಾ ಯಾವುದೇ ಸಮಸ್ಯೆಯ ಬಗ್ಗೆ ಹೇಳಿ, ನಾನು ಹಂತ ಹಂತವಾಗಿ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    mr: 'नमस्कार! मी फार्म मित्र आहे. मी ऐकत आहे. तुमचा शेत, पिक, किंवा कोणत्याही समस्येबद्दल सांगा आणि मी तुम्हाला टप्प्यांनी मदत करेन.',
    te: 'నమస్కారం! నేను ఫార్మ్ మిత్రను. నేను వింటున్నాను. మీ పొలం, పంట లేదా ఏదైనా సమస్య గురించి చెప్పండి, నేను దశలవారీగా సహాయం చేస్తాను.',
    ta: 'வணக்கம்! நான் ஃபார்ம் மித்ரா. நான் கேட்டுக்கொண்டிருக்கிறேன். உங்கள் நிலம், பயிர் அல்லது ஏதேனும் பிரச்சனை பற்றி சொல்லுங்கள், நான் படிப்படியாக உதவுவேன்.',
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

/* ------------------------------------------------------------------ */
/* Conversation Context: builds memory from prior messages             */
/* ------------------------------------------------------------------ */

export interface ConversationContext {
  topicsDiscussed: string[];
  lastQuestion: string;
  lastAnswer: string;
  turnCount: number;
  mentionedCrops: string[];
  mentionedProblems: string[];
}

/** Summarize the conversation so far into structured context for follow-up responses. */
export function buildConversationContext(messages: CallMessage[]): ConversationContext {
  const farmerMessages = messages.filter((m) => m.speaker === 'farmer');
  const mitraMessages = messages.filter((m) => m.speaker === 'mitra');

  const topicsDiscussed: string[] = [];
  const mentionedCrops: string[] = [];
  const mentionedProblems: string[] = [];

  const cropWords = [
    'tomato','onion','chilli','potato','rice','wheat','cotton','maize','groundnut','sugarcane',
    'soybean','cabbage','cauliflower','brinjal','okra','beans','peas','turmeric','ginger','garlic',
    'cardamom','banana','mango','grapes','pomegranate','coconut','betel','areca','tobacco',
    'tomatoes','onions','chillies','potatoes',
    'tomato','onion','chilli','potato','rice','wheat','cotton','maize','groundnut','sugarcane',
    'soybean','cabbage','cauliflower','brinjal','okra','beans','peas','turmeric','ginger','garlic',
    'cardamom','banana','mango','grapes','pomegranate','coconut',
    'tomato','tomatoes','onion','onions','chilli','chillies','potato','potatoes',
  ];
  const problemWords = ['yellow','pest','disease','worm','borer','wilt','blight','rot','spot','curl',
    'drought','flood','waterlog','nutrient','deficien','stunt','dieback','fusarium','aphid','whitefly',
    'thrip','mite','nematode','rust','mildew','mealybug','scale','armyworm','cutworm','yellowing',
    'wilting','drooping','burn','scorch','frost','heat','storm','pesticide','herbicide','spray',
    'fungicide','insecticide'];
  const cropPattern = new RegExp('\\b(' + cropWords.join('|') + ')\\b', 'i');
  const problemPattern = new RegExp('\\b(' + problemWords.join('|') + ')\\b', 'i');

  for (const msg of farmerMessages) {
    const text = msg.text.toLowerCase();
    // Detect topics
    if (/water|irrig|rain|drip|drain/i.test(text)) topicsDiscussed.push('irrigation');
    if (/pest|insect|worm|bug|spray|pesticide/i.test(text)) topicsDiscussed.push('pest_control');
    if (/fertili|manure|npk|nutrient|urea|compost/i.test(text)) topicsDiscussed.push('fertilizer');
    if (/seed|sow|plant|transplant|nursery/i.test(text)) topicsDiscussed.push('planting');
    if (/harvest|pick|storage|crate|maturity/i.test(text)) topicsDiscussed.push('harvesting');
    if (/price|mandi|market|sale|buyer|sell/i.test(text)) topicsDiscussed.push('market');
    if (/weather|temperature|rain|forecast|storm|wind/i.test(text)) topicsDiscussed.push('weather');
    if (/soil|land|field|plot|ground/i.test(text)) topicsDiscussed.push('soil');
    if (/labour|worker|wage|hire|employ/i.test(text)) topicsDiscussed.push('labour');
    if (/disease|infect|fungal|bacterial|viral|wilt|blight|rot/i.test(text)) topicsDiscussed.push('disease');
    if (/cost|expense|profit|loss|income|money|invest/i.test(text)) topicsDiscussed.push('finance');

    // Detect crops
    const cropMatches = text.match(cropPattern);
    if (cropMatches) {
      for (const crop of cropMatches) {
        if (!mentionedCrops.includes(crop)) mentionedCrops.push(crop);
      }
    }

    // Detect problems
    if (problemPattern.test(text)) {
      mentionedProblems.push(msg.text.slice(0, 80));
    }
  }

  const lastFarmer = [...farmerMessages].pop();
  const lastMitra = [...mitraMessages].pop();

  return {
    topicsDiscussed: Array.from(new Set(topicsDiscussed)),
    lastQuestion: lastFarmer?.text || '',
    lastAnswer: lastMitra?.text || '',
    turnCount: farmerMessages.length,
    mentionedCrops: mentionedCrops.slice(0, 5),
    mentionedProblems: mentionedProblems.slice(0, 3),
  };
}

/* ------------------------------------------------------------------ */
/* Context-Aware AI Response Engine                                    */
/* ------------------------------------------------------------------ */

type IntentType = 'pest' | 'water' | 'fertilizer' | 'harvest' | 'seed' | 'weather' | 'market' | 'disease' | 'soil' | 'labour' | 'finance' | 'greeting' | 'general';

interface IntentMatch {
  intent: IntentType;
  confidence: number;
}

function detectIntent(text: string): IntentMatch {
  const lower = text.toLowerCase();

  // Greeting detection
  if (/^(hi|hello|namaste|hey|good\s*(morning|afternoon|evening)|namaskar|namaskara|vanakkam)/i.test(lower)) {
    return { intent: 'greeting', confidence: 0.95 };
  }

  // Follow-up detection (pronouns, references)
  const isFollowUp = /\b(it|that|this|those|them|they|the\s*(crop|plant|field|soil|pest|disease|problem|issue))\b/i.test(lower) ||
    /^(yes|no|ok|okay|sure|please|explain|tell me more|how|why|what about|and|also|then|next|what else|can you|should i|do i|will it)/i.test(lower);

  const intents: Array<[IntentType, RegExp, number]> = [
    ['pest', /pest|insect|worm|bug|borer|whitefly|aphid|thrip|mite|nematode|caterpillar|beetle|grasshopper|कीट|ಕೀಟ|పురుగు|பூச்சி|कीड़ा/i, 0.9],
    ['disease', /disease|infect|fungal|bacterial|viral|wilt|blight|rot|spot|rust|mildew|curl|mosaic|yellowing|leaves|leaf|पत्ती|ರೋಗ|తెగులு|நோய்/i, 0.85],
    ['water', /water|irrig|drip|rain|drainage|moisture|wet|flood|waterlog|पानी|ಸಿಂಚನ|నీరு|பாசனம்|सिंचाई|ನೀರು/i, 0.88],
    ['fertilizer', /fertili|manure|npk|nutrient|nitrogen|urea|phosph|potash|compost|vermicompost|खाद|ಗೊಬ್ಬರ|ఎరువు|உரம்|उर्वरक/i, 0.88],
    ['harvest', /harvest|pick|storage|maturity|crate|grade|sort|post.harvest|कटाई|ಕೊಯ್ಲು|కోత|அறுவடை/i, 0.85],
    ['seed', /seed|sow|plant|transplant|nursery|germinat|sprout|बीज|ಬೀజ|విత్తన|விதை|रोपाई/i, 0.85],
    ['weather', /weather|temperature|forecast|storm|wind|frost|heat|cold|season|climate|मौसम|ಹವಾಮಾನ|వాతావరణ|வானிலை/i, 0.85],
    ['market', /price|mandi|market|sale|buyer|sell|rate|commission|trade|बाज़ार|ಮಾರುಕಟ್ಟೆ|మార్కెట్|சந்தை/i, 0.85],
    ['soil', /soil|land|field|plot|ground|ph|organic matter|texture|clay|sandy|loam|मिट्टी|ನೆಲ|మట్టి|மண்/i, 0.8],
    ['labour', /labour|worker|wage|hire|employ|staff|mazdoor|कामगार|ಕೂಲಿ|కూలీ|தொழிலாளர்/i, 0.85],
    ['finance', /cost|expense|profit|loss|income|money|invest|budget|save|spend|लाभ|ನಷ್ಟ|లాభం|லாபம்/i, 0.8],
  ];

  let bestMatch: IntentMatch = { intent: 'general', confidence: 0 };

  for (const [intent, pattern, confidence] of intents) {
    if (pattern.test(lower)) {
      const adjustedConfidence = isFollowUp ? confidence + 0.05 : confidence;
      if (adjustedConfidence > bestMatch.confidence) {
        bestMatch = { intent, confidence: Math.min(adjustedConfidence, 1) };
      }
    }
  }

  return bestMatch;
}

/** Context-aware agriculture help — builds on prior conversation. */
export function getContextualHelpAnswer(question: string, context?: ConversationContext, activeCrops?: string[]): string {
  const intent = detectIntent(question);
  const crop = context?.mentionedCrops?.[0] || activeCrops?.[0] || '';
  const cropRef = crop ? ` your ${crop}` : '';
  const isFollowUp = context && context.turnCount > 0;

  // Greeting responses — adapt based on conversation state
  if (intent.intent === 'greeting') {
    if (isFollowUp) {
      return `Yes, I am still here with you. We were talking about${cropRef ? ` ${crop} ` : ' '}farming. What would you like to know next? You can ask about pests, irrigation, fertilizer, harvest, market prices, or anything else about your farm.`;
    }
    return `Namaste! I am ready to help. I can assist you with crop care, pest control, irrigation planning, fertilizer advice, harvest guidance, market prices, and farm records. What is on your mind today?`;
  }

  // If the user says yes/no/ok — respond to the implicit follow-up
  if (/^(yes|yeah|yep|sure|ok|okay|haan|ha|ဟ\.?\s*ဟ|அ|అయ్యే|ಹೌದು)/i.test(question.trim())) {
    if (isFollowUp) {
      const lastTopic = context.topicsDiscussed[context.topicsDiscussed.length - 1];
      const topicResponses: Record<string, string> = {
        pest: `Good. For${cropRef} pest management, remember: identify the pest first using a sticky trap or by inspecting leaves early morning. Remove badly damaged parts, then use a targeted pesticide only if the infestation is above the economic threshold. Would you like me to go deeper into organic options or chemical control?`,
        water: `Great. For${cropRef} irrigation, the key is consistent moisture — not too wet, not too dry. Check the soil at 5 to 8 cm depth before each watering. With drip systems, shorter more frequent cycles work better. Should I explain scheduling based on your crop stage?`,
        fertilizer: `Understood. For${cropRef} nutrition, always start with what the soil needs — a soil test saves money and prevents overuse. Apply balanced doses in split timings through the season. Do you want to know the right NPK ratio for your specific crop?`,
        harvest: `Yes. For${cropRef} harvesting, pick during cool morning hours, keep produce shaded immediately, and sort by grade. Use clean, ventilated crates. Would you like guidance on post-harvest storage or market timing?`,
        market: `Sure. Check nearby mandi prices before transporting. Factor in transport cost, commission, and grading deductions to calculate your net return. Do you want me to help you compare prices across different markets?`,
        weather: `Right. Based on the weather factors, adjust your irrigation and spraying schedule accordingly. Avoid spraying before rain. Would you like specific advice for the current conditions?`,
        disease: `Yes, for disease management in${cropRef}, early detection is critical. Remove affected leaves, improve air circulation, and apply the right fungicide or bactericide at the correct stage. Do you want organic or chemical control options?`,
        soil: `Good point. Soil health is the foundation. Test pH, check organic matter, and ensure proper drainage. Would you like to know how to improve your specific soil type?`,
        labour: `Understood. For labour management, plan work in advance, assign clear tasks each morning, and keep a daily record of workers, wages, and work done. This helps at payment time and for your records. Need help with any specific labour planning?`,
        finance: `Yes, tracking finances carefully is important. Record every expense and income. Would you like help calculating your cost per box or profit margin for this season?`,
        planting: `For${cropRef} planting, use quality seed or healthy seedlings, maintain proper spacing, and keep soil moist during the first critical week. Do you need advice on nursery management or transplanting technique?`,
        general: `I understand. Let me know more details about what specifically you need help with — the crop name, the exact problem, and how long it has been happening — and I will give you the best advice.`,
      };
      return topicResponses[lastTopic] || topicResponses.general;
    }
    return `I am glad. Tell me more about what you need help with on your farm — I am here to assist with anything from crop care to market guidance.`;
  }

  // If the user says no
  if (/^(no|nah|nope|nahi|नहीं|ಇಲ್ಲ|లేదு|இல்லை)/i.test(question.trim())) {
    if (isFollowUp) {
      return `No problem. Is there something else about${cropRef ? ` ${crop} ` : ' '}your farm I can help with? I can assist with any farming topic — just describe your situation.`;
    }
    return `That is fine. Is there another topic I can help you with today?`;
  }

  // If user asks "what else" or "tell me more" or similar
  if (/^(what else|tell me more|continue|go on|aur|और|ಇನ್ನು|ఇంకా|மேலும்|anything else)/i.test(question.trim())) {
    if (isFollowUp) {
      const allTopics = context.topicsDiscussed;
      const suggestions: string[] = [];
      if (!allTopics.includes('weather')) suggestions.push('weather forecast');
      if (!allTopics.includes('market')) suggestions.push('mandi prices');
      if (!allTopics.includes('finance')) suggestions.push('profit and loss');
      if (!allTopics.includes('labour')) suggestions.push('labour planning');
      if (suggestions.length > 0) {
        return `We have covered several topics already. You could also ask about ${suggestions.slice(0, 2).join(' and ')}. Or describe any other concern about${cropRef} and I will help.`;
      }
      return `We have discussed quite a lot! Is there anything specific you want to revisit or any new question about your farm?`;
    }
    return `Sure, I have plenty more I can help with. Ask me about pest control, irrigation, fertilizer, harvesting, market prices, soil health, weather, or farm records. What interests you?`;
  }

  // Context-aware responses by intent
  const responseMap: Record<IntentType, () => string> = {
    greeting: () => {
      if (isFollowUp) return `Yes, I am still here. What would you like to know next?`;
      return `Namaste! I am ready to help. What is on your mind today?`;
    },
    pest: () => {
      const base = crop
        ? `For ${crop}, pest management starts with correct identification.`
        : 'Pest management starts with correct identification of the pest.';
      if (isFollowUp && context.lastAnswer) {
        return `${base} Building on what we discussed, here are more details: Inspect plants early morning when pests are most active. Use yellow sticky traps for sucking pests like aphids and whiteflies. For borers, look for fresh frass near entry holes. Remove and destroy badly damaged fruits. Use pheromone traps to monitor moth activity. Should I recommend specific organic or chemical treatments for your situation?`;
      }
      return `${base} First, check how many plants are affected. Remove badly damaged leaves or fruits. Use yellow sticky traps for sucking pests. Inspect plants in the early morning when insects are most active. Use only a pesticide registered for your specific crop and pest. Always follow the label rate and pre-harvest interval. For organic options, try neem oil spray at 2ml per litre. Would you like more detail on organic or chemical control?`;
    },
    water: () => {
      const base = crop
        ? `For ${crop}, water management is critical for good yield.`
        : 'Water management is critical for good crop yield.';
      if (isFollowUp && context.lastAnswer) {
        return `${base} To go further: With drip irrigation, check soil moisture at 5 to 8 cm depth before each cycle. After rain, always clear drainage channels to prevent waterlogging. Adjust frequency based on crop stage — young plants need less water, fruiting stage needs more. Avoid watering during peak afternoon heat. Morning irrigation is best. Do you want me to suggest a specific schedule?`;
      }
      return `${base} Keep soil moisture even — not waterlogged and not dry. With drip irrigation, use shorter regular cycles and check soil 5 to 8 cm below the surface before watering again. After rain, clear drainage channels and avoid spraying until foliage dries completely. Adjust the schedule based on your crop stage, soil type, and current weather. Morning irrigation is generally best. Would you like a specific irrigation schedule?`;
    },
    fertilizer: () => {
      const base = crop
        ? `For ${crop}, nutrition management should be based on soil test results.`
        : 'Crop nutrition should always be guided by soil test results.';
      if (isFollowUp) {
        return `${base} More details: Apply fertilizer in 2 to 3 split doses through the season rather than all at once. Use a balanced NPK ratio appropriate for the crop stage. During vegetative growth, higher nitrogen is needed. During flowering and fruiting, increase phosphorus and potassium. Organic options include vermicompost at 2 to 3 tonnes per acre and neem cake at 200 kg per acre. Always keep irrigation regular after fertilizer application. Need help calculating the right dose?`;
      }
      return `${base} Do not apply fertilizer just because leaves look weak — overuse can damage roots and reduce flowering. Apply smaller balanced doses in split timings through the season. Keep irrigation regular after application. Use organic options like vermicompost and neem cake for long-term soil health. Consult your local agriculture officer for the correct product and dose for your specific crop and soil. Want me to explain the right approach for your crop?`;
    },
    harvest: () => {
      if (isFollowUp) {
        return `For harvest, also remember: Keep a record of boxes, weight, grade, and date. This data helps you track yield trends over seasons and negotiate better at the mandi. Sort damaged or low-grade produce separately. For long-distance transport, harvest at a slightly earlier maturity stage. Would you like help logging your harvest in the app?`;
      }
      return 'Harvest in the cool part of the day, ideally early morning. Keep produce shaded immediately after picking. Sort damaged or lower-grade produce separately. Use clean, ventilated crates — avoid stacking too heavy. Check nearby mandi prices before transport and record all transport and commission costs. For long travel, harvest at the maturity stage suitable for the buyer and distance. Would you like me to help you log your harvest?';
    },
    seed: () => {
      if (isFollowUp) {
        return `For planting, also keep in mind: Hardening seedlings before transplanting reduces transplant shock. Keep soil consistently moist for the first 7 to 10 days after transplanting. Mulching after transplanting helps retain moisture and suppress weeds. Do you need advice on a specific planting method for your crop?`;
      }
      return 'Start with quality seed or healthy seedlings from a reliable source. Use a clean nursery medium and maintain proper temperature for germination. Transplant only after seedlings are hardened. Keep recommended crop spacing so air moves through the plants. During the first week after transplanting, keep soil moist but never waterlogged. Mulching helps retain moisture. Would you like specific guidance for your crop?';
    },
    weather: () => {
      if (isFollowUp) {
        return `For weather-related planning, also consider: Cover young plants before extreme heat or cold. Delay fertilizer application if heavy rain is expected — nutrients will wash away. Monitor humidity levels for fungal disease risk. High humidity plus warm temperature is a strong signal for blight and mildew. Should I help you plan your next activities based on expected weather?`;
      }
      return 'Check the weather forecast daily and plan your activities accordingly. Avoid spraying before rain — it will wash off and waste money. In extreme heat, irrigate early morning or late evening. Before cold snaps, prepare protection for sensitive crops. Wind affects spray drift, so spray only in calm conditions. For more detailed weather data, check the Weather section in this app. Want me to help you plan for the coming days?';
    },
    market: () => {
      if (isFollowUp) {
        return `For market strategy, also remember: Build relationships with 2 to 3 regular buyers. Compare prices across at least 2 mandis before selling. Track your net return per box after all deductions. Over time, this data helps you choose the best market and buyer combination. Would you like help calculating your actual returns?`;
      }
      return 'Harvest in the cool part of the day and transport early to get better prices. Sort and grade produce before reaching the mandi — well-sorted produce fetches higher rates. Check nearby mandi prices before transport using the Market Prices section in this app. Record transport and commission costs to calculate your true net return. Build relationships with 2 to 3 reliable buyers. Would you like help tracking your sales in the app?';
    },
    disease: () => {
      const base = crop
        ? `For ${crop} disease management, early detection saves your crop.`
        : 'For crop disease management, early detection is key.';
      if (isFollowUp) {
        return `${base} To add more detail: Remove and burn severely infected plant parts immediately — do not compost them. Improve air circulation by proper spacing and pruning. Avoid overhead watering which spreads fungal spores. For bacterial diseases, copper-based sprays are effective. For viral diseases, control the vector (usually whitefly or aphid) since there is no chemical cure for viruses. Do you want a specific remedy for the disease you are seeing?`;
      }
      return `${base} Remove and destroy infected leaves or fruits immediately — do not compost them. Improve air circulation through proper spacing. Keep foliage dry by using drip instead of overhead irrigation. For fungal diseases, apply appropriate fungicide at the first sign. For viral diseases, control the insect vector since there is no direct cure. Take a clear photo and consult your local KVK for accurate diagnosis. Would you like organic or chemical control options?`;
    },
    soil: () => {
      if (isFollowUp) {
        return `For soil improvement, also add: Rotate crops to prevent soil-borne disease buildup. Use green manure crops during fallow periods to add organic matter. Get a full soil test done annually — it costs little and saves a lot on fertilizer waste. Do you know your soil type and pH?`;
      }
      return 'Healthy soil is the foundation of good farming. Get a soil test done to know pH, organic matter, and nutrient levels. Most crops prefer pH between 6.0 and 7.5. Add organic matter regularly through compost or green manure. Maintain proper drainage — waterlogged soil kills roots. Avoid excessive tillage which destroys soil structure. For red soil, add lime if pH is low. For black cotton soil, improve drainage with raised beds. Would you like specific advice for your soil type?';
    },
    labour: () => {
      if (isFollowUp) {
        return `For labour management, also track: Daily attendance, work completed, and any advances paid. Keep a weekly summary for payment time. Skilled tasks like pruning or pest scouting need experienced workers — pay accordingly. Would you like help setting up a labour tracking system?`;
      }
      return 'Plan work assignments the evening before or early morning. Assign clear, specific tasks to each worker. Keep a daily record of who worked, what they did, and wages paid. For piece-rate work, define the unit clearly before starting. Provide clean drinking water and basic meals — happy workers are productive workers. Track advances carefully to avoid disputes. Record everything in the Labour section of this app. Would you like help with any specific labour planning?';
    },
    finance: () => {
      if (isFollowUp) {
        return `For farm finance, also think about: Maintaining an emergency fund for unexpected costs like pest outbreaks or weather damage. Compare your cost per box across seasons to identify where you can reduce expenses. Track receivables — money owed by buyers should be followed up regularly. Want me to help you build a simple profit tracker?`;
      }
      return 'Track every expense and every income — even small amounts add up. Key cost categories include seeds, fertilizer, pesticides, labour, transport, and market fees. Revenue is what you actually receive after commission and deductions. Calculate your cost per box and revenue per box to understand profitability. Set aside money for next season inputs. Record everything in the Money section of this app. Would you like help reviewing your farm finances?';
    },
    general: () => {
      if (isFollowUp) {
        return `I understand. Could you give me more specific details? For example, the crop name, the exact problem you are facing, how long it has been going on, and what you have already tried. The more detail you provide, the better I can help you.`;
      }
      return 'I can help with many farming topics — crop problems, pests, irrigation, fertilizer, planting, harvesting, storage, market prices, weather planning, soil health, labour management, and farm records. Please tell me the crop name, the specific problem or question, and how long it has been happening. For urgent disease outbreaks or chemical decisions, also contact your local Krishi Vigyan Kendra (KVK) or agriculture officer.';
    },
  };

  return responseMap[intent.intent]();
}

/** Legacy wrapper for backward compatibility. */
export function getAgricultureHelpAnswer(question: string): string {
  return getContextualHelpAnswer(question);
}

/* ------------------------------------------------------------------ */
/* Call summary, suggested actions                                     */
/* ------------------------------------------------------------------ */

export function buildCallSummary(messages: CallMessage[], profile?: FarmMitraContext): string {
  const mitraLines: string[] = [];
  const farmerLines: string[] = [];
  for (const message of messages) {
    if (message.speaker === 'mitra') mitraLines.push(message.text);
    else if (message.speaker === 'farmer') farmerLines.push(message.text);
  }
  const summary: string[] = [`Call completed with ${farmerLines.length} question${farmerLines.length === 1 ? '' : 's'} and ${mitraLines.length} answer${mitraLines.length === 1 ? '' : 's'}.`];

  // Build topic summary from conversation context
  const ctx = buildConversationContext(messages);
  if (ctx.topicsDiscussed.length > 0) {
    const topicLabels: Record<string, string> = {
      pest: 'pest control', water: 'irrigation', fertilizer: 'fertilizer',
      harvest: 'harvesting', seed: 'planting', weather: 'weather',
      market: 'market prices', soil: 'soil health', labour: 'labour management',
      disease: 'disease management', finance: 'farm finance',
    };
    const topics = ctx.topicsDiscussed.map((t) => topicLabels[t] || t).join(', ');
    summary.push(`Topics discussed: ${topics}.`);
  }

  if (ctx.mentionedCrops.length > 0) {
    summary.push(`Crops mentioned: ${ctx.mentionedCrops.join(', ')}.`);
  }

  if (farmerLines.length > 0 && mitraLines.length > 0) {
    const lastAnswered = [...messages].reverse().find((m) => m.speaker === 'mitra');
    if (lastAnswered) summary.push(`Last advice: ${lastAnswered.text.slice(0, 200)}${lastAnswered.text.length > 200 ? '…' : ''}`);
  } else if (farmerLines.length === 0) {
    summary.push('No spoken questions were recorded during this call.');
  }

  // Calculate average response time
  const responseTimes = messages
    .filter((m) => m.speaker === 'mitra' && m.responseTimeMs != null)
    .map((m) => m.responseTimeMs!);
  if (responseTimes.length > 0) {
    const avgMs = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
    const fastest = Math.min(...responseTimes);
    const slowest = Math.max(...responseTimes);
    summary.push(`Response times: avg ${avgMs < 1000 ? avgMs + 'ms' : (avgMs / 1000).toFixed(1) + 's'} (fastest ${fastest < 1000 ? fastest + 'ms' : (fastest / 1000).toFixed(1) + 's'}, slowest ${slowest < 1000 ? slowest + 'ms' : (slowest / 1000).toFixed(1) + 's'}).`);
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
  if (/harvest|pick|कटाई|கொயில்/i.test(text)) actions.push({ label: 'Log harvest', href: '/harvest', topic: 'farm' });
  if (/task|remind|plan|टास्क/i.test(text)) actions.push({ label: 'Plan farm task', href: '/tasks', topic: 'tasks' });
  if (/profit|loss|expense|cost|लाभ|ನಷ್ಟ|లాభం|லாபம்/i.test(text)) actions.push({ label: 'View profit & loss', href: '/reports', topic: 'reports' });
  if (actions.length === 0) actions.push({ label: 'Open farm dashboard', href: '/dashboard', topic: 'farm' });
  return actions.slice(0, 4);
}
