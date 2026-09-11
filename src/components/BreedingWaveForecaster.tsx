import React, { useState, useMemo } from 'react';
import { Language, WaveForecastDay } from '../types';
import { translations } from '../utils/translations';
import { generateBreedingWaveForecast, BASE_PHYSIOLOGICAL_TEMP } from '../utils/bioCalculations';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { RefreshCw, ShieldAlert, Thermometer, Droplets, Info } from 'lucide-react';

interface BreedingWaveForecasterProps {
  initialTemp?: number;
  initialHumidity?: number;
  lang: Language;
}

export const BreedingWaveForecaster: React.FC<BreedingWaveForecasterProps> = ({
  initialTemp = 31.4,
  initialHumidity = 71.8,
  lang
}) => {
  const t = translations[lang];

  // What-if simulator state
  const [simTemp, setSimTemp] = useState<number>(initialTemp);
  const [simHumidity, setSimHumidity] = useState<number>(initialHumidity);

  // Compute 20-day dynamic predictive model based on slider parameters
  const forecastDays: WaveForecastDay[] = useMemo(() => {
    return generateBreedingWaveForecast(simTemp, simHumidity, 14);
  }, [simTemp, simHumidity]);

  const handleReset = () => {
    setSimTemp(initialTemp);
    setSimHumidity(initialHumidity);
  };

  // Peak days detection
  const primaryPeakDay = forecastDays.find((d) => d.dayNumber === 5);
  const secondaryPeakDay = forecastDays.find((d) => d.dayNumber === 18);

  return (
    <section id="forecaster-section" className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {t.forecasterTitle}
            </h2>
            <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/40">
              15–20d Horizon
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            {t.forecasterSubtitle}
          </p>
        </div>

        {/* Reset Simulation Button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>{t.resetSliders}</span>
        </button>
      </div>

      {/* Interactive Microclimate Sliders (What-If Analysis) */}
      <div className="mt-5 grid grid-cols-1 gap-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 lg:grid-cols-2">
        {/* Temperature Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Thermometer className="h-4 w-4 text-amber-400" />
              {t.tempSlider}
            </span>
            <span className="font-mono text-sm font-bold text-amber-300">
              {simTemp.toFixed(1)}°C
            </span>
          </div>
          <input
            type="range"
            min="15.0"
            max="38.0"
            step="0.5"
            value={simTemp}
            onChange={(e) => setSimTemp(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>15°C (Development Ceases &lt;17°C)</span>
            <span>30–34°C (Optimum Hazard)</span>
            <span>38°C</span>
          </div>
        </div>

        {/* Relative Humidity Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Droplets className="h-4 w-4 text-cyan-400" />
              {t.humiditySlider}
            </span>
            <span className="font-mono text-sm font-bold text-cyan-300">
              {simHumidity.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="35.0"
            max="85.0"
            step="1.0"
            value={simHumidity}
            onChange={(e) => setSimHumidity(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>35% (Desiccation &lt;50%)</span>
            <span>65–75% (Maximum Growth)</span>
            <span>85%</span>
          </div>
        </div>
      </div>

      {/* Target Intervention Window Callout */}
      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              {t.interventionWindow}
            </h4>
            <p className="text-xs text-slate-300">
              {t.interventionDescription}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 font-mono text-xs font-semibold">
          <div className="rounded-lg bg-slate-950/80 px-3 py-1.5 border border-slate-800 text-amber-400">
            Wave 1 Peak: Day 5 ({primaryPeakDay?.emergenceRiskIndex}% Risk)
          </div>
          <div className="rounded-lg bg-slate-950/80 px-3 py-1.5 border border-slate-800 text-orange-400">
            Wave 2 Peak: Day 18 ({secondaryPeakDay?.emergenceRiskIndex}% Risk)
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-6 h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastDays} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#d97706" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#b45309" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="catchGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#0891b2" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Visual Highlights for Periodic Wave Windows */}
            <ReferenceLine x={forecastDays[4]?.date} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Wave 1 Peak', fill: '#f59e0b', fontSize: 10 }} />
            <ReferenceLine x={forecastDays[17]?.date} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Wave 2 Peak', fill: '#f97316', fontSize: 10 }} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[0, 100]}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as WaveForecastDay;
                  return (
                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-bold text-white">
                          Day {data.dayNumber} ({data.date})
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                            data.riskLevel === 'critical'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : data.riskLevel === 'high'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {data.riskLevel}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-4 text-amber-400">
                          <span>Emergence Risk:</span>
                          <span className="font-mono font-bold">{data.emergenceRiskIndex}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-cyan-400">
                          <span>Est. Catch Velocity:</span>
                          <span className="font-mono font-bold">{data.predictedCatchRate} beetles/trap/day</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-slate-400">
                          <span>Accumulated DD:</span>
                          <span className="font-mono">{data.accumulatedDegreeDays} Degree-Days</span>
                        </div>
                        {data.isPeakEmergenceWave && (
                          <div className="mt-1 rounded bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-300 border border-amber-500/20">
                            ⚡ Peak Emergence Eclosion Flight Window
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical Threshold', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" />

            <Area
              type="monotone"
              dataKey="emergenceRiskIndex"
              name="Emergence Risk"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#riskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Biological Explanation Footer */}
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-950/40 p-3 text-xs text-slate-400 border border-slate-800/60">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <p>
          <strong>Biological Model:</strong> Under current simulation ({simTemp.toFixed(1)}°C, {simHumidity.toFixed(1)}% RH), physiological degree-day velocity is{' '}
          <span className="font-mono text-amber-300">
            {Math.max(0, simTemp - BASE_PHYSIOLOGICAL_TEMP).toFixed(1)} DD/day
          </span>
          . Complete generation requires ~450 DD. Trapping efficiency rises during the 15–20 day periodic flight waves as emerging adults respond to female serricornin lures.
        </p>
      </div>
    </section>
  );
};
