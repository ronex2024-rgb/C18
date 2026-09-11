import React, { useState } from 'react';
import { SmartTrap, Language } from '../types';
import { translations } from '../utils/translations';
import { calculateLureEfficacy } from '../utils/bioCalculations';
import { Radio, QrCode, ClipboardCheck, Battery, Wifi, Sparkles, Bug, AlertCircle } from 'lucide-react';

interface SerricorninTrapManagerProps {
  traps: SmartTrap[];
  lang: Language;
  onOpenQr: (trap: SmartTrap) => void;
  onOpenInspection: (trap: SmartTrap) => void;
}

export const SerricorninTrapManager: React.FC<SerricorninTrapManagerProps> = ({
  traps,
  lang,
  onOpenQr,
  onOpenInspection
}) => {
  const t = translations[lang];
  const [filterZone, setFilterZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTraps = traps.filter((trap) => {
    const matchesZone = filterZone === 'all' || trap.zoneId === filterZone;
    const matchesSearch =
      trap.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trap.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trap.nameAr.includes(searchQuery);
    return matchesZone && matchesSearch;
  });

  return (
    <section id="traps-section" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {t.trapsListTitle}
            </h3>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/40">
              {traps.length} Traps Deployed
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t.trapsListSubtitle}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search trap ID or bay...' : 'بحث عن رمز المصيدة أو الموقع...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Traps Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredTraps.map((trap) => {
          const efficacy = calculateLureEfficacy(trap.serricorninAgeDays, trap.serricorninMaxDays);
          const isUrgent = trap.serricorninAgeDays >= 50;

          return (
            <div
              key={trap.id}
              className={`relative flex flex-col justify-between rounded-xl border bg-slate-950 p-4 transition-all hover:border-slate-600 shadow-md ${
                isUrgent ? 'border-amber-500/50 ring-1 ring-amber-500/30' : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                      <Radio className="h-4 w-4" />
                    </span>
                    <div>
                      <span className="font-mono text-sm font-bold text-white">
                        {trap.code}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {trap.zoneId.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Battery & Signal Status */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <Battery className="h-3 w-3 text-emerald-400" />
                      {trap.batteryPct}%
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Wifi className="h-3 w-3 text-sky-400" />
                      {trap.signalRssi}dBm
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <h4 className="text-xs font-semibold text-slate-200">
                    {lang === 'en' ? trap.nameEn : trap.nameAr}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {lang === 'en' ? trap.locationDetailsEn : trap.locationDetailsAr}
                  </p>
                </div>

                {/* Catch Counts */}
                <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-900/90 p-2 border border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <Bug className="h-4 w-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">24h Catch</span>
                      <span className="font-mono text-sm font-bold text-rose-400">
                        {trap.catchCount24h}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Lifetime</span>
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {trap.totalCatch}
                    </span>
                  </div>
                </div>

                {/* Serricornin Pheromone Lure Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      {t.lureAge}: Day {trap.serricorninAgeDays} / 60
                    </span>
                    <span className={`font-mono font-bold ${efficacy.urgencyColor}`}>
                      {efficacy.daysRemaining} {t.daysRemaining}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        efficacy.condition === 'depleted'
                          ? 'bg-rose-500'
                          : efficacy.condition === 'declining'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(trap.serricorninAgeDays / 60) * 100}%` }}
                    />
                  </div>
                  {isUrgent && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-amber-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{lang === 'en' ? 'Pheromone dispenser renewal required soon' : 'مطلوب تجديد كبسولة الفيرمون قريباً'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center gap-2 border-t border-slate-800/80 pt-3">
                <button
                  onClick={() => onOpenInspection(trap)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  <ClipboardCheck className="h-3.5 w-3.5" />
                  <span>{t.logInspection}</span>
                </button>

                <button
                  onClick={() => onOpenQr(trap)}
                  className="flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  title={t.viewQr}
                >
                  <QrCode className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
