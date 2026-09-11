import React, { useState } from 'react';
import { Language, AiDiagnosisResult, StorageZone } from '../types';
import { translations } from '../utils/translations';
import { Sparkles, Send, ShieldAlert, CheckCircle2, BookOpen, Cpu, Info, Loader2 } from 'lucide-react';

interface AiAgronomicAdvisorProps {
  zones: StorageZone[];
  lang: Language;
}

export const AiAgronomicAdvisor: React.FC<AiAgronomicAdvisorProps> = ({
  zones,
  lang
}) => {
  const t = translations[lang];
  const [query, setQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>(zones[0]?.nameEn || 'Zone A - Raw Leaf Storage');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AiDiagnosisResult | null>({
    source: 'gemini-3.8-flash',
    urgencyLevel: 'HIGH',
    advice: 'Elevated microclimate risk detected in Zone A (31.4°C, 71.8% RH). Accumulated degree-days indicate active pupation flight waves. Urgent intervention recommended to avoid larval penetration into cured leaf bales.',
    treatmentPlan: [
      'Initiate targeted humidity suppression to drop RH below 60% within 48 hours to induce larval egg desiccation.',
      'Deploy supplementary Serricornin mating disruption dispensers (1 unit per 25 m²) along perimeter flight corridors.',
      'Schedule closed-chamber Phosphine (PH3) fumigation at 250 ppm for 120 hours if 24h trap counts exceed 15 adults/trap.',
      'Inspect seal integrity on loading doors to prevent outdoor nocturnal migration into storage bays.'
    ],
    biologicalRationale: 'Lasioderma serricorne development velocity reaches maximum physiological potential between 30°C and 34°C. Relative humidity above 68% supports symbiotic yeast (Symbiomyces lasiodermae) in the insect digestive caeca, boosting larval survival.',
    phytosanitaryNotice: 'Compliant with CORESTA Guide No. 2 (Fumigation and Storage Hygiene) and ISO 22000.'
  });

  const handleRunDiagnostic = async (customQuery?: string) => {
    const textToSend = customQuery || query;
    if (!textToSend.trim()) return;

    setLoading(true);
    try {
      const activeZoneObj = zones.find((z) => z.nameEn === selectedZone) || zones[0];
      const response = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          zone: selectedZone,
          currentTemp: activeZoneObj?.temp,
          currentHumidity: activeZoneObj?.humidity,
          catchCount: activeZoneObj?.beetleCatch24h,
          degreeDays: activeZoneObj?.degreeDaysAccumulated
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          source: data.source || 'gemini-3.8-flash',
          urgencyLevel: data.urgencyLevel || 'HIGH',
          advice: data.advice,
          treatmentPlan: data.treatmentPlan || [],
          biologicalRationale: data.biologicalRationale || '',
          phytosanitaryNotice: data.phytosanitaryNotice || ''
        });
      }
    } catch (err) {
      console.error('Failed to run AI diagnostic:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetText: string) => {
    setQuery(presetText);
    handleRunDiagnostic(presetText);
  };

  return (
    <section id="ai-section" className="rounded-2xl border border-amber-500/30 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-sm shadow-xl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="text-lg font-bold text-white sm:text-xl">
              {t.aiTitle}
            </h3>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {t.aiSubtitle}
          </p>
        </div>

        {/* Target Zone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Target Area:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.nameEn}>
                {z.code} - {lang === 'en' ? z.nameEn : z.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          {t.presetQuestions}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePresetClick('Evaluate Phosphine PH3 fumigation dosing, CT exposure curve, and seal safety for tobacco bales')}
            className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-amber-500/50 hover:bg-slate-800 transition-colors"
          >
            {t.presetPhosphine}
          </button>
          <button
            onClick={() => handlePresetClick('Recommend chilling or blast freeze thermal duration to kill 100% of Lasioderma eggs and larvae without chemical residues')}
            className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-amber-500/50 hover:bg-slate-800 transition-colors"
          >
            {t.presetChilling}
          </button>
          <button
            onClick={() => handlePresetClick('How to configure Serricornin mating disruption lure grid to suppress adult breeding during peak emergence wave?')}
            className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-amber-500/50 hover:bg-slate-800 transition-colors"
          >
            {t.presetPheromone}
          </button>
          <button
            onClick={() => handlePresetClick('Check phytosanitary export requirements and threshold action levels under CORESTA guidelines for cured leaf export')}
            className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-amber-500/50 hover:bg-slate-800 transition-colors"
          >
            {t.presetCoresta}
          </button>
        </div>
      </div>

      {/* Interactive Input Form */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRunDiagnostic()}
          placeholder={t.aiPlaceholder}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          onClick={() => handleRunDiagnostic()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-all shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t.analyzing}</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>{t.analyzeBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Output Protocol Results Card */}
      {result && (
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
          {/* Result Header & Urgency Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Diagnostic Assessment
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Source: {result.source}
              </span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                result.urgencyLevel === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                  : result.urgencyLevel === 'HIGH'
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              Urgency: {result.urgencyLevel}
            </span>
          </div>

          {/* Primary Advice Statement */}
          <div className="mt-4 text-sm font-medium text-slate-100 leading-relaxed">
            {result.advice}
          </div>

          {/* Actionable Treatment Plan */}
          {result.treatmentPlan && result.treatmentPlan.length > 0 && (
            <div className="mt-4 rounded-lg bg-slate-900/90 p-4 border border-slate-800">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Targeted Action Protocol
              </h5>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.treatmentPlan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 font-mono text-[10px] font-bold text-amber-400 border border-amber-500/30">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Biological & Compliance Details */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 text-xs">
            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <BookOpen className="h-3.5 w-3.5 text-sky-400" />
                Biological Rationale
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {result.biologicalRationale}
              </p>
            </div>

            <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
                Phytosanitary Regulatory Standard
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {result.phytosanitaryNotice}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
