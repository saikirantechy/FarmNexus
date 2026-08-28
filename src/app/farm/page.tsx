'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { CropStage } from '@/types';
import {
  Sprout,
  MapPin,
  Layers,
  Droplets,
  Calendar,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  X,
  Warehouse,
  CalendarDays,
} from 'lucide-react';

const CROP_STAGES: CropStage[] = [
  'Planned',
  'Growing',
  'Flowering',
  'Fruiting',
  'Harvesting',
  'Completed',
];

const SUPPORTED_CROPS = [
  'Tomato',
  'Onion',
  'Potato',
  'Chilli',
  'Cotton',
  'Paddy',
  'Wheat',
  'Maize',
  'Sugarcane',
  'Capsicum',
  'Watermelon',
  'Banana',
];

export default function FarmPage() {
  const { t } = useLanguage();
  const { farms, activeFarm, cropCycles, activeCrop, addFarm, addCropCycle, financialSummary } =
    useFarmStore();

  const [addCropModalOpen, setAddCropModalOpen] = useState(false);
  const [newCropName, setNewCropName] = useState('Tomato');
  const [newVariety, setNewVariety] = useState('US 440 Hybrid');
  const [newArea, setNewArea] = useState('2.0');
  const [newPlantingDate, setNewPlantingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newStage, setNewStage] = useState<CropStage>('Growing');

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;

    addCropCycle({
      farmId: activeFarm.id,
      fieldId: activeFarm.fields[0]?.id || 'f1',
      cropName: newCropName,
      variety: newVariety,
      areaAcres: Number(newArea) || 1,
      plantingDate: newPlantingDate,
      stage: newStage,
      status: 'active',
    });

    setAddCropModalOpen(false);
  };

  const currentStageIndex = CROP_STAGES.indexOf(activeCrop?.stage || 'Harvesting');

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-700" />
            <span>Farm & Crop Cycle Management</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Manage your land parcels, crop stages, and expected harvest targets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/inventory"
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <Warehouse className="w-4 h-4" />
            <span>Input Stock</span>
          </Link>
          <Link
            href="/tasks"
            className="bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Tasks</span>
          </Link>
          <button
            onClick={() => setAddCropModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Crop Cycle</span>
          </button>
        </div>
      </div>

      {/* Farm Card */}
      {activeFarm && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-800/20 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                Active Farm
              </span>
              <h2 className="text-lg font-black text-gray-900 mt-1">{activeFarm.name}</h2>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {activeFarm.village}, {activeFarm.district}, {activeFarm.state}
                </span>
              </div>
            </div>

            <div className="flex gap-2 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                <span className="text-emerald-700 font-semibold block text-[10px]">Acreage</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {activeFarm.totalAcreage} Acres
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                <span className="text-emerald-700 font-semibold block text-[10px]">Irrigation</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {activeFarm.irrigationType}
                </span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                <span className="text-emerald-700 font-semibold block text-[10px]">Soil</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {activeFarm.soilType}
                </span>
              </div>
            </div>
          </div>

          {/* Fields Breakdown */}
          <div>
            <h3 className="text-xs font-bold text-gray-600 mb-2">Fields & Plots Under Farm:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeFarm.fields.map((f, i) => (
                <div
                  key={f.id}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{f.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        {f.areaAcres} Acres • {f.irrigationType || 'Drip'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Crop Cycle Hero */}
      {activeCrop && (
        <div className="bg-white rounded-3xl p-5 border border-emerald-800/20 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center text-xl">
                🍅
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">
                  {activeCrop.cropName} ({activeCrop.variety})
                </h3>
                <p className="text-xs text-gray-500">
                  Planted on {activeCrop.plantingDate} • {activeCrop.areaAcres} Acres
                </p>
              </div>
            </div>

            <span className="bg-emerald-100 text-emerald-900 font-extrabold text-xs px-3 py-1 rounded-full">
              {activeCrop.stage} Stage
            </span>
          </div>

          {/* Stage Progress Stepper */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-bold text-gray-500">
              <span>Crop Lifecycle Stage</span>
              <span className="text-emerald-700 font-extrabold">{activeCrop.stage}</span>
            </div>

            <div className="grid grid-cols-6 gap-1">
              {CROP_STAGES.map((stg, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stg} className="text-center">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isPassed
                          ? isCurrent
                            ? 'bg-emerald-600 ring-2 ring-emerald-300'
                            : 'bg-emerald-500'
                          : 'bg-gray-200'
                      }`}
                    />
                    <span
                      className={`text-[9px] font-bold mt-1 block truncate ${
                        isPassed ? 'text-emerald-900' : 'text-gray-400'
                      }`}
                    >
                      {stg}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Harvest & Yield Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-100 text-xs">
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100">
              <span className="text-gray-500 text-[11px] block">Actual Harvest to Date</span>
              <span className="text-base font-black text-emerald-900 mt-0.5 block">
                {financialSummary.totalHarvestBoxes} Boxes
              </span>
              <span className="text-[10px] text-emerald-700">
                ({financialSummary.totalHarvestKg.toLocaleString('en-IN')} kg)
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <span className="text-gray-500 text-[11px] block">Target Yield</span>
              <span className="text-base font-black text-gray-900 mt-0.5 block">
                {activeCrop.expectedYieldBoxes || 1800} Boxes
              </span>
              <span className="text-[10px] text-gray-500">
                {Math.round((financialSummary.totalHarvestBoxes / (activeCrop.expectedYieldBoxes || 1800)) * 100)}% achieved
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 col-span-2 sm:col-span-1">
              <span className="text-gray-500 text-[11px] block">Expected Harvest End</span>
              <span className="text-base font-black text-gray-900 mt-0.5 block">
                {activeCrop.expectedHarvestDate || '10 Sep 2026'}
              </span>
              <span className="text-[10px] text-gray-500">12 days remaining</span>
            </div>
          </div>
        </div>
      )}

      {/* Add Crop Cycle Modal */}
      {addCropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-700" />
                <span>Start New Crop Cycle</span>
              </h3>
              <button
                onClick={() => setAddCropModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCrop} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Crop</label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full text-sm font-medium border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none"
                >
                  {SUPPORTED_CROPS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Variety / Hybrid</label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                    placeholder="e.g. US 440"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Acreage (Acres)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                    placeholder="2.0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    value={newPlantingDate}
                    onChange={(e) => setNewPlantingDate(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Current Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as CropStage)}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none"
                  >
                    {CROP_STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-sm shadow-md transition"
              >
                Create Crop Cycle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
