'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CROP_DISEASES } from '@/lib/ai-service';
import { CropDiseaseDiagnosis } from '@/types';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Leaf,
  Bug,
  Info,
  X,
} from 'lucide-react';

interface CropDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_PHOTO_PRESETS = [
  { id: 'early_blight', label: '🍂 Yellowing Leaves with Dark Spots', diseaseKey: 'early_blight' },
  { id: 'leaf_curl', label: '🍃 Curled Upward Leaves & Stunted Growth', diseaseKey: 'leaf_curl' },
  { id: 'fruit_borer', label: '🍅 Boreholes & Caterpillars in Fruit', diseaseKey: 'fruit_borer' },
  { id: 'blossom_end_rot', label: '⚫ Dark Sunken Spot on Tomato Bottom', diseaseKey: 'blossom_end_rot' },
];

export function CropDoctorModal({ isOpen, onClose }: CropDoctorModalProps) {
  const { t } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState<string>('early_blight');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<CropDiseaseDiagnosis | null>(
    CROP_DISEASES['early_blight']
  );

  if (!isOpen) return null;

  const handleSelectSample = (diseaseKey: string) => {
    setSelectedPreset(diseaseKey);
    setIsAnalyzing(true);
    setTimeout(() => {
      setDiagnosis(CROP_DISEASES[diseaseKey] || CROP_DISEASES['early_blight']);
      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white text-gray-900 w-full max-w-lg rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">{t.aiCropDoctorTitle}</h2>
              <p className="text-[11px] text-emerald-200">{t.aiCropDoctorSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-700 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Sample Selector / Upload Area */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Select or Upload Plant Symptom
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_PHOTO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectSample(p.diseaseKey)}
                  className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-2 ${
                    selectedPreset === p.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {isAnalyzing ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Sparkles className="w-10 h-10 text-emerald-600 animate-spin mb-2" />
              <p className="text-sm font-bold text-gray-800">{t.analyzingCrop}</p>
              <p className="text-xs text-gray-500 mt-0.5">Matching symptoms against pathology database...</p>
            </div>
          ) : diagnosis ? (
            <div className="space-y-3.5 animate-in fade-in">
              {/* Diagnosis Hero Result */}
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-600/50 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Identified Condition
                  </span>
                  <span className="text-xs font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full">
                    {diagnosis.confidencePercent}% Confidence
                  </span>
                </div>

                <h3 className="text-base font-black text-gray-900">{diagnosis.diseaseName}</h3>
                <p className="text-xs text-gray-600">{diagnosis.cause}</p>
              </div>

              {/* Organic Remedies */}
              <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Organic & Biological Remedies:</span>
                </div>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
                  {diagnosis.organicRemedy.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* Chemical Control */}
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Bug className="w-4 h-4 text-blue-600" />
                  <span>Recommended Chemical Control (With Safety Guidelines):</span>
                </div>
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 pl-1">
                  {diagnosis.recommendedChemicalControl.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* Mandatory Expert Disclaimer */}
              <div className="p-3 bg-amber-100/80 rounded-2xl border border-amber-300 text-amber-950 flex items-start gap-2 text-[11px] leading-relaxed">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Mandatory Advisory Notice:</strong> {diagnosis.expertDisclaimer}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
