import React, { useState } from 'react';
import { StorageZone, Language } from '../types';
import { translations } from '../utils/translations';
import {
  calculateDewPointAnalysis,
  getMicroclimateCategory,
  calculateDegreeDays
} from '../utils/bioCalculations';
import { HOURLY_TELEMETRY } from '../data/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Snowflake,
  Flame,
  AlertTriangle,
  Zap,
  Gauge,
  Layers,
  ArrowDownRight,
  Info,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';

interface TemperatureHumidityCenterProps {
  zones: StorageZone[];
  lang: Language;
  currentUser?: UserProfile;
  onUpdateZoneClimate: (zoneId: string, newTemp: number, newHumidity: number) => void;
  onApplyGlobalClimate: (temp: number, humidity: number) => void;
}

export const TemperatureHumidityCenter: React.FC<TemperatureHumidityCenterProps> = ({
  zones,
  lang,
  currentUser,
  onUpdateZoneClimate,
  onApplyGlobalClimate
}) => {
  const t = translations[lang];
  const canOverrideHvac = currentUser?.permissions.canOverrideHvac ?? true;

  // Average temperature and humidity across all active zones
  const avgTemp = zones.length
    ? Math.round((zones.reduce((sum, z) => sum + z.temp, 0) / zones.length) * 10) / 10
    : 28.5;
  const avgHumidity = zones.length
    ? Math.round((zones.reduce((sum, z) => sum + z.humidity, 0) / zones.length) * 10) / 10
    : 66.2;

  // Interactive HVAC Setpoint State
  const [targetTemp, setTargetTemp] = useState<number>(avgTemp);
  const [targetHumidity, setTargetHumidity] = useState<number>(avgHumidity);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
  const [hvacFeedback, setHvacFeedback] = useState<string>('');

  // Dew point and moisture analysis for current average or target
  const dewAnalysis = calculateDewPointAnalysis(targetTemp, targetHumidity);
  const bioCategory = getMicroclimateCategory(targetTemp, targetHumidity);
  const degreeDays = calculateDegreeDays(targetTemp);

  const handleApplyHvac = () => {
    if (!canOverrideHvac) {
      setHvacFeedback(
        lang === 'en'
          ? 'Access Restricted: You lack permission to override HVAC setpoints (requires HVAC Engineer clearance).'
          : 'صلاحية غير كافية: حسابك لا يملك إذن تعديل معايير التكييف والتبريد بالمصنع (يتطلب تصريح مهندس تكييف).'
      );
      setTimeout(() => setHvacFeedback(''), 4000);
      return;
    }

    if (selectedZoneId === 'all') {
      onApplyGlobalClimate(targetTemp, targetHumidity);
      setHvacFeedback(
        lang === 'en'
          ? `Global HVAC synchronized to ${targetTemp}°C and ${targetHumidity}% RH`
          : `تمت مزامنة تكييف جميع الأجنحة إلى ${targetTemp}°م و ${targetHumidity}% رطوبة`
      );
    } else {
      onUpdateZoneClimate(selectedZoneId, targetTemp, targetHumidity);
      const zoneName = zones.find((z) => z.id === selectedZoneId)?.nameEn || selectedZoneId;
      setHvacFeedback(
        lang === 'en'
          ? `HVAC setpoint applied to ${zoneName} (${targetTemp}°C, ${targetHumidity}% RH)`
          : `تم تطبيق إعدادات التكييف للجناح (${targetTemp}°م، ${targetHumidity}% رطوبة)`
      );
    }

    setTimeout(() => {
      setHvacFeedback('');
    }, 4000);
  };

  const handleQuickPreset = (temp: number, humidity: number) => {
    setTargetTemp(temp);
    setTargetHumidity(humidity);
  };

  const handleResetToSensors = () => {
    setTargetTemp(avgTemp);
    setTargetHumidity(avgHumidity);
    setHvacFeedback(
      lang === 'en' ? 'Reset to live physical sensor readings' : 'تمت استعادة قراءات الحساسات الميدانية'
    );
    setTimeout(() => setHvacFeedback(''), 3000);
  };

  return (
    <section
      id="temp-humidity-section"
      className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-7 backdrop-blur-md shadow-2xl space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 to-sky-500/20 text-amber-400 border border-amber-500/30">
              <Thermometer className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              {t.tempAndHumidityTitle}
            </h2>
            <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-400 border border-sky-500/30 hidden sm:inline-block">
              {lang === 'en' ? 'Psychrometric Telemetry' : 'القياسات السيكرومترية'}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 max-w-3xl">
            {t.tempAndHumiditySubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>4 Sensor Nodes Online</span>
          </span>
        </div>
      </div>

      {/* Primary Telemetry Dials: Temp, Humidity, Dew Point, EMC, VPD */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* 1. Ambient Temperature */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.ambientTemp}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Thermometer className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              {targetTemp.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Base DD: 17.0°C</span>
            <span className="font-mono font-bold text-amber-400">
              +{degreeDays.toFixed(1)} DD/day
            </span>
          </div>
        </div>

        {/* 2. Relative Humidity */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-sky-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.relativeHumidity}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Droplets className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              {targetHumidity.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">% RH</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Optimum: 65–70%</span>
            <span className={`font-mono font-bold ${targetHumidity > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {targetHumidity > 70 ? 'High Humidity' : 'Controlled'}
            </span>
          </div>
        </div>

        {/* 3. Dew Point (نقطة الندى) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-indigo-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t.dewPoint}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CloudRain className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              {dewAnalysis.dewPointC.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Margin: {(targetTemp - dewAnalysis.dewPointC).toFixed(1)}°C</span>
            <span
              className={`font-mono font-bold ${
                dewAnalysis.condensationRisk === 'CRITICAL'
                  ? 'text-rose-400'
                  : dewAnalysis.condensationRisk === 'HIGH'
                  ? 'text-orange-400'
                  : 'text-emerald-400'
              }`}
            >
              {dewAnalysis.condensationRisk} Risk
            </span>
          </div>
        </div>

        {/* 4. Equilibrium Moisture Content (EMC %) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tobacco Leaf EMC
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              {dewAnalysis.equilibriumMoistureContent.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Target: 12–14%</span>
            <span className="font-mono font-bold text-emerald-400">
              Standard Bales
            </span>
          </div>
        </div>

        {/* 5. Vapor Pressure Deficit (VPD) */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Vapor Deficit (VPD)
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Wind className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-white sm:text-3xl">
              {dewAnalysis.vpdKpa.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-slate-400">kPa</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Evap Pressure</span>
            <span className="font-mono font-bold text-sky-400">Active Airflow</span>
          </div>
        </div>
      </div>

      {/* Biological Danger Zone Alert Banner */}
      <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${bioCategory.color}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950/80 border border-slate-700">
            {targetTemp >= 30 && targetHumidity >= 65 ? (
              <Flame className="h-5 w-5 text-rose-400 animate-pulse" />
            ) : targetTemp <= 17 ? (
              <Snowflake className="h-5 w-5 text-sky-400" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {lang === 'en' ? bioCategory.labelEn : bioCategory.labelAr}
              </span>
              <span className="rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-mono font-extrabold">
                {bioCategory.badge}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-300">
              {lang === 'en' ? bioCategory.descriptionEn : bioCategory.descriptionAr}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Condensation Warning</span>
          <span className="text-xs font-mono font-bold">
            {lang === 'en' ? dewAnalysis.hazardSummaryEn : dewAnalysis.hazardSummaryAr}
          </span>
        </div>
      </div>

      {/* Interactive HVAC Control Deck & 24-Hour Trends Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Interactive Microclimate & HVAC Override (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  {t.hvacControls}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetToSensors}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                title={t.resetClimate}
              >
                <RefreshCw className="h-3 w-3" />
                <span>{t.resetSliders}</span>
              </button>
            </div>

            {/* Target Area Selection */}
            <div className="mt-3">
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Target Ventilation Zone
              </label>
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="all">
                  {lang === 'en' ? 'All Warehouse Chambers (Global HVAC)' : 'كافة أجنحة المستودع (تحكم شامل)'}
                </option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.code} - {lang === 'en' ? zone.nameEn : zone.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Thermometer className="h-3.5 w-3.5 text-rose-400" />
                  {t.targetTemp}
                </span>
                <span className="font-mono text-sm font-black text-rose-400">
                  {targetTemp.toFixed(1)}°C
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="38"
                step="0.5"
                value={targetTemp}
                onChange={(e) => setTargetTemp(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>15°C (Chilling)</span>
                <span>21°C (Optimal Cured)</span>
                <span>32°C (Beetle Surge)</span>
                <span>38°C</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <Droplets className="h-3.5 w-3.5 text-sky-400" />
                  {t.targetRh}
                </span>
                <span className="font-mono text-sm font-black text-sky-400">
                  {targetHumidity.toFixed(1)}% RH
                </span>
              </div>
              <input
                type="range"
                min="35"
                max="85"
                step="1"
                value={targetHumidity}
                onChange={(e) => setTargetHumidity(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>35% (Desiccation)</span>
                <span>55% (Safe)</span>
                <span>68% (Beetle Peak)</span>
                <span>85% (Mold Risk)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Biological Control Presets
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleQuickPreset(16.5, 52)}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-center hover:border-sky-500 hover:bg-slate-800 transition-all"
                >
                  <Snowflake className="h-4 w-4 text-sky-400 mb-1" />
                  <span className="font-semibold text-slate-200">Chilling</span>
                  <span className="text-[9px] text-slate-400">16.5°C / 52%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset(21.0, 62)}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-center hover:border-emerald-500 hover:bg-slate-800 transition-all"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mb-1" />
                  <span className="font-semibold text-slate-200">Standard</span>
                  <span className="text-[9px] text-slate-400">21.0°C / 62%</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPreset(24.0, 48)}
                  className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-900/90 p-2 text-center hover:border-amber-500 hover:bg-slate-800 transition-all"
                >
                  <Wind className="h-4 w-4 text-amber-400 mb-1" />
                  <span className="font-semibold text-slate-200">Dehumidify</span>
                  <span className="text-[9px] text-slate-400">24.0°C / 48%</span>
                </button>
              </div>
            </div>
          </div>

          {/* Apply Button & Feedback Toast */}
          <div>
            {hvacFeedback && (
              <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-emerald-500/20 p-2 text-[11px] text-emerald-300 border border-emerald-500/40 animate-fade-in">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>{hvacFeedback}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyHvac}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer ${
                canOverrideHvac
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {canOverrideHvac ? (
                <Zap className="h-4 w-4 text-slate-950" />
              ) : (
                <Lock className="h-4 w-4 text-amber-400" />
              )}
              <span>{t.applyHvac}</span>
              {!canOverrideHvac && (
                <span className="text-[10px] text-amber-400 font-mono">({t.permissionDenied})</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: 24-Hour Diurnal Trend Curves (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-sky-400" />
                  {t.diurnalTrends}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Hourly dual-sensor telemetry vs. critical Lasioderma threshold boundary (30°C / 70% RH)
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                  Temp (°C)
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <span className="h-2 w-2 rounded-full bg-sky-500 inline-block" />
                  RH (%)
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={HOURLY_TELEMETRY}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  {/* Reference line for 30°C optimal beetle breeding */}
                  <ReferenceLine
                    y={30}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    label={{ value: '30°C Danger Threshold', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }}
                  />

                  <XAxis
                    dataKey="timestamp"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[15, 85]}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#f8fafc'
                    }}
                    formatter={(val: number, name: string) => [
                      name === 'temp' ? `${val}°C` : `${val}%`,
                      name === 'temp' ? 'Temperature' : 'Relative Humidity'
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHumidity)"
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTemp)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3 text-amber-400" />
              Peak diurnal hazard occurs between 12:00 and 16:00 when external ambient heat penetrates warehouse intake louvers.
            </span>
            <span className="font-mono text-slate-300">
              Mean Diurnal Swing: Δ4.7°C
            </span>
          </div>
        </div>
      </div>

      {/* Zone-by-Zone Telemetry Sensors Grid */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-400" />
          {t.zoneSensors}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map((zone) => {
            const zDew = calculateDewPointAnalysis(zone.temp, zone.humidity);
            const zCat = getMicroclimateCategory(zone.temp, zone.humidity);

            return (
              <div
                key={zone.id}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-4 transition-all hover:border-slate-700 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-amber-400">
                      {zone.code}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${
                        zone.riskLevel === 'critical'
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : zone.riskLevel === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : zone.riskLevel === 'moderate'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {zone.riskLevel}
                    </span>
                  </div>

                  <h4 className="mt-1 text-xs font-bold text-white">
                    {lang === 'en' ? zone.nameEn : zone.nameAr}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    {lang === 'en' ? zone.leafTypeEn : zone.leafTypeAr}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-900/90 p-2.5 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Thermometer className="h-3 w-3 text-rose-400" />
                        Temp
                      </span>
                      <span className="font-mono text-base font-bold text-white block mt-0.5">
                        {zone.temp}°C
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-sky-400" />
                        Humidity
                      </span>
                      <span className="font-mono text-base font-bold text-white block mt-0.5">
                        {zone.humidity}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Dew Point:</span>
                      <span className="font-mono text-slate-200 font-semibold">{zDew.dewPointC}°C</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Leaf EMC:</span>
                      <span className="font-mono text-emerald-400 font-semibold">{zDew.equilibriumMoistureContent}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedZoneId(zone.id);
                      setTargetTemp(zone.temp);
                      setTargetHumidity(zone.humidity);
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-500/50 hover:bg-slate-800 transition-colors"
                  >
                    Adjust Zone Climate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
