import React, { useState } from 'react';
import { SmartTrap, Language, InspectionRecord } from '../types';
import { translations } from '../utils/translations';
import { X, ClipboardCheck, Sparkles, AlertCircle, Save } from 'lucide-react';

interface InspectionModalProps {
  trap: SmartTrap | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveInspection: (record: Omit<InspectionRecord, 'id' | 'timestamp'>) => void;
  lang: Language;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  trap,
  isOpen,
  onClose,
  onSaveInspection,
  lang
}) => {
  const t = translations[lang];

  const [inspectorName, setInspectorName] = useState<string>('Biosecurity Specialist');
  const [beetleCount, setBeetleCount] = useState<number>(trap?.catchCount24h || 5);
  const [lureReplaced, setLureReplaced] = useState<boolean>(false);
  const [lureCondition, setLureCondition] = useState<'fresh' | 'optimal' | 'declining' | 'depleted'>('optimal');
  const [stickyLinerReplaced, setStickyLinerReplaced] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('Routine manual verification. Optical counter calibrated.');

  if (!isOpen || !trap) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInspection({
      trapCode: trap.code,
      zoneId: trap.zoneId,
      inspectorName,
      beetleCount,
      lureReplaced,
      lureCondition,
      stickyLinerReplaced,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {t.logInspection}: {trap.code}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {trap.zoneId.toUpperCase()} • {lang === 'en' ? trap.nameEn : trap.nameAr}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Inspector Name & Designation
            </label>
            <input
              type="text"
              required
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Verified Adult Beetle Count
              </label>
              <input
                type="number"
                min="0"
                max="500"
                value={beetleCount}
                onChange={(e) => setBeetleCount(parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Pheromone Septa Condition
              </label>
              <select
                value={lureCondition}
                onChange={(e) => setLureCondition(e.target.value as any)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="fresh">Fresh (Days 1–20)</option>
                <option value="optimal">Optimal (Days 21–40)</option>
                <option value="declining">Declining (Days 41–55)</option>
                <option value="depleted">Depleted (&gt;55 Days)</option>
              </select>
            </div>
          </div>

          {/* Replacement Checkboxes */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={lureReplaced}
                onChange={(e) => setLureReplaced(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="text-slate-200 font-semibold block">
                  Replaced Serricornin Lure (Reset to Day 0)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Installs new 1.0 mg synthetic pheromone dispenser (valid for 60 days).
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer border-t border-slate-800/80 pt-2">
              <input
                type="checkbox"
                checked={stickyLinerReplaced}
                onChange={(e) => setStickyLinerReplaced(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              <div>
                <span className="text-slate-200 font-semibold block">
                  Replaced Sticky Glue-Board Insert
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Removes accumulated dust and trapped specimens for clear optical telemetry.
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Field Observations & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {t.close}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md"
            >
              <Save className="h-4 w-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
