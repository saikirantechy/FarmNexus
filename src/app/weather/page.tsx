'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { DEMO_WEATHER } from '@/lib/demo-data';
import {
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  Info,
  Sun,
  CloudLightning,
  ShieldCheck,
} from 'lucide-react';

export default function WeatherPage() {
  const { t } = useLanguage();
  const weather = DEMO_WEATHER;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <span>{t.weatherTitle}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Weather forecast & agronomic precautions for {weather.location}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span>Station: Kolar Agri-Met</span>
        </div>
      </div>

      {/* Current Weather Hero */}
      <div className="bg-gradient-to-br from-teal-800 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Current Conditions
            </span>
            <div className="text-4xl sm:text-6xl font-black tracking-tight text-white mt-1">
              {weather.temperature}°C
            </div>
            <p className="text-sm font-semibold text-emerald-100 mt-1">{weather.condition}</p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl">
            🌦️
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-emerald-700/60 text-xs">
          <div className="bg-white/10 rounded-xl p-2 text-center">
            <Droplets className="w-4 h-4 text-emerald-300 mx-auto mb-0.5" />
            <span className="text-[10px] text-emerald-200 block">{t.humidity}</span>
            <span className="font-bold text-sm text-white">{weather.humidity}%</span>
          </div>

          <div className="bg-white/10 rounded-xl p-2 text-center">
            <CloudRain className="w-4 h-4 text-blue-300 mx-auto mb-0.5" />
            <span className="text-[10px] text-emerald-200 block">{t.rainProbability}</span>
            <span className="font-bold text-sm text-white">{weather.rainProbability}%</span>
          </div>

          <div className="bg-white/10 rounded-xl p-2 text-center">
            <Wind className="w-4 h-4 text-amber-300 mx-auto mb-0.5" />
            <span className="text-[10px] text-emerald-200 block">{t.windSpeed}</span>
            <span className="font-bold text-sm text-white">{weather.windSpeedKmH} km/h</span>
          </div>
        </div>
      </div>

      {/* Agricultural Alerts */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider">
          Crop-Specific Action Alerts
        </h3>
        {weather.agriculturalAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
              alert.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            {alert.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-black text-sm mb-0.5">{alert.title}</h4>
              <p>{alert.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 5-Day Forecast Grid */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-gray-900">5-Day Agricultural Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {weather.forecast.map((f, i) => (
            <div
              key={i}
              className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100 flex flex-col justify-between"
            >
              <span className="font-bold text-gray-700 text-xs block">{f.day}</span>
              <div className="my-2 text-2xl">
                {f.icon === 'cloud-rain'
                  ? '🌧️'
                  : f.icon === 'cloud-lightning'
                  ? '⛈️'
                  : f.icon === 'cloud-sun'
                  ? '⛅'
                  : '☀️'}
              </div>
              <div>
                <span className="font-black text-gray-900 text-sm block">
                  {f.tempMax}° / {f.tempMin}°
                </span>
                <span className="text-[10px] text-blue-600 font-bold block mt-0.5">
                  💧 {f.rainProb}% Rain
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
