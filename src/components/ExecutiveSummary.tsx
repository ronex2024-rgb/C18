import React from 'react';
import { StorageZone, SmartTrap, Language } from '../types';
import { translations } from '../utils/translations';
import { AlertTriangle, TrendingUp, Sparkles, Activity, Thermometer, Droplets, BatteryCharging } from 'lucide-react';

interface ExecutiveSummaryProps {
  zones: StorageZone[];
  traps: SmartTrap[];
  lang: Language;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  zones,
  traps,
  lang
}) => {
  const t = translations[lang];

  // Calculations
  const totalCatch24h = traps.reduce((sum, trap) => sum + trap.catchCount24h, 0);
  const totalCatchAllTime = traps.reduce((sum, trap) => sum + trap.totalCatch, 0);
  const avgTemp = (zones.reduce((sum, z) => sum + z.temp, 0) / zones.length).toFixed(1);
  const avgHumidity = (zones.reduce((sum, z) => sum + z.humidity, 0) / zones.length).toFixed(1);
  
  // Overall max risk score across storage zones
  const maxRiskScore = Math.max(...zones.map((z) => z.riskScore));
  const trapsRequiringRenewal = traps.filter((t) => t.serricorninAgeDays >= 50).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Microclimate Risk Score */}
      <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/20 to-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">
            {t.overallRisk}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {maxRiskScore}
          </span>
          <span className="text-sm font-medium text-red-400">/ 100</span>
          <span className="ml-auto rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-300 border border-red-500/40 animate-pulse">
            {t.critical}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span className="flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-amber-400" />
            {avgTemp}°C Avg
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-cyan-400" />
            {avgHumidity}% RH
          </span>
        </div>
      </div>

      {/* Metric 2: 24h Adult Beetle Catch */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            {t.twentyFourHourCatch}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {totalCatch24h}
          </span>
          <span className="text-xs font-medium text-slate-400">adults / 24h</span>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-rose-400">
            <TrendingUp className="h-3 w-3" />
            +28%
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span>Total Accumulated: {totalCatchAllTime}</span>
          <span className="text-amber-400 font-medium">8 Optical Traps</span>
        </div>
      </div>

      {/* Metric 3: Next Emergence Wave Peak Warning */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-950/20 to-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
            {t.peakWaveWarning}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-orange-200">
            4.5 Days
          </span>
          <span className="ml-auto rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-bold text-orange-300 border border-orange-500/40">
            Wave 1 Peak
          </span>
        </div>
        <div className="mt-3 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <p className="line-clamp-1">
            {lang === 'en'
              ? 'Pupal eclosion accelerates under 31°C / 72% RH'
              : 'تسارع خروج العذارى تحت حرارة 31°م ورطوبة 72%'}
          </p>
        </div>
      </div>

      {/* Metric 4: Serricornin Lure Health */}
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/20 to-slate-900/80 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            {t.lureHealth}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white font-mono">
            {traps.length - trapsRequiringRenewal} / {traps.length}
          </span>
          <span className="text-xs font-medium text-sky-300">Active</span>
          {trapsRequiringRenewal > 0 && (
            <span className="ml-auto rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
              {trapsRequiringRenewal} {t.requiresReplacement}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
          <span className="flex items-center gap-1">
            <BatteryCharging className="h-3 w-3 text-emerald-400" />
            91% Avg Battery
          </span>
          <span>60d Cycle Lifespan</span>
        </div>
      </div>
    </div>
  );
};
