'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { VoiceTransactionRecorder } from '@/components/ai/VoiceTransactionRecorder';
import { CropDoctorModal } from '@/components/ai/CropDoctorModal';
import {
  Bot,
  Sparkles,
  Leaf,
  MessageSquare,
  HelpCircle,
  ShieldAlert,
  Send,
  Camera,
  ChevronRight,
} from 'lucide-react';

const COMMON_FARM_QUESTIONS = [
  {
    q: 'Why are my tomato leaves turning yellow?',
    a: 'Yellowing in lower leaves can be caused by Early Blight fungal infection, Nitrogen deficiency, or waterlogging. Check the underside of the leaves for concentric ring spots. If spots are present, apply Trichoderma viride or copper oxychloride. Ensure good drainage around beds.',
  },
  {
    q: 'What could cause flower dropping in tomato?',
    a: 'Flower drop is most commonly triggered by temperature extremes (>32°C day or <15°C night), excessive nitrogen fertilizer, or moisture stress during flower initiation. Spray Planofix (NAA) @ 0.25ml/L or 13:00:45 (Potassium Nitrate) @ 5g/L during early bloom.',
  },
  {
    q: 'What should I monitor during flowering & fruit set?',
    a: 'Maintain consistent drip irrigation cycles to prevent Calcium deficiency (Blossom End Rot). Install Yellow Sticky Traps for Whiteflies and Pheromone traps for Fruit Borer moths. Spray Calcium Nitrate @ 4g/L + Boron @ 1g/L for uniform fruit setting.',
  },
  {
    q: 'What should I check before harvesting?',
    a: '1. Check Pre-Harvest Intervals (PHI) of any recently sprayed pesticides (wait minimum 3-5 days). 2. Pick at breaker/pink stage for long-distance transport to distant Mandis, or red-ripe for local direct sales. 3. Avoid picking immediately after heavy rain to prevent fungal decay in crates.',
  },
];

export default function AIAssistantPage() {
  const { t } = useLanguage();
  const [cropDoctorOpen, setCropDoctorOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: 'farmer' | 'ai'; text: string }[]
  >([
    {
      sender: 'ai',
      text: 'Namaste! I am your AI Farm Assistant 🌱. You can speak or type farm entries ("Today 5 workers picked 42 boxes"), ask crop care questions, or use the AI Crop Doctor to diagnose leaf issues.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (questionText?: string) => {
    const query = questionText || chatInput;
    if (!query.trim()) return;

    const newMessages = [...chatMessages, { sender: 'farmer' as const, text: query }];
    setChatMessages(newMessages);
    setChatInput('');

    // Match agricultural knowledge
    setTimeout(() => {
      const match = COMMON_FARM_QUESTIONS.find((item) =>
        query.toLowerCase().includes(item.q.toLowerCase().slice(0, 15))
      );

      const aiReply = match
        ? match.a
        : `Regarding "${query}": Based on standard package of practices for tomato farming, maintain optimal drip irrigation, balanced NPK fertigation, and monitor pest thresholds. For critical pest outbreaks or chemical dosages, always consult your local Krishi Vigyan Kendra (KVK) officer.`;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
        },
      ]);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-200" />
            </div>
            <h1 className="text-xl font-black">{t.navAI}</h1>
          </div>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            Natural voice record keeper, crop disease doctor & agronomy advisor
          </p>
        </div>

        <button
          onClick={() => setCropDoctorOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition"
        >
          <Camera className="w-4 h-4" />
          <span>Launch AI Crop Doctor</span>
        </button>
      </div>

      {/* Voice & NLP Transaction Extractor Component */}
      <VoiceTransactionRecorder />

      {/* AI Crop Doctor Promo Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-800/20 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shrink-0">
            🌿
          </div>
          <div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
              Leaf & Pest Vision Analysis
            </span>
            <h3 className="font-extrabold text-base text-gray-900 mt-0.5">
              AI Crop Doctor & Disease Diagnosis
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Identify Early Blight, Leaf Curl, Fruit Borer, or Calcium Deficiency in seconds with organic & safe chemical remedies.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCropDoctorOpen(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs px-4 py-3 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition shrink-0"
        >
          <span>Diagnose Crop Photo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Agricultural Q&A Chat */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-700" />
          <h3 className="font-bold text-sm text-gray-900">Ask Farm & Crop Questions</h3>
        </div>

        {/* Quick FAQ Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Common Agronomy Questions:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
            {COMMON_FARM_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(item.q)}
                className="shrink-0 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-900 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 transition"
              >
                ❓ {item.q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="bg-gray-50/80 rounded-2xl p-3 max-h-80 overflow-y-auto space-y-2.5 border border-gray-100 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.sender === 'farmer'
                    ? 'bg-emerald-800 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
            placeholder="Ask anything about pests, fertilizers, irrigation, harvesting..."
            className="flex-1 text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none"
          />
          <button
            onClick={() => handleSendChat()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-xl transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2 text-[11px] leading-relaxed">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Farmer Safety Notice:</strong> AI advice is advisory. Strictly follow pesticide label recommendations and consult your local agricultural extension center for critical farm interventions.
          </span>
        </div>
      </div>

      {/* Crop Doctor Modal */}
      <CropDoctorModal isOpen={cropDoctorOpen} onClose={() => setCropDoctorOpen(false)} />
    </div>
  );
}
