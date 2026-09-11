import React, { useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { Language } from '../types';
import { Download, X, Smartphone, CheckCircle, Share } from 'lucide-react';

interface Props {
  lang: Language;
}

export const PwaInstallBanner: React.FC<Props> = ({ lang }) => {
  const { isInstallable, isInstalled, triggerInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const isAr = lang === 'ar';

  if (isInstalled || dismissed) {
    return null;
  }

  // We can also show this banner on mobile devices even if deferredPrompt hasn't fired yet
  const isMobileDevice = typeof window !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!isInstallable && !isMobileDevice) {
    return null;
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await triggerInstall();
    setInstalling(false);
    if (!success) {
      // If native prompt wasn't supported directly, give quick guidance
      alert(
        isAr
          ? 'لتثبيت التطبيق على هاتفك: اضغط على زر القائمة (⋮) أعلى متصفح Chrome ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".'
          : 'To install on your phone: Tap the menu (⋮) in Chrome and tap "Install app" or "Add to Home screen".'
      );
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-slate-900/95 border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white animate-bounce-short">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl flex-shrink-0">
            🪲
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{isAr ? 'تثبيت تطبيق M-PAS على الهاتف' : 'Install M-PAS Android App'}</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded border border-emerald-500/30">
                PWA APK
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">
              {isAr
                ? 'ثبّت البرنامج الآن على هاتفك الأندرويد لاستخدامه في فحص المصائد بدون إنترنت'
                : 'Install now on your phone for offline field camera inspections in the factory'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isAr ? 'تثبيت التطبيق الآن على هاتفي' : 'Install App Now'}</span>
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
        >
          {isAr ? 'لاحقاً' : 'Later'}
        </button>
      </div>
    </div>
  );
};
