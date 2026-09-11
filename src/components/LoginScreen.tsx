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
  UserCheck
} from 'lucide-react';

interface LoginScreenProps {
  lang: Language;
  onToggleLang: () => void;
  onLogin: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  onToggleLang,
  onLogin
}) => {
  const t = translations[lang];

  const [email, setEmail] = useState<string>('tariq.ghamdi@mpas-bio.org');
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(lang === 'en' ? 'Please enter operator ID or email' : 'يرجى إدخال رمز المشغل أو البريد');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // Find matching user or fallback to selected/custom
      const matched = DEFAULT_USERS.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      ) || {
        ...selectedUser,
        email: email.trim(),
        nameEn: email.split('@')[0] || 'Operator',
        nameAr: 'مشغل النظام'
      };

      setIsLoading(false);
      onLogin(matched);
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar with Language Toggle & Station Info */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] text-slate-300">
            {t.terminalId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm"
          >
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center justify-center p-4 sm:p-6">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl lg:grid-cols-12">
          
          {/* Left Column: Biosecurity Brand & Telemetry Badge (5 cols) */}
          <div className="relative flex flex-col justify-between border-b border-slate-800 p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r lg:border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950">
            <div>
              {/* Badge Icon */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                  <Bug className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                    {t.platformTitle}
                  </h1>
                  <span className="inline-block rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    Lasioderma serricorne Control
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-300">
                {t.loginSubtitle}
              </p>

              {/* Real-time Environmental Snapshot Preview */}
              <div className="mt-6 space-y-2.5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Warehouse Climate Live Snapshot
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
                    <Thermometer className="h-4 w-4 text-rose-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Avg Temp</span>
                      <span className="font-mono font-bold text-white">29.8°C</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
                    <Droplets className="h-4 w-4 text-sky-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">Avg RH</span>
                      <span className="font-mono font-bold text-white">68.5%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Radio className="h-3 w-3 text-emerald-400" />
                    8 Traps Online
                  </span>
                  <span className="text-amber-400 font-semibold font-mono">
                    Zone A: High Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Certification Footer Note */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                CORESTA Guide No. 2
              </span>
              <span className="font-mono text-[10px] text-slate-400">v2.4.2 Secure</span>
            </div>
          </div>

          {/* Right Column: Authentication Form & Operator Quick Select (7 cols) */}
          <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-800 pb-4 mb-5">
                <h2 className="text-lg font-bold text-white sm:text-xl">
                  {t.loginTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {lang === 'en'
                    ? 'Authenticate biosecurity clearance or pick a verified operator below'
                    : 'قم بتسجيل الدخول برمز المشغل أو اختر أحد الملفات المعتمدة أدناه'}
                </p>
              </div>

              {/* Quick Profile Selector Buttons */}
              <div className="mb-5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {t.quickProfiles}
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {DEFAULT_USERS.map((user) => {
                    const isSelected = selectedUser.id === user.id;
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectQuickProfile(user)}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500/50'
                            : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold">
                            {lang === 'en' ? user.nameEn : user.nameAr}
                          </span>
                          <span className="block truncate text-[10px] text-slate-400">
                            {lang === 'en' ? user.roleEn : user.roleAr}
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
              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-rose-300 border border-rose-500/30">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {t.operatorId}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="operator@mpas-bio.org"
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
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-10 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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

                  <span className="text-[11px] font-mono text-amber-400/90">
                    Clearance: {selectedUser.clearanceLevel}
                  </span>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                        <span>Verifying Credentials...</span>
                      </span>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        <span>{t.login} ({lang === 'en' ? selectedUser.nameEn : selectedUser.nameAr})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Guest Entrance */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => onLogin(DEFAULT_USERS[3])}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{t.guestAuditor}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500">
        <p>M-PAS Platform • Lasioderma serricorne Biosecurity Protection Architecture</p>
      </footer>
    </div>
  );
};
