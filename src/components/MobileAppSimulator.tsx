import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { StorageZone, SmartTrap, Language, UserProfile, BeetleDetectionBox } from '../types';
import { translations } from '../utils/translations';
import { getSharedAppUrl, DEFAULT_DEV_APP_URL } from '../utils/urlHelper';
import {
  Smartphone,
  Scan,
  Thermometer,
  AlertTriangle,
  Factory,
  Bell,
  CheckCircle2,
  Sliders,
  Shield,
  RotateCw,
  Sparkles,
  Camera,
  X,
  ChevronRight,
  Download,
  Share2,
  Lock,
  QrCode,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface Props {
  zones: StorageZone[];
  traps: SmartTrap[];
  lang: Language;
  currentUser: UserProfile;
  onUpdateZoneClimate: (zoneId: string, temp: number, humidity: number) => void;
  onHaltLine?: (zoneId: string) => void;
  onSyncTrapCount: (trapId: string, newCount: number, detectedBoxes: BeetleDetectionBox[]) => void;
  onOpenQrModal?: () => void;
}

type MobileTab = 'scanner' | 'climate' | 'lines' | 'alerts';
type DeviceType = 'android' | 'iphone';

export const MobileAppSimulator: React.FC<Props> = ({
  zones,
  traps,
  lang,
  currentUser,
  onUpdateZoneClimate,
  onHaltLine,
  onSyncTrapCount,
  onOpenQrModal
}) => {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [deviceType, setDeviceType] = useState<DeviceType>('android');
  const [activeTab, setActiveTab] = useState<MobileTab>('scanner');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ count: number; syncSuccess: boolean } | null>(null);
  const [qrType, setQrType] = useState<'dev' | 'shared'>('dev');
  const [mobileQrUrl, setMobileQrUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const sharedUrl = getSharedAppUrl();
  const devUrl = typeof window !== 'undefined' ? window.location.href : DEFAULT_DEV_APP_URL;
  const currentUrl = qrType === 'shared' ? sharedUrl : devUrl;

  useEffect(() => {
    QRCode.toDataURL(currentUrl, {
      width: 240,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setMobileQrUrl(url))
      .catch((err) => console.error('Error generating mobile QR:', err));
  }, [currentUrl]);

  const handleCopyAppUrl = () => {
    navigator.clipboard?.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // Default active trap inside phone
  const defaultTrap = traps[0];
  const defaultZone = zones[0];

  // Mobile AI Scanner snapshot trigger
  const handleMobileScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      const detectedCount = defaultTrap?.catchCount24h || 9;
      setScanResult({ count: detectedCount, syncSuccess: true });
      onSyncTrapCount(defaultTrap.id, detectedCount, defaultTrap.detectedBoxes || []);
    }, 1400);
  };

  const totalBeetlesAll = traps.reduce((acc, curr) => acc + curr.catchCount24h, 0);

  return (
    <section id="mobile-apps-showcase" className="w-full bg-slate-950 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Switcher between Android and iPhone */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                {t.mobileAppSimulator}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  Android APK & iOS Native PWA
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">{t.mobileSubtitle}</p>
            </div>
          </div>

          {/* Device Type Toggle (Android vs iPhone) */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setDeviceType('android')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deviceType === 'android'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              {t.androidApp} (Pixel / Material 3)
            </button>
            <button
              type="button"
              onClick={() => setDeviceType('iphone')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                deviceType === 'iphone'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              {t.iphoneApp} (iOS 18 Titanium)
            </button>
          </div>
        </div>

        {/* Content Layout: Interactive Phone Device in center + Features & Installation panel on side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Handheld Smartphone Frame (7 cols) */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
            {/* The Outer Phone Hardware Shell */}
            <div
              className={`relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/19] rounded-[48px] p-3 transition-all duration-300 shadow-2xl ${
                deviceType === 'iphone'
                  ? 'bg-gradient-to-b from-stone-600 via-stone-800 to-stone-950 ring-4 ring-stone-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
                  : 'bg-gradient-to-b from-slate-700 via-slate-850 to-slate-950 ring-4 ring-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]'
              }`}
            >
              {/* Inner Screen Bezel */}
              <div className="relative w-full h-full bg-slate-950 rounded-[40px] overflow-hidden flex flex-col border border-slate-800 text-slate-100 font-sans">
                {/* Top Hardware Notches & Status Bar */}
                {deviceType === 'iphone' ? (
                  /* iPhone Dynamic Island Header */
                  <div className="relative pt-2 pb-1 px-5 flex items-center justify-between text-[11px] font-semibold text-slate-300 bg-slate-950 z-30 select-none">
                    <span className="font-mono">09:41</span>
                    {/* Dynamic Island Capsule */}
                    <div className="h-6 px-3 bg-black rounded-full border border-stone-800 flex items-center gap-2 shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      <span className="text-[10px] text-amber-300 font-mono font-bold">
                        🪲 {totalBeetlesAll} Weevils
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <span>5G</span>
                      <div className="w-5 h-2.5 rounded-sm border border-slate-400 p-0.5 flex items-center">
                        <div className="h-full w-3/4 bg-emerald-400 rounded-2xs"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Android Material 3 Status Bar */
                  <div className="pt-2 pb-1 px-5 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950 z-30 select-none">
                    <span>09:41</span>
                    {/* Punch-hole camera */}
                    <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800"></div>
                    <div className="flex items-center gap-1.5">
                      <span>LTE+</span>
                      <div className="w-4 h-2 rounded-2xs bg-emerald-500"></div>
                    </div>
                  </div>
                )}

                {/* Mobile App Header */}
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      M
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-none text-white">M-PAS Mobile</p>
                      <p className="text-[9px] text-amber-400 font-mono leading-none mt-0.5">
                        {isAr ? 'مصنع السجائر الذكي' : 'Cigarette Plant Suite'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ONLINE</span>
                  </div>
                </div>

                {/* Main Screen Content Area (Scrollable within Phone) */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
                  {/* TAB 1: AI Camera Scanner */}
                  {activeTab === 'scanner' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-b from-stone-900 to-slate-950 p-2 flex flex-col justify-between">
                        {/* Viewfinder reticle corners */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400"></div>

                        {/* Scanner Laser */}
                        {isScanning && (
                          <div className="absolute inset-x-0 h-1 bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-bounce z-10"></div>
                        )}

                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono z-10">
                          <span className="bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                            {defaultTrap.code}
                          </span>
                          <span className="text-emerald-400 font-bold">4K MACRO</span>
                        </div>

                        {/* Simulated Trap Bounding Boxes on Phone Screen */}
                        <div className="relative w-full h-32 my-auto flex items-center justify-center">
                          <div className="w-3/4 h-24 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-2 relative flex items-center justify-center">
                            <span className="text-[10px] text-amber-300 font-mono text-center">
                              {isAr ? 'وجّه كاميرا الهاتف نحو لوح المصيدة اللاصق' : 'Align Phone Camera with Sticky Trap Liner'}
                            </span>
                            {/* Insect icon pin */}
                            <div className="absolute top-2 left-3 w-4 h-4 rounded-full bg-red-500/30 border border-red-500 text-[8px] font-mono text-red-300 flex items-center justify-center">
                              🪲
                            </div>
                            <div className="absolute bottom-2 right-4 w-4 h-4 rounded-full bg-red-500/30 border border-red-500 text-[8px] font-mono text-red-300 flex items-center justify-center">
                              🪲
                            </div>
                          </div>
                        </div>

                        <div className="text-center z-10">
                          <button
                            type="button"
                            onClick={handleMobileScan}
                            disabled={isScanning}
                            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                          >
                            <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                            {isScanning
                              ? isAr
                                ? 'جاري الفحص البصري...'
                                : 'Scanning...'
                              : isAr
                              ? 'التقاط وعد الحشرات فورياً'
                              : 'Scan & Count Beetles'}
                          </button>
                        </div>
                      </div>

                      {/* Result Feedback Banner */}
                      {scanResult && (
                        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 animate-fadeIn space-y-1">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>
                              {isAr
                                ? `تم رصد ${scanResult.count} سوسة سجائر وتحديث السجل!`
                                : `Found ${scanResult.count} Cigarette Beetles! Synced.`}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-400/80">
                            {isAr ? 'تم استبعاد غبار وشوائب التبغ بنجاح' : 'Tobacco dust artifacts successfully filtered'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Live Climate Gauges */}
                  {activeTab === 'climate' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">
                            {isAr ? defaultZone.nameAr : defaultZone.nameEn}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                            {defaultZone.riskScore}/100 RISK
                          </span>
                        </div>

                        {/* Temp and Humidity circular metrics */}
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-amber-500/30">
                            <p className="text-[10px] text-amber-300">{t.ambientTemp}</p>
                            <p className="text-xl font-mono font-extrabold text-white mt-0.5">
                              {defaultZone.temp.toFixed(1)}°C
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30">
                            <p className="text-[10px] text-cyan-300">{t.relativeHumidity}</p>
                            <p className="text-xl font-mono font-extrabold text-white mt-0.5">
                              {defaultZone.humidity.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        {/* Quick HVAC button */}
                        <button
                          type="button"
                          onClick={() => onUpdateZoneClimate(defaultZone.id, 21.0, 62.0)}
                          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3 text-cyan-400" />
                          {t.standardMode}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Cigarette Production Lines */}
                  {activeTab === 'lines' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      {zones.map((zone) => (
                        <div
                          key={zone.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-200 text-xs">
                                {isAr ? zone.nameAr : zone.nameEn}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {zone.code} • 24h Catch: {zone.beetleCatch24h}
                              </p>
                            </div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                                zone.isCigaretteLineHalted
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {zone.isCigaretteLineHalted ? 'HALTED' : 'ACTIVE'}
                            </span>
                          </div>

                          {onHaltLine && (
                            <button
                              type="button"
                              onClick={() => onHaltLine(zone.id)}
                              disabled={!currentUser.permissions.canHaltCigaretteLines}
                              className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                currentUser.permissions.canHaltCigaretteLines
                                  ? zone.isCigaretteLineHalted
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    : 'bg-red-600/80 hover:bg-red-600 text-white'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {!currentUser.permissions.canHaltCigaretteLines && <Lock className="w-3 h-3 inline mr-1" />}
                              {zone.isCigaretteLineHalted ? t.resumeCigaretteLine : t.haltCigaretteLine}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 4: Alerts & User Profile */}
                  {activeTab === 'alerts' && (
                    <div className="space-y-3 animate-fadeIn">
                      {/* Operator Badge on Mobile */}
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center">
                          {currentUser.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs truncate">
                            {isAr ? currentUser.nameAr : currentUser.nameEn}
                          </p>
                          <p className="text-[10px] text-amber-400 font-mono">
                            {currentUser.clearanceLevel}
                          </p>
                        </div>
                      </div>

                      {/* Push Notifications List */}
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-[11px] space-y-1">
                          <p className="font-bold text-red-300">
                            {isAr ? 'إنذار مصيدة الكاميرا 01' : 'Alarm CAM-TRAP-A01'}
                          </p>
                          <p className="text-slate-300 text-[10px]">
                            {isAr
                              ? 'تجاوز كثافة سوس السجائر في محطة تفريغ فيرجينيا (9 حشرات)'
                              : 'High catch rate (9 beetles) in Virginia Leaf Unpacking.'}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] space-y-1">
                          <p className="font-bold text-amber-300">
                            {isAr ? 'تنبيه الفيرمون' : 'Lure Lifecycle Alert'}
                          </p>
                          <p className="text-slate-300 text-[10px]">
                            {isAr
                              ? 'كبسولة السيريكورنين بمصيدة CAM-A02 تبلغ 57 يوماً'
                              : 'CAM-A02 Serricornin dispenser reached Day 57 (replace in 72h).'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Bar inside Phone */}
                <div
                  className={`border-t border-slate-800/80 px-2 py-2 flex items-center justify-around z-20 ${
                    deviceType === 'iphone'
                      ? 'bg-slate-950/90 backdrop-blur-md pb-5'
                      : 'bg-slate-950 pb-2'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('scanner')}
                    className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                      activeTab === 'scanner' ? 'text-amber-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    <Scan className="w-4 h-4" />
                    <span className="text-[9px]">{isAr ? 'الماسح' : 'Scanner'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('climate')}
                    className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                      activeTab === 'climate' ? 'text-amber-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    <Thermometer className="w-4 h-4" />
                    <span className="text-[9px]">{isAr ? 'المناخ' : 'Climate'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('lines')}
                    className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                      activeTab === 'lines' ? 'text-amber-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    <Factory className="w-4 h-4" />
                    <span className="text-[9px]">{isAr ? 'الخطوط' : 'Lines'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('alerts')}
                    className={`flex flex-col items-center gap-1 p-1.5 transition-colors cursor-pointer ${
                      activeTab === 'alerts' ? 'text-amber-400 font-bold' : 'text-slate-500'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span className="text-[9px]">{isAr ? 'الإشعارات' : 'Alerts'}</span>
                  </button>
                </div>

                {/* iPhone Home Bar or Android Pill */}
                {deviceType === 'iphone' ? (
                  <div className="absolute bottom-1.5 inset-x-0 flex justify-center pointer-events-none">
                    <div className="w-32 h-1 bg-white/40 rounded-full"></div>
                  </div>
                ) : (
                  <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none">
                    <div className="w-16 h-1 bg-slate-600 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Platform Specifications & Mobile Deployment Details (5-7 cols) */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                {isAr ? 'التشغيل الميداني الذكي' : 'Native Mobile Field Deployment'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {deviceType === 'android'
                  ? isAr
                    ? 'تطبيق أندرويد المتكامل لمفتشي مصانع التبغ'
                    : 'Android Field Companion for Tobacco Manufacturing'
                  : isAr
                  ? 'تطبيق آيفون المعتمد لمراقبة جودة السجائر'
                  : 'iPhone Biosecurity & Cigarette Quality Inspector'}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {isAr
                  ? 'صُمم هذا التطبيق الميداني لتمكين مفتشي الجودة والمهندسين من تفقد مصائد السوس بالكاميرا المحمولة، وقراءة حساسات الحرارة والرطوبة عند خطوط التقطيع ومكائن السجائر (Hauni / Molins) دون الحاجة لجهاز مكتبي.'
                  : 'Engineered specifically for plant floor rounds. Inspectors can point their phone camera at any sticky trap liner for instant AI beetle counting, inspect cut rag silo temperatures, and trigger emergency line shutdowns.'}
              </p>
            </div>

            {/* Core Mobile Capabilities List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Camera className="w-4 h-4" />
                  <span>{isAr ? 'العد الفوري بالكاميرا' : 'Real-time Camera AI'}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'عد خنافس السجائر واليرقات واستبعاد ذرات غبار التبغ بدقة 98.4%'
                    : 'Instant detection of adult Lasioderma & larvae with leaf debris filtering.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Thermometer className="w-4 h-4" />
                  <span>{isAr ? 'حساسات المناخ الدقيق' : 'Live Microclimate Sync'}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'مراقبة الحرارة والرطوبة ونقطة الندى ورطوبة الأوراق المتوازنة (EMC)'
                    : 'Monitors chamber temperature, relative humidity, dew point, and EMC %.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                  <Factory className="w-4 h-4" />
                  <span>{isAr ? 'إيقاف طارئ لمكائن السجائر' : 'Line Halt Trigger'}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'زر طارئ مخصص لإيقاف خطوط السجائر فوراً عند رصد أي تلوث حشري'
                    : 'Direct emergency shutdown command for Maker & Packer lines.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Shield className="w-4 h-4" />
                  <span>{isAr ? 'عمل دون إنترنت (Offline)' : 'Offline Local Cache'}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'تسجيل القياسات في مستودعات التبغ المعزولة مع مزامنة تلقائية عند الاتصال'
                    : 'Cache inspections inside RF-shielded vaults; auto-syncs on reconnect.'}
                </p>
              </div>
            </div>

            {/* How to Install / Download QR Code Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <span>{t.scanToDownloadApp}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.scanWithPhoneCamera}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30 whitespace-nowrap">
                  PWA Ready • v3.2
                </span>
              </div>

              {/* Link Switcher Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-950/90 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setQrType('dev')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    qrType === 'dev'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'رابط التطوير (شغال الآن - يتطلب حساب جوجل)' : 'Dev Link (Active - Sign In)'}
                </button>
                <button
                  type="button"
                  onClick={() => setQrType('shared')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    qrType === 'shared'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'رابط المشاركة العام (بعد الضغط على Share)' : 'Public Shared Link (Post-Share)'}
                </button>
              </div>

              {/* QR Code and Quick Steps Container */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                {/* QR Code Graphic */}
                <div className="relative p-2 bg-white rounded-xl shadow-lg flex-shrink-0 cursor-pointer group" onClick={onOpenQrModal} title="Click to enlarge">
                  {mobileQrUrl ? (
                    <img
                      src={mobileQrUrl}
                      alt="Mobile Download QR Code"
                      className="w-28 h-28 object-contain rounded"
                    />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center text-slate-900">
                      <QrCode className="w-8 h-8 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-6 h-6 rounded-md bg-slate-950 border border-amber-400 flex items-center justify-center text-xs">
                      🪲
                    </div>
                  </div>
                </div>

                {/* Instructions & Actions */}
                <div className="space-y-2.5 flex-1 text-xs">
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {deviceType === 'android' ? t.androidInstallSteps : t.iphoneInstallSteps}
                  </p>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono">
                    {qrType === 'dev' ? (
                      <span className="text-amber-300">
                        {isAr
                          ? '💡 نصيحة: سجّل الدخول بحسابك في متصفح هاتفك ليفتح الرابط فوراً دون حظر.'
                          : '💡 Tip: Sign in with your Google account on your phone Chrome to open without block.'}
                      </span>
                    ) : (
                      <span className="text-emerald-300">
                        {isAr
                          ? '💡 إذا ظهر خطأ 404 Not Found، اضغط زر Share أعلى يمين الشاشة لتفعيل هذا الرابط.'
                          : '💡 If you see 404 Not Found, click Share in top-right of AI Studio to activate.'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyAppUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-medium transition-all cursor-pointer"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{copiedUrl ? t.urlCopied : t.copyAppUrl}</span>
                    </button>

                    {onOpenQrModal && (
                      <button
                        type="button"
                        onClick={onOpenQrModal}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تكبير الرمز وحل الصلاحيات' : 'Enlarge QR & Fix Access'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
