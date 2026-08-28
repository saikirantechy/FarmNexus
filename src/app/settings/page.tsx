'use client';

import React, { useState } from 'react';
import { useLanguage, LANGUAGE_OPTIONS } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import {
  Settings,
  Globe,
  User,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user, updateUserProfile, isOffline, resetToDemoData, clearAllData } = useFarmStore();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [village, setVillage] = useState(user.village);
  const [district, setDistrict] = useState(user.district);
  const [state, setState] = useState(user.state);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      phone,
      village,
      district,
      state,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>{t.navSettings} & Profile</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Customize language, farm details, offline sync and data backups
          </p>
        </div>
      </div>

      {/* Language Selector Card */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-800/20 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-sm text-gray-900">{t.chooseLanguage}</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => setLanguage(opt.code)}
              className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                language === opt.code
                  ? 'bg-emerald-50 border-emerald-600 shadow-sm text-emerald-950 font-black'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold'
              }`}
            >
              <span className="text-base">{opt.native}</span>
              <span className="text-xs text-gray-400 mt-0.5">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Farmer Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" />
          <h3 className="font-extrabold text-sm text-gray-900">Farmer Profile Details</h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">{t.farmerName}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Village</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs shadow-sm transition"
            >
              Save Profile Changes
            </button>
            {savedSuccess && (
              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile Updated!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Offline Storage & Demo Data Management */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-extrabold text-sm text-gray-900">Offline Storage & Demo Controls</h3>

        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOffline ? (
              <WifiOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-600" />
            )}
            <div>
              <span className="font-bold text-gray-900 block">
                {isOffline ? 'Offline Mode Active' : 'Online & Synchronized'}
              </span>
              <span className="text-[11px] text-gray-500">
                All records stored securely in deterministic browser database
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
            IndexedDB Active
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => resetToDemoData()}
            className="flex-1 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t.loadDemoData}</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear all recorded farm entries?')) clearAllData();
            }}
            className="bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-600 font-semibold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Entries</span>
          </button>
        </div>
      </div>
    </div>
  );
}
