'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { parseFarmerVoiceText } from '@/lib/ai-service';
import { ParsedAITransaction, LanguageCode } from '@/types';
import { formatRupee, calculateLabourCost } from '@/lib/calculations';
import { getSpeechRecognition, SpeechRecognitionLike } from '@/lib/speech';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Send,
  RotateCcw,
} from 'lucide-react';

const LANGUAGE_SPEECH_MAP: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  te: 'te-IN',
  ta: 'ta-IN',
};

const SAMPLE_VOICE_PROMPTS = [
  { label: '5 workers & 42 boxes', text: 'Today 5 workers came and picked 42 boxes. Rate was 50 rupees.' },
  { label: 'Fertilizer expense', text: 'Spent 3500 on fertilizer from IFFCO Kendra.' },
  { label: '68 boxes sale', text: '68 boxes at 270 rupees sold to Balaji Traders.' },
  { label: 'हिंदी: 5 मजदूर व 40 पेटी', text: 'आज 5 मजदूर आए और 40 पेटी टमाटर निकाला।' },
];

export function VoiceTransactionRecorder() {
  const { t, language } = useLanguage();
  const { activeFarmId, activeCropId, addHarvest, addLabour, addExpense, addSale } = useFarmStore();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedRecord, setParsedRecord] = useState<ParsedAITransaction | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const handleAnalyze = useCallback(
    (queryText: string) => {
      const textToParse = queryText || inputQuery || '';
      if (!textToParse.trim()) return;

      const parsed = parseFarmerVoiceText(textToParse);
      setParsedRecord(parsed);
      setSavedSuccessMsg(null);
    },
    [inputQuery],
  );

  const handleAnalyzeRef = useRef(handleAnalyze);
  useEffect(() => {
    handleAnalyzeRef.current = handleAnalyze;
  }, [handleAnalyze]);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = LANGUAGE_SPEECH_MAP[language] || 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onresult = ({ results }) => {
        const transcript = results[0][0].transcript;
        setInputQuery(transcript);
        handleAnalyzeRef.current(transcript);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // If browser doesn't support Web Speech API, use a fallback simulation prompt
      const sample = SAMPLE_VOICE_PROMPTS[Math.floor(Math.random() * SAMPLE_VOICE_PROMPTS.length)];
      setInputQuery(sample.text);
      handleAnalyze(sample.text);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = LANGUAGE_SPEECH_MAP[language] || 'en-IN';
      recognitionRef.current.start();
    }
  };

  const handleConfirmAndSave = () => {
    if (!parsedRecord) return;
    const { intent, extracted } = parsedRecord;
    const date = extracted.date || new Date().toISOString().split('T')[0];

    if (intent === 'labour') {
      const workers = extracted.workerCount || 5;
      const wage = extracted.dailyWage || 50;
      const calc = calculateLabourCost(workers, wage, 50, 0, 0);

      addLabour({
        farmId: activeFarmId,
        cropCycleId: activeCropId,
        date,
        workerCount: workers,
        dailyWage: wage,
        workDescription: extracted.workDescription || 'Labour harvest & sorting',
        foodCostPerPerson: 50,
        totalFoodCost: calc.totalFoodCost,
        transportCost: 0,
        totalCost: calc.totalCost,
        balancePayable: 0,
        paymentStatus: 'paid',
      });

      // Also record harvest if boxes extracted
      if (extracted.boxes) {
        addHarvest({
          farmId: activeFarmId,
          cropCycleId: activeCropId,
          date,
          boxes: extracted.boxes,
          weightPerBoxKg: 20,
          totalWeightKg: extracted.boxes * 20,
          unit: 'box',
          grade: 'A',
          estimatedPricePerBox: 240,
          estimatedGross: extracted.boxes * 240,
        });
      }

      setSavedSuccessMsg(`Saved labour (${workers} workers) & ${extracted.boxes || 0} boxes harvest!`);
    } else if (intent === 'expense') {
      const amount = extracted.amount || 0;
      const category = extracted.category || 'Other';

      addExpense({
        farmId: activeFarmId,
        cropCycleId: activeCropId,
        date,
        amount,
        category,
        paymentStatus: 'paid',
        paidAmount: amount,
        balanceAmount: 0,
        notes: parsedRecord.rawText,
      });

      setSavedSuccessMsg(`Saved ${formatRupee(amount)} expense for ${category}!`);
    } else if (intent === 'sale') {
      const boxes = extracted.boxes || 0;
      const rate = extracted.ratePerBox || 0;
      const gross = boxes * rate;

      addSale({
        farmId: activeFarmId,
        cropCycleId: activeCropId,
        saleDate: date,
        boxes,
        unit: 'box',
        pricePerUnit: rate,
        grossAmount: gross,
        buyerName: extracted.buyer || 'Mandi Buyer',
        marketName: extracted.market || 'APMC Mandi',
        commissionType: 'percentage',
        commissionRate: 10,
        commissionAmount: (gross * 10) / 100,
        transportCost: 0,
        otherDeductions: 0,
        netAmount: (gross * 90) / 100,
        amountReceived: (gross * 90) / 100,
        amountPending: 0,
        paymentStatus: 'paid',
      });

      setSavedSuccessMsg(`Saved sale for ${boxes} boxes (${formatRupee(gross)})!`);
    } else {
      // Default to harvest
      const boxes = extracted.boxes || 0;
      const price = extracted.ratePerBox || 240;
      addHarvest({
        farmId: activeFarmId,
        cropCycleId: activeCropId,
        date,
        boxes,
        weightPerBoxKg: 20,
        totalWeightKg: boxes * 20,
        unit: 'box',
        grade: 'A',
        estimatedPricePerBox: price,
        estimatedGross: boxes * price,
      });
      setSavedSuccessMsg(`Saved harvest for ${boxes} boxes!`);
    }

    setTimeout(() => {
      setParsedRecord(null);
      setInputQuery('');
    }, 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-emerald-800/20 shadow-md p-4 sm:p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900">{t.aiAssistantTitle}</h3>
            <p className="text-[11px] text-gray-500 font-medium">{t.aiSpeakPrompt}</p>
          </div>
        </div>
      </div>

      {/* Input Field + Big Mic Button */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(inputQuery)}
            placeholder={t.aiPlaceholder}
            className="w-full text-sm font-medium border-2 border-emerald-600/30 rounded-2xl pl-4 pr-24 py-3 bg-emerald-50/20 focus:bg-white focus:ring-2 focus:ring-emerald-600 outline-none text-gray-900"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            {/* Mic Button */}
            <button
              onClick={toggleListening}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shadow-md ${
                isListening
                  ? 'bg-rose-600 mic-active scale-110'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-95'
              }`}
              title="Speak in your native language"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Analyze/Send Button */}
            <button
              onClick={() => handleAnalyze(inputQuery)}
              disabled={!inputQuery.trim()}
              className="w-9 h-9 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>{t.aiListening}</span>
          </div>
        )}

        {/* Sample Voice Quick Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
            Try:
          </span>
          {SAMPLE_VOICE_PROMPTS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputQuery(sample.text);
                handleAnalyze(sample.text);
              }}
              className="shrink-0 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-900 border border-gray-200 px-2.5 py-1 rounded-full text-[11px] font-medium text-gray-700 transition"
            >
              🎙️ {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation & Structured Card Before Permanent Save */}
      {parsedRecord && (
        <div className="mt-4 p-4 bg-emerald-50/90 rounded-2xl border-2 border-emerald-600/50 shadow-inner space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.aiParseConfirmTitle}</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
              Confidence: {Math.round(parsedRecord.confidence * 100)}%
            </span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-emerald-200/80 text-xs space-y-1.5">
            <div className="text-gray-500 italic text-[11px]">
              &ldquo;{parsedRecord.rawText}&rdquo;
            </div>

            <div className="border-t border-gray-100 pt-2 grid grid-cols-2 gap-2 text-gray-800">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Action</span>
                <span className="font-extrabold capitalize text-emerald-800">
                  {parsedRecord.intent}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Date</span>
                <span className="font-semibold">{parsedRecord.extracted.date}</span>
              </div>

              {parsedRecord.extracted.workerCount && (
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Workers</span>
                  <span className="font-extrabold text-amber-900">
                    {parsedRecord.extracted.workerCount} workers (@ ₹{parsedRecord.extracted.dailyWage || 50})
                  </span>
                </div>
              )}

              {parsedRecord.extracted.boxes && (
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Harvest</span>
                  <span className="font-extrabold text-emerald-900">
                    {parsedRecord.extracted.boxes} Boxes
                  </span>
                </div>
              )}

              {parsedRecord.extracted.amount && (
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Amount</span>
                  <span className="font-extrabold text-rose-700">
                    {formatRupee(parsedRecord.extracted.amount)} ({parsedRecord.extracted.category})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleConfirmAndSave}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span>{t.confirm}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setParsedRecord(null)}
              className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2.5 px-3 rounded-xl text-xs border border-gray-200 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {savedSuccessMsg && (
        <div className="mt-3 p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}
    </div>
  );
}
