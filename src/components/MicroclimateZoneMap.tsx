import React, { useState } from 'react';
import { StorageZone, SmartTrap, Language, UserProfile } from '../types';
import { translations } from '../utils/translations';
import { Thermometer, Droplets, Bug, Radio, Eye, Layers, Camera, AlertOctagon, Lock } from 'lucide-react';

interface MicroclimateZoneMapProps {
  zones: StorageZone[];
  traps: SmartTrap[];
  lang: Language;
  currentUser?: UserProfile;
  onSelectTrap: (trap: SmartTrap) => void;
  onOpenQr: (trap: SmartTrap) => void;
  onHaltLine?: (zoneId: string) => void;
}

export const MicroclimateZoneMap: React.FC<MicroclimateZoneMapProps> = ({
  zones,
  traps,
  lang,
  currentUser,
  onSelectTrap,
  onOpenQr,
  onHaltLine
}) => {
  const t = translations[lang];
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');

  const filteredTraps = selectedZoneId === 'all'
    ? traps
    : traps.filter((trap) => trap.zoneId === selectedZoneId);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {t.facilityMap}
            </h3>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
              {lang === 'en' ? 'Cigarette Factory Spatial Grid' : 'المخطط المكاني لصالات مصنع السجائر'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {lang === 'en'
              ? 'Multi-zone microclimate monitoring, Serricornin traps, and high-speed cigarette making line surveillance'
              : 'مراقبة المناخ الدقيق ومصائد السيريكورنين وخطوط تصنيع السجائر فائقة السرعة'}
          </p>
        </div>

        {/* Zone Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedZoneId('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              selectedZoneId === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {lang === 'en' ? 'All Zones' : 'كافة الصالات'}
          </button>
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZoneId(zone.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedZoneId === zone.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{zone.code}</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  zone.riskLevel === 'critical'
                    ? 'bg-red-500'
                    : zone.riskLevel === 'high'
                    ? 'bg-orange-500'
                    : zone.riskLevel === 'moderate'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Spatial Warehouse Map Stage */}
      <div className="mt-5 relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl">
        {/* Floorplan Grid Layout (4 Quadrants) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {zones.map((zone) => {
            const isZoneSelected = selectedZoneId === 'all' || selectedZoneId === zone.id;
            const zoneTraps = traps.filter((t) => t.zoneId === zone.id);

            const riskBgClass =
              zone.riskLevel === 'critical'
                ? 'border-red-500/40 bg-red-950/10 hover:bg-red-950/20'
                : zone.riskLevel === 'high'
                ? 'border-orange-500/40 bg-orange-950/10 hover:bg-orange-950/20'
                : zone.riskLevel === 'moderate'
                ? 'border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/20'
                : 'border-emerald-500/30 bg-emerald-950/10 hover:bg-emerald-950/20';

            return (
              <div
                key={zone.id}
                className={`relative min-h-[240px] rounded-xl border p-4 transition-all flex flex-col justify-between ${riskBgClass} ${
                  !isZoneSelected ? 'opacity-30' : 'opacity-100'
                }`}
              >
                {/* Zone Header Badge */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {zone.code}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          {lang === 'en' ? zone.nameEn : zone.nameAr}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {lang === 'en' ? zone.leafTypeEn : zone.leafTypeAr}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border ${
                          zone.riskLevel === 'critical'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                            : zone.riskLevel === 'high'
                            ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                            : zone.riskLevel === 'moderate'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {zone.riskLevel}
                      </span>
                      {zone.isCigaretteLineHalted && (
                        <span className="rounded px-1.5 py-0.5 text-[9px] font-mono font-bold bg-red-600 text-white animate-pulse">
                          LINE HALTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Microclimate Telemetry Readout */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-lg bg-slate-900/80 p-2.5 text-center text-xs border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Temperature' : 'الحرارة'}</span>
                      <span className="font-mono font-bold text-amber-300 flex items-center justify-center gap-0.5 mt-0.5">
                        <Thermometer className="h-3 w-3" />
                        {zone.temp}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Humidity' : 'الرطوبة'}</span>
                      <span className="font-mono font-bold text-cyan-300 flex items-center justify-center gap-0.5 mt-0.5">
                        <Droplets className="h-3 w-3" />
                        {zone.humidity}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{lang === 'en' ? '24h Catch' : 'صيد 24س'}</span>
                      <span className="font-mono font-bold text-rose-400 flex items-center justify-center gap-0.5 mt-0.5">
                        <Bug className="h-3 w-3" />
                        {zone.beetleCatch24h}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Traps and Emergency Line Controls */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                      <span>{lang === 'en' ? `Active Smart Traps (${zoneTraps.length})` : `المصائد النشطة بالصالة (${zoneTraps.length})`}</span>
                      <span className="text-amber-400 text-[9px] font-mono">4K AI Camera Supported</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {zoneTraps.map((trap) => (
                        <button
                          key={trap.id}
                          onClick={() => onSelectTrap(trap)}
                          className={`group flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition-all cursor-pointer ${
                            trap.status === 'critical'
                              ? 'border-red-500/40 bg-red-950/30 text-red-200 hover:bg-red-900/40'
                              : trap.status === 'warning'
                              ? 'border-amber-500/40 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40'
                              : 'border-slate-700 bg-slate-900/90 text-slate-200 hover:border-slate-500'
                          }`}
                        >
                          {trap.hasAiCamera ? (
                            <Camera className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Radio className="h-3 w-3 text-amber-400" />
                          )}
                          <span className="font-mono font-bold text-[11px]">{trap.code}</span>
                          <span className="rounded bg-slate-800 px-1 py-0.1 text-[9px] font-mono text-rose-300">
                            {trap.catchCount24h} 🪲
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cigarette Maker Line Halt Control */}
                  {onHaltLine && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {zone.isCigaretteLineHalted ? (
                          <span className="text-red-400 font-bold">{t.lineHaltedWarning}</span>
                        ) : (
                          <span className="text-emerald-400">{t.lineOperational}</span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => onHaltLine(zone.id)}
                        disabled={!currentUser?.permissions.canHaltCigaretteLines}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer ${
                          currentUser?.permissions.canHaltCigaretteLines
                            ? zone.isCigaretteLineHalted
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-red-600/80 hover:bg-red-600 text-white'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {!currentUser?.permissions.canHaltCigaretteLines && <Lock className="w-3 h-3 inline" />}
                        {zone.isCigaretteLineHalted ? t.resumeCigaretteLine : t.haltCigaretteLine}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
