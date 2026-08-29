'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useFarmStore } from '@/lib/farm-store';
import { DEMO_WEATHER } from '@/lib/demo-data';
import {
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  Info,
  Thermometer,
  Eye,
  Sprout,
  Calendar,
  Umbrella,
  Sun,
  Cloud,
  CloudLightning,
  ChevronRight,
  MapPin,
} from 'lucide-react';

const weatherIcons: Record<string, string> = {
  'cloud-rain': '🌧️',
  'cloud-lightning': '⛈️',
  'cloud-sun': '⛅',
  'sun': '☀️',
};

const RAIN_INTENSITY = [
  { max: 20, label: 'Dry', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', emoji: '☀️' },
  { max: 40, label: 'Light chance', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', emoji: '🌤️' },
  { max: 60, label: 'Moderate', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', emoji: '🌥️' },
  { max: 80, label: 'Heavy likely', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', emoji: '🌧️' },
  { max: 101, label: 'Very heavy', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', emoji: '⛈️' },
];

function getRainInfo(prob: number) {
  return RAIN_INTENSITY.find((r) => prob < r.max) || RAIN_INTENSITY[4];
}

function getFarmSuggestion(temp: number, rainProb: number, humidity: number) {
  const suggestions: string[] = [];
  if (rainProb > 60) {
    suggestions.push('Delay spraying — rain will wash off pesticides');
    suggestions.push('Check drainage channels before rain');
  }
  if (rainProb < 20 && temp > 30) {
    suggestions.push('Increase irrigation frequency in heat');
    suggestions.push('Water crops early morning or late evening');
  }
  if (humidity > 80) {
    suggestions.push('Watch for fungal disease in high humidity');
    suggestions.push('Avoid overhead irrigation to keep foliage dry');
  }
  if (temp < 15) {
    suggestions.push('Protect young seedlings from cold stress');
  }
  if (rainProb > 40 && rainProb <= 60) {
    suggestions.push('Delay fertilizer application until after rain');
  }
  if (suggestions.length === 0) {
    suggestions.push('Good conditions for field work and scouting');
    suggestions.push('Monitor crop health and pest activity');
  }
  return suggestions;
}

export default function WeatherPage() {
  const { t } = useLanguage();
  const { activeCrop } = useFarmStore();
  const weather = DEMO_WEATHER;
  const [selectedDay, setSelectedDay] = useState(0);

  const rainInfo = getRainInfo(weather.rainProbability);
  const farmSuggestions = getFarmSuggestion(weather.temperature, weather.rainProbability, weather.humidity);
  const currentHour = new Date().getHours();
  const isDayTime = currentHour >= 6 && currentHour < 18;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-amber-500" />
            <span>{t.weatherTitle}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" />
            {weather.location} — {activeCrop?.cropName || 'Tomato'} crop advisory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Live Station
          </span>
        </div>
      </div>

      {/* Current Weather Hero */}
      <div className="bg-gradient-to-br from-teal-800 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        {/* Animated rain drops when high rain probability */}
        {weather.rainProbability > 50 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute w-0.5 h-4 bg-blue-300/30 rounded-full animate-pulse"
                style={{
                  left: `${8 + i * 8}%`,
                  top: `${-10 + (i % 3) * 15}%`,
                  animationDelay: `${i * 200}ms`,
                  transform: `rotate(${15 + (i % 4) * 5}deg)`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {isDayTime ? '☀️ Daytime' : '🌙 Nighttime'} — Current
              </span>
              <div className="text-4xl sm:text-6xl font-black tracking-tight text-white mt-1">
                {weather.temperature}°C
              </div>
              <p className="text-sm font-semibold text-emerald-100 mt-1">{weather.condition}</p>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                Feels like {weather.temperature - 1}°C • Rainfall today: {weather.rainfallMm}mm
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl">
              {weather.rainProbability > 60 ? '🌧️' : weather.rainProbability > 30 ? '⛅' : '☀️'}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-emerald-700/60 text-xs">
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <Thermometer className="w-4 h-4 text-red-300 mx-auto mb-0.5" />
              <span className="text-[10px] text-emerald-200 block">Temp</span>
              <span className="font-bold text-sm text-white">{weather.temperature}°C</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <Droplets className="w-4 h-4 text-blue-300 mx-auto mb-0.5" />
              <span className="text-[10px] text-emerald-200 block">Humidity</span>
              <span className="font-bold text-sm text-white">{weather.humidity}%</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <CloudRain className="w-4 h-4 text-blue-300 mx-auto mb-0.5" />
              <span className="text-[10px] text-emerald-200 block">Rain</span>
              <span className="font-bold text-sm text-white">{weather.rainProbability}%</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 text-center">
              <Wind className="w-4 h-4 text-amber-300 mx-auto mb-0.5" />
              <span className="text-[10px] text-emerald-200 block">Wind</span>
              <span className="font-bold text-sm text-white">{weather.windSpeedKmH}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rain Intensity Badge */}
      <div className={`${rainInfo.bg} border ${rainInfo.border} rounded-2xl p-3 flex items-center gap-3`}>
        <span className="text-2xl">{rainInfo.emoji}</span>
        <div>
          <p className={`text-sm font-black ${rainInfo.color}`}>
            Rain Forecast: {rainInfo.label}
          </p>
          <p className="text-xs text-gray-600">
            {weather.rainProbability}% probability today • {weather.rainfallMm}mm expected rainfall
          </p>
        </div>
      </div>

      {/* Farm Activity Suggestions */}
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-emerald-700" />
          <h3 className="font-black text-sm text-gray-900">Farm Activity Advisory</h3>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full ml-auto">
            {activeCrop?.cropName || 'Tomato'}
          </span>
        </div>
        <div className="space-y-2">
          {farmSuggestions.map((suggestion, idx) => (
            <div key={idx} className="flex items-start gap-2.5 bg-emerald-50/70 rounded-xl p-2.5 text-xs text-emerald-900">
              <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium">{suggestion}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Alerts */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Crop-Specific Action Alerts
        </h3>
        {weather.agriculturalAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
              alert.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : alert.type === 'critical'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-blue-50 border-blue-200 text-blue-950'
            }`}
          >
            {alert.type === 'warning' || alert.type === 'critical' ? (
              <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.type === 'critical' ? 'text-rose-600' : 'text-amber-600'}`} />
            ) : (
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-black text-sm mb-0.5">{alert.title}</h4>
              <p>{alert.message}</p>
              <span className="text-[10px] font-bold mt-1 inline-block opacity-70">Crop: {alert.crop}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 5-Day Forecast */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-700" />
            5-Day Agricultural Forecast
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {weather.forecast.map((f, i) => {
            const dayRain = getRainInfo(f.rainProb);
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`rounded-xl p-3 text-center border flex flex-col justify-between transition ${
                  selectedDay === i
                    ? 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
                    : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div>
                  <span className="font-bold text-gray-700 text-xs block">
                    {i === 0 ? 'Today' : f.day}
                  </span>
                  <div className="my-2 text-2xl">
                    {f.icon === 'cloud-rain' ? '🌧️' : f.icon === 'cloud-lightning' ? '⛈️' : f.icon === 'cloud-sun' ? '⛅' : '☀️'}
                  </div>
                  <span className="font-black text-gray-900 text-sm block">
                    {f.tempMax}° / {f.tempMin}°
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  <span className={`text-[10px] font-bold block ${dayRain.color}`}>
                    💧 {f.rainProb}%
                  </span>
                  <span className="text-[9px] text-gray-400 block">{dayRain.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Irrigation Planner */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Umbrella className="w-4 h-4 text-sky-700" />
          <h3 className="font-black text-sm text-sky-950">Irrigation Planner</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white rounded-xl p-3 border border-sky-100">
            <span className="text-sky-600 font-bold text-[10px] block uppercase">Today</span>
            <span className="font-black text-gray-900 text-sm">
              {weather.rainProbability > 50 ? '⏸️ Skip — rain expected' : '💧 irrigate normally'}
            </span>
            <span className="text-gray-500 text-[10px] block mt-0.5">
              {weather.rainProbability > 50 ? 'Save water, rain will supplement' : 'Check soil at 5cm depth'}
            </span>
          </div>
          <div className="bg-white rounded-xl p-3 border border-sky-100">
            <span className="text-sky-600 font-bold text-[10px] block uppercase">Tomorrow</span>
            <span className="font-black text-gray-900 text-sm">
              {weather.forecast[1]?.rainProb > 40 ? '⏸️ Skip — rain likely' : '💧 irrigate as planned'}
            </span>
            <span className="text-gray-500 text-[10px] block mt-0.5">
              {weather.forecast[1]?.rainProb > 40 ? 'Rain forecast: ' + weather.forecast[1].rainProb + '%' : 'Normal cycle'}
            </span>
          </div>
        </div>
      </div>

      {/* Spraying Advisory */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-700" />
          <h3 className="font-black text-sm text-amber-950">Spraying Window</h3>
        </div>
        <div className="text-xs text-amber-900 space-y-1.5">
          {weather.windSpeedKmH > 15 ? (
            <p className="font-bold text-rose-700">⚠️ Wind too strong ({weather.windSpeedKmH} km/h) — spray drift risk. Wait for calm conditions.</p>
          ) : weather.rainProbability > 40 ? (
            <p className="font-bold text-amber-700">⚠️ Rain likely ({weather.rainProbability}%) — spray will wash off. Wait for dry window.</p>
          ) : (
            <p className="font-bold text-emerald-700">✅ Good spraying window — low wind ({weather.windSpeedKmH} km/h), low rain chance ({weather.rainProbability}%).</p>
          )}
          <p className="text-amber-800">Best spray time: Early morning (6-9 AM) or late evening (4-6 PM) when wind is lowest.</p>
        </div>
      </div>

      {/* Weather Data Source */}
      <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-[10px] text-gray-500 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Data from Kolar Agri-Met Station. Forecasts are advisory — always verify with local observations.</span>
      </div>
    </div>
  );
}
