import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { getSharedAppUrl, DEFAULT_DEV_APP_URL, DEFAULT_SHARED_APP_URL, isRunningInDevContainer } from '../utils/urlHelper';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  QrCode,
  AlertCircle,
  HelpCircle,
  Globe,
  Share2,
  Lock,
  MessageSquare,
  Mail
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MobileDownloadQrModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activePlatform, setActivePlatform] = useState<'android' | 'iphone'>('android');
  const [urlMode, setUrlMode] = useState<'shared' | 'dev'>('shared');
  const [copied, setCopied] = useState<boolean>(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState<boolean>(true);

  // Compute selected URL: default to public shared URL to avoid 'do not have access to this page'
  const sharedUrl = getSharedAppUrl();
  const devUrl = typeof window !== 'undefined' ? window.location.href : DEFAULT_DEV_APP_URL;
  const currentAppUrl = urlMode === 'shared' ? sharedUrl : devUrl;

  useEffect(() => {
    if (isOpen && currentAppUrl) {
      QRCode.toDataURL(currentAppUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H'
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating mobile download QR code:', err));
    }
  }, [isOpen, currentAppUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(currentAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQrImage = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `mpas-mobile-qr-${urlMode}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 sm:p-7 shadow-2xl text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {t.scanToDownloadApp}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {t.scanWithPhoneCamera}
            </p>
          </div>
        </div>

        {/* URL Target Selector (Shared vs Dev) */}
        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'نوع الرابط المرمز في الـ QR:' : 'Target Endpoint URL:'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              {urlMode === 'shared' ? (isAr ? 'مفتوح للأجهزة الخارجية' : 'Public Access') : (isAr ? 'محمي بحساب المطور' : 'Protected Dev')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUrlMode('shared')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                urlMode === 'shared'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{t.sharedUrlLabel}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate font-mono">
                {sharedUrl}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setUrlMode('dev')}
              className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border cursor-pointer ${
                urlMode === 'dev'
                  ? 'bg-amber-950/70 border-amber-500 text-amber-300 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>{t.devUrlLabel}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 truncate font-mono">
                {devUrl}
              </p>
            </button>
          </div>
        </div>

        {/* PROMINENT SOLUTION FOR "do not have access to this page" */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/30 border border-amber-500/40 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{t.accessIssueTitle}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTroubleshooting(!showTroubleshooting)}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              {showTroubleshooting ? (isAr ? 'إخفاء الشرح' : 'Hide details') : (isAr ? 'عرض الحل' : 'Show details')}
            </button>
          </div>

          {showTroubleshooting && (
            <div className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed pt-1 border-t border-amber-500/20">
              <p className="text-amber-200/90 font-medium">
                {t.accessCause}
              </p>
              <div className="space-y-1.5 rounded-xl bg-slate-950/80 p-2.5 border border-slate-800 text-[11px]">
                <p className="text-rose-300 font-mono">
                  {t.notFoundExplanation}
                </p>
                <p className="text-amber-300 font-mono">
                  {t.accessExplanation}
                </p>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-300 pl-1">
                <li className="text-emerald-300 font-semibold">
                  {t.accessSolution1}
                </li>
                <li>
                  {t.accessSolution2}
                </li>
                <li>
                  {t.accessSolution3}
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Platform Selector (Android vs iPhone) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActivePlatform('android')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePlatform === 'android'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android (Google Chrome)</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePlatform('iphone')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePlatform === 'iphone'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Apple iPhone (iOS Safari)</span>
          </button>
        </div>

        {/* Central QR Code Display Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="relative group p-4 bg-white rounded-2xl shadow-xl">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Mobile Download QR Code"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-slate-900">
                <QrCode className="w-12 h-12 animate-pulse" />
              </div>
            )}

            {/* Central app watermark on QR */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border-2 border-amber-400 flex items-center justify-center text-xl shadow-lg">
                🪲
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>M-PAS Cigarette & Tobacco Biosecurity PWA</span>
          </div>

          {/* Active Encoded URL Display */}
          <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 font-mono flex items-center justify-between gap-2">
            <span className="truncate">{currentAppUrl}</span>
            <a
              href={currentAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 flex-shrink-0"
              title="Test URL in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Installation Instructions According to Selected Platform */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'خطوات التثبيت على الهاتف:' : 'Quick Installation Guide:'}</span>
          </div>

          {activePlatform === 'android' ? (
            <ol className="space-y-1.5 text-slate-300 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
              <li>
                {isAr
                  ? 'وجه كاميرا هاتفك الأندرويد نحو رمز الـ QR أعلاه وافتح الرابط في Google Chrome'
                  : 'Point your Android camera at the QR code and open the link in Google Chrome'}
              </li>
              <li>
                {isAr
                  ? 'إذا طُلِب منك، سجّل الدخول بحساب جوجل المعتمد للمصنع'
                  : 'If prompted by Google, sign in with your authorized factory Google account'}
              </li>
              <li>
                {isAr
                  ? 'سيظهر إشعار أسفل الشاشة "تثبيت التطبيق" أو من قائمة المتصفح (⋮) اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"'
                  : 'Tap the "Install App" banner or browser menu (⋮) > "Install app" / "Add to Home screen"'}
              </li>
              <li>
                {isAr
                  ? 'اضغط "تثبيت" لتنزيل أيقونة التطبيق واستخدامه دون إنترنت داخل مصنع السجائر'
                  : 'Tap "Install" to place the native icon on your home screen with full offline capability'}
              </li>
            </ol>
          ) : (
            <ol className="space-y-1.5 text-slate-300 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
              <li>
                {isAr
                  ? 'امسح رمز الـ QR بكاميرا الآيفون لفتح الرابط في متصفح Safari'
                  : 'Scan the QR code with iPhone Camera to open the link in Safari'}
              </li>
              <li>
                {isAr
                  ? 'اضغط على زر المشاركة (⎋ Share) أسفل المتصفح'
                  : 'Tap the Safari Share button (⎋) at the bottom of the screen'}
              </li>
              <li>
                {isAr
                  ? 'اختر من القائمة "إضافة إلى الشاشة الرئيسية" (+ Add to Home Screen)'
                  : 'Scroll down and tap "Add to Home Screen" (+)'}
              </li>
            </ol>
          )}
        </div>

        {/* Action Buttons: Copy URL, Open New Tab & Download QR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
            <span>{copied ? t.urlCopied : t.copyAppUrl}</span>
          </button>

          <a
            href={currentAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all text-center"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'اختبار الرابط' : 'Test Open'}</span>
          </a>

          <button
            type="button"
            onClick={handleDownloadQrImage}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'حفظ الرمز' : 'Save QR'}</span>
          </button>
        </div>

        {/* Send to Mobile Helpers (WhatsApp / Mail) */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 text-[11px]">
            {isAr ? 'طرق بديلة لفتح الرابط على هاتفك مباشرة:' : 'Send link directly to your mobile:'}
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent((isAr ? 'رابط تطبيق منصة السجائر M-PAS: ' : 'M-PAS Platform App Link: ') + currentAppUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 text-[11px] font-medium transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'إرسال لواتساب هاتفي' : 'Send to WhatsApp'}</span>
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(isAr ? 'رابط تطبيق M-PAS للأندرويد' : 'M-PAS App Link')}&body=${encodeURIComponent(currentAppUrl)}`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-all"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'إرسال بالبريد' : 'Email'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
