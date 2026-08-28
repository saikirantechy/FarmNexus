'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage, LANGUAGE_OPTIONS } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { LanguageCode } from '@/types';
import {
  Sprout,
  Globe,
  User,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { updateUserProfile, addFarm, addCropCycle, resetToDemoData } = useFarmStore();

  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [farmerName, setFarmerName] = useState('Ramesh Patel');
  const [farmName, setFarmName] = useState('My Tomato Farm');
  const [village, setVillage] = useState('Vemagal');
  const [district, setDistrict] = useState('Kolar');
  const [state, setState] = useState('Karnataka');
  const [cropName, setCropName] = useState('Tomato');
  const [variety, setVariety] = useState('US 440 Hybrid');
  const [acreage, setAcreage] = useState('2.0');
  const [plantingDate, setPlantingDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Complete setup
      setLanguage(selectedLang);
      updateUserProfile({
        name: farmerName,
        village,
        district,
        state,
      });

      const newFarm = addFarm({
        userId: 'user-1',
        name: farmName,
        village,
        district,
        state,
        totalAcreage: Number(acreage) || 2,
        irrigationType: 'Drip',
        soilType: 'Red Loam',
        fields: [
          {
            id: `f-${Date.now()}`,
            farmId: '',
            name: 'Field 1',
            areaAcres: Number(acreage) || 2,
            irrigationType: 'Drip',
            soilType: 'Red Loam',
          },
        ],
      });

      addCropCycle({
        farmId: newFarm.id,
        fieldId: newFarm.fields[0].id,
        cropName,
        variety,
        areaAcres: Number(acreage) || 2,
        plantingDate,
        stage: 'Harvesting',
        status: 'active',
      });

      router.push('/dashboard');
    }
  };

  const handleFastDemo = () => {
    resetToDemoData();
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto py-4 px-2 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-800 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-700/30 text-3xl">
          🌱
        </div>
        <h1 className="text-2xl font-black text-emerald-950">{t.welcomeTitle}</h1>
        <p className="text-xs text-emerald-700 font-bold tracking-wide uppercase">
          {t.tagline}
        </p>
      </div>

      {/* 1-Click Demo Shortcut Card */}
      <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-700 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <h3 className="font-extrabold text-sm text-emerald-100">Want to test with real data?</h3>
        </div>
        <p className="text-xs text-emerald-200/90 leading-relaxed">
          {t.loadDemoDesc}
        </p>
        <button
          onClick={handleFastDemo}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-3 px-4 rounded-2xl text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
        >
          <span>{t.loadDemoData}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Step Wizard Container */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md space-y-5">
        {/* Step indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-b border-gray-100 pb-3">
          <span>
            Step {step} of 6: {step === 1 ? 'Language' : step === 2 ? 'Farmer' : step === 3 ? 'Farm' : step === 4 ? 'Crop' : step === 5 ? 'Acreage' : 'Planting Date'}
          </span>
          <span className="text-emerald-700 font-extrabold">{Math.round((step / 6) * 100)}%</span>
        </div>

        {/* STEP 1: LANGUAGE */}
        {step === 1 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900">{t.chooseLanguage}</h3>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setSelectedLang(opt.code);
                    setLanguage(opt.code);
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    selectedLang === opt.code
                      ? 'bg-emerald-50 border-emerald-600 shadow-sm text-emerald-950 font-black'
                      : 'bg-gray-50 border-gray-200 text-gray-700 font-semibold'
                  }`}
                >
                  <span className="text-base">{opt.native}</span>
                  <span className="text-[11px] text-gray-400">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: FARMER NAME */}
        {step === 2 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900">{t.farmerName}</h3>
            <p className="text-xs text-gray-500">What should the farm assistant call you?</p>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full text-base font-bold border-2 border-emerald-600/40 rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white outline-none"
              placeholder="e.g. Ramesh Patel"
              required
            />
          </div>
        )}

        {/* STEP 3: FARM NAME & LOCATION */}
        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900">{t.farmName}</h3>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full text-base font-bold border-2 border-emerald-600/40 rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white outline-none"
              placeholder="e.g. Patel Organic Farms"
              required
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District (e.g. Kolar)"
                className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State (e.g. Karnataka)"
                className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: PRIMARY CROP */}
        {step === 4 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900">{t.selectCrop}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'Tomato', icon: '🍅' },
                { name: 'Onion', icon: '🧅' },
                { name: 'Chilli', icon: '🌶️' },
                { name: 'Potato', icon: '🥔' },
                { name: 'Paddy', icon: '🌾' },
                { name: 'Cotton', icon: '🌱' },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCropName(c.name)}
                  className={`p-3 rounded-2xl border text-left font-bold flex items-center gap-2 transition ${
                    cropName === c.name
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: ACREAGE */}
        {step === 5 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900">{t.enterAcreage}</h3>
            <input
              type="number"
              step="0.1"
              value={acreage}
              onChange={(e) => setAcreage(e.target.value)}
              className="w-full text-2xl font-black text-emerald-900 border-2 border-emerald-600/40 rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white outline-none"
              placeholder="2.0"
              required
            />
          </div>
        )}

        {/* STEP 6: PLANTING DATE */}
        {step === 6 && (
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-gray-900">{t.plantingDate}</h3>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full text-base font-bold border-2 border-emerald-600/40 rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white outline-none"
              required
            />
          </div>
        )}

        {/* Navigation Step Button */}
        <div className="flex gap-2 pt-2">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-2xl text-xs transition"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{step === 6 ? t.getStarted : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
