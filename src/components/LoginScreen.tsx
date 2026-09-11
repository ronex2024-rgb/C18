import React, { useState } from 'react';
import { UserProfile, Language } from '../types';
import { DEFAULT_USERS } from '../data/mockData';
import { translations } from '../utils/translations';
import {
  Bug,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Globe,
  Radio,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  ArrowRight,
  UserCheck,
  Smartphone,
  Zap,
  QrCode,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface LoginScreenProps {
  lang: Language;
  onToggleLang: () => void;
  onLogin: (user: UserProfile) => void;
  onOpenMobileQr?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  onToggleLang,
  onLogin,
  onOpenMobileQr
}) => {
  const t = translations[lang];
  const isAr = lang === 'ar';

  const [email, setEmail] = useState<string>('ronex2024@gmail.com');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile>(DEFAULT_USERS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSelectQuickProfile = (user: UserProfile) => {
    setSelectedUser(user);
    setEmail(user.email);
    setPassword('••••••••••••');
    setErrorMessage('');
  };

  const executeLogin = (userToLogin: UserProfile) => {
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      onLogin(userToLogin);
    }, 350);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال رمز المشغل أو البريد الإلكتروني' : 'Please enter operator ID or email');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const found = DEFAULT_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (found) {
      executeLogin(found);
    } else {
      // Build authorized custom operator with full permissions
      const customProfile: UserProfile = {
        id: 'user-' + Date.now(),
        email: email.trim(),
        nameEn: trimmedEmail.includes('ronex') ? 'Ronex Director' : email.split('@')[0] || 'Authorized Operator',
        nameAr: trimmedEmail.includes('ronex') ? 'المشرف العام (Ronex)' : 'مشغل المنظومة المعتمد',
        roleEn: 'Authorized Plant Biosecurity Director',
        roleAr: 'المشرف العام المعتمد للأمن الحيوي وتصنيع التبغ',
        clearanceLevel: 'PLANT_DIRECTOR',
        avatarInitials: trimmedEmail.includes('ronex') ? 'RX' : (email[0] || 'U').toUpperCase(),
        departmentEn: 'Executive Tobacco Biosecurity',
        departmentAr: 'الإدارة التنفيذية لمصانع السجائر',
        permissions: {
          canOverrideHvac: true,
          canCalibrateCameraAi: true,
          canTriggerFumigation: true,
          canSignPhytosanitaryCert: true,
          canHaltCigaretteLines: true,
          canManageUsers: true,
          canEditTraps: true,
          canExportAuditLogs: true
        }
      };
      executeLogin(customProfile);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* Background Subtle Tech Matrix Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar with Language Toggle & Station Info */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
          <span className="font-mono text-xs text-slate-200 font-semibold">
            {isAr ? 'محطة التحكم والوصول المباشر M-PAS v2.4' : 'M-PAS Central Access Terminal v2.4'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMobileQr && (
            <button
              type="button"
              onClick={onOpenMobileQr}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm cursor-pointer"
              title={isAr ? 'تحميل التطبيق على الهاتف' : 'Download Mobile App QR'}
            >
              <QrCode className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isAr ? 'تطبيق الهاتف QR' : 'Mobile QR'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-amber-500/40 hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center p-3 sm:p-6">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/95 shadow-2xl backdrop-blur-2xl lg:grid-cols-12">
          
          {/* Left Column: Biosecurity Brand & Telemetry Badge (5 cols) */}
          <div className="relative flex flex-col justify-between border-b border-slate-800 p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            <div>
              {/* Badge Icon */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 text-2xl">
                  🪲
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                    {t.platformTitle}
                  </h1>
                  <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    Lasioderma serricorne Biosecurity
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-300">
                {isAr
                  ? 'بوابة تسجيل الدخول ومنح تصاريح الوصول لمنظومة رصد سوسة التبغ والتحكم بالمناخ الدقيق في صالات ومستودعات تصنيع السجائر.'
                  : t.loginSubtitle}
              </p>

              {/* Instant 1-Click Entry Buttons for Mobile & Desktop */}
              <div className="mt-5 space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>{isAr ? 'الدخول السريع بنقرة واحدة (موصى به)' : '1-Click Instant Access (Recommended)'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => executeLogin(DEFAULT_USERS[0])}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md hover:shadow-amber-500/25 cursor-pointer text-start"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-950/20 flex items-center justify-center font-bold">
                      ⚡
                    </div>
                    <div>
                      <span className="block font-black text-xs">
                        {isAr ? 'دخول مباشر بكامل الصلاحيات (مدير المصنع)' : 'Direct Entry: Plant Director'}
                      </span>
                      <span className="block text-[10px] text-slate-900/80 font-medium">
                        {isAr ? 'تجاوز شاشات الانتظار وفتح جميع الخصائص' : 'Bypass wait & open all controls'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => executeLogin(DEFAULT_USERS[4])}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all cursor-pointer text-start"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs text-white">
                        {isAr ? 'دخول فوري لهواتف الأندرويد وفنيي الميدان' : 'Instant Android & Field Mobile Entry'}
                      </span>
                      <span className="block text-[10px] text-emerald-400/90 font-mono">
                        {isAr ? 'مخصص للكاميرا وفحص المصائد السريعة' : 'Optimized for mobile camera & trap scans'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                </button>
              </div>

              {/* Warehouse Microclimate Snapshot */}
              <div className="mt-5 space-y-2 rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {isAr ? 'حالة المنظومة البيئية المباشرة' : 'Warehouse Live Climate Status'}
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 p-2 border border-slate-800">
                    <Thermometer className="h-4 w-4 text-rose-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'متوسط الحرارة' : 'Avg Temp'}</span>
                      <span className="font-mono font-bold text-white">29.8°C</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 p-2 border border-slate-800">
                    <Droplets className="h-4 w-4 text-sky-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'متوسط الرطوبة' : 'Avg RH'}</span>
                      <span className="font-mono font-bold text-white">68.5%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Radio className="h-3 w-3 animate-pulse" />
                    {isAr ? '8 مصائد ذكية نشطة' : '8 Smart Traps Online'}
                  </span>
                  <span className="text-amber-400 font-semibold font-mono text-[10px]">
                    {isAr ? 'منطقة A: تنبيه وقائي' : 'Zone A: Warning'}
                  </span>
                </div>
              </div>
            </div>

            {/* Certification Footer Note */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                CORESTA Guide No. 2
              </span>
              <span className="font-mono text-[10px] text-slate-500">TLS 256-bit Encrypted</span>
            </div>
          </div>

          {/* Right Column: Authentication Form & Operator Quick Select (7 cols) */}
          <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-4 mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                    <span>{isAr ? 'تسجيل الدخول وبدء التشغيل' : t.loginTitle}</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {isAr
                      ? 'اختر مشغل معتمد أو أدخل بريدك لتسجيل جلسة العمل الرسمية'
                      : 'Authenticate clearance or select a pre-verified operator below'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex-shrink-0">
                  {isAr ? 'جاهز للاتصال' : 'Online'}
                </span>
              </div>

              {/* Quick Profile Selector Buttons */}
              <div className="mb-5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {t.quickProfiles}
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DEFAULT_USERS.slice(0, 4).map((user) => {
                    const isSelected = selectedUser.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectQuickProfile(user)}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-start transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50'
                            : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold">
                            {isAr ? user.nameAr : user.nameEn}
                          </span>
                          <span className="block truncate text-[10px] text-slate-400">
                            {isAr ? user.roleAr : user.roleEn}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-rose-300 border border-rose-500/30">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-medium">
                      {t.operatorId}
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmail('ronex2024@gmail.com')}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      {isAr ? 'استخدام: ronex2024@gmail.com' : 'Use ronex2024@gmail.com'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      placeholder="operator@mpas-bio.org / ronex2024@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {t.password}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-10 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-slate-300 text-[11px]">
                      {t.rememberTerminal}
                    </span>
                  </label>

                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    {isAr ? 'مستوى التصريح:' : 'Clearance:'} {selectedUser.clearanceLevel}
                  </span>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        <span>{isAr ? 'جارِ التحقق ومنح تصريح الوصول...' : 'Verifying Credentials & Granting Access...'}</span>
                      </span>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        <span>{t.login} - {isAr ? selectedUser.nameAr : selectedUser.nameEn}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Guest Entrance */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => executeLogin(DEFAULT_USERS[3])}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.guestAuditor}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <span className="text-[10px] text-slate-500 font-mono">
                {isAr ? 'وصول آمن لمصانع السجائر' : 'Industrial Access Protocol'}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-500">
        <p>M-PAS Platform • Lasioderma serricorne Biosecurity Protection Architecture</p>
      </footer>
    </div>
  );
};
