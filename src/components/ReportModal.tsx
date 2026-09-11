import React from 'react';
import { StorageZone, SmartTrap, Language } from '../types';
import { translations } from '../utils/translations';
import { X, Printer, ShieldCheck, Bug, CheckCircle, FileText } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: StorageZone[];
  traps: SmartTrap[];
  lang: Language;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  zones,
  traps,
  lang
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const totalCatch24h = traps.reduce((sum, t) => sum + t.catchCount24h, 0);
  const totalLifetimeCatch = traps.reduce((sum, t) => sum + t.totalCatch, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Header */}
        <div className="flex items-start justify-between border-b-2 border-amber-500/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Bug className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                {t.reportTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                M-PAS Biosecurity Protocol • CORESTA Guide No. 2 Phytosanitary Tobacco Standard
              </p>
            </div>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            <span className="block font-bold text-amber-400">DOC REF: TOB-IPM-2026-09</span>
            <span className="block mt-0.5">{currentDate}</span>
          </div>
        </div>

        {/* Facility Overview Grid */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Pest</span>
            <span className="font-semibold text-amber-300 mt-1 block">Lasioderma serricorne</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">24h Adult Catch</span>
            <span className="font-mono text-base font-bold text-rose-400 mt-1 block">{totalCatch24h} beetles</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Traps</span>
            <span className="font-mono text-base font-bold text-sky-400 mt-1 block">{traps.length} deployed</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Phytosanitary Status</span>
            <span className="font-semibold text-emerald-400 mt-1 block">Quarantine Regulated</span>
          </div>
        </div>

        {/* Warehouse Zone Microclimate Breakdown */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Storage Zone Microclimate & Biological Threat Log
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                <tr>
                  <th className="p-2.5">Zone Code</th>
                  <th className="p-2.5">Storage Type</th>
                  <th className="p-2.5">Temp (°C)</th>
                  <th className="p-2.5">RH (%)</th>
                  <th className="p-2.5">Degree-Days</th>
                  <th className="p-2.5">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 font-mono text-[11px]">
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td className="p-2.5 font-bold text-amber-400">{zone.code}</td>
                    <td className="p-2.5 font-sans text-slate-200">{zone.nameEn}</td>
                    <td className="p-2.5">{zone.temp}°C</td>
                    <td className="p-2.5">{zone.humidity}%</td>
                    <td className="p-2.5 text-slate-300">{zone.degreeDaysAccumulated} DD</td>
                    <td className="p-2.5 font-bold uppercase">
                      <span
                        className={
                          zone.riskLevel === 'critical'
                            ? 'text-red-400'
                            : zone.riskLevel === 'high'
                            ? 'text-orange-400'
                            : zone.riskLevel === 'moderate'
                            ? 'text-amber-300'
                            : 'text-emerald-400'
                        }
                      >
                        {zone.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Serricornin Smart Traps Status Table */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Serricornin Pheromone Trap Telemetry Summary
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 text-[11px]">
                <tr>
                  <th className="p-2.5">Trap ID</th>
                  <th className="p-2.5">Location Bay</th>
                  <th className="p-2.5">24h Count</th>
                  <th className="p-2.5">Lure Age</th>
                  <th className="p-2.5">Battery</th>
                  <th className="p-2.5">Last Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-900/60 text-[11px]">
                {traps.map((trap) => (
                  <tr key={trap.id}>
                    <td className="p-2.5 font-bold text-white">{trap.code}</td>
                    <td className="p-2.5 font-sans text-slate-300">{trap.nameEn}</td>
                    <td className="p-2.5 text-rose-400 font-bold">{trap.catchCount24h}</td>
                    <td className="p-2.5">
                      Day {trap.serricorninAgeDays} / 60
                    </td>
                    <td className="p-2.5 text-emerald-400">{trap.batteryPct}%</td>
                    <td className="p-2.5 text-slate-400">{trap.lastInspection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Certification Statement */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Phytosanitary Officer Endorsement</span>
          </div>
          <p>
            I hereby certify that the electronic Serricornin smart pheromone trap network and microclimate temperature-humidity sensors have been calibrated in accordance with M-PAS Biosecurity Standard SOP-402 and CORESTA tobacco storage specifications.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px]">
            <div>
              <span className="text-slate-400 block">Lead Entomologist Sign-off:</span>
              <span className="font-semibold text-white">Dr. Tariq Al-Ghamdi, Ph.D.</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Biosecurity Stamp:</span>
              <span className="font-mono text-emerald-400 font-bold">M-PAS VERIFIED ✓</span>
            </div>
          </div>
        </div>

        {/* Print & Close Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
          >
            {t.close}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-lg"
          >
            <Printer className="h-4 w-4" />
            <span>{t.generatePdf}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
