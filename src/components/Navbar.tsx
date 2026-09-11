import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { translations } from '../utils/translations';
import { usePwaInstall } from '../hooks/usePwaInstall';
import {
  ShieldCheck,
  Globe,
  FileText,
  Radio,
  Bug,
  LogOut,
  User,
  Thermometer,
  ChevronDown,
  QrCode,
  Smartphone,
  Download
} from 'lucide-react';

interface NavbarProps {
  lang: Language;
  currentUser: UserProfile | null;
  onToggleLang: () => void;
  onOpenReport: () => void;
  onScrollToSection: (sectionId: string) => void;
  onLogout: () => void;
  onOpenPermissions: () => void;
  onOpenQrModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  currentUser,
  onToggleLang,
  onOpenReport,
  onScrollToSection,
  onLogout,
  onOpenPermissions,
  onOpenQrModal
}) => {
  const t = translations[lang];
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const { isInstallable, triggerInstall } = usePwaInstall();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
            <Bug className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                {t.platformTitle}
              </span>
              <span className="hidden rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-500/30 sm:inline-block">
                Lasioderma serricorne
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              {t.platformSubtitle}
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Nav Links */}
          <div className="hidden lg:flex items-center gap-1 border-r border-slate-800 pr-2 mr-1">
            <button
              onClick={() => onScrollToSection('temp-humidity-section')}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-500/10 transition-colors"
            >
              <Thermometer className="h-3.5 w-3.5" />
              <span>{t.tempAndHumidity}</span>
            </button>
            <button
              onClick={() => onScrollToSection('ai-camera-center')}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <span>{lang === 'ar' ? 'كاميرات وعد السوس' : 'AI Cameras'}</span>
            </button>
            <button
              onClick={() => onScrollToSection('mobile-apps-showcase')}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <span>{lang === 'ar' ? 'تطبيقات الجوال' : 'Mobile Apps'}</span>
            </button>
            <button
              onClick={() => onScrollToSection('traps-section')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {t.smartTraps}
            </button>
            <button
              onClick={() => onScrollToSection('ai-section')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
            >
              {t.aiConsult}
            </button>
          </div>

          {/* PWA Direct In-App Install Trigger when supported */}
          {isInstallable && (
            <button
              onClick={triggerInstall}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/60 bg-emerald-600/20 px-2.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600/30 transition-all shadow-sm cursor-pointer animate-pulse"
              title={lang === 'ar' ? 'تثبيت البرنامج على هذا الجهاز' : 'Install PWA App'}
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>{lang === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
            </button>
          )}

          {/* Mobile Download QR Button */}
          {onOpenQrModal && (
            <button
              onClick={onOpenQrModal}
              className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm cursor-pointer"
              title={t.scanToDownloadApp}
            >
              <QrCode className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'تحميل التطبيق QR' : 'Mobile App QR'}</span>
            </button>
          )}

          {/* User Permissions (RBAC) Button */}
          <button
            onClick={onOpenPermissions}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1.5 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all shadow-sm cursor-pointer"
            title={t.userPermissions}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden sm:inline">{t.userPermissions}</span>
          </button>

          {/* Audit Report Button */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
            title="Export Phytosanitary Certificate"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t.exportReport}</span>
          </button>

          {/* Bilingual Toggle (EN / AR) */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm cursor-pointer"
          >
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* User Account / Sign Out Component */}
          {currentUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 pl-2 pr-2.5 py-1 text-xs text-white hover:border-amber-500/40 transition-all cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold text-[10px]">
                  {currentUser.avatarInitials}
                </div>
                <div className="hidden xl:block text-left">
                  <span className="block font-bold text-[11px] leading-tight">
                    {lang === 'en' ? currentUser.nameEn : currentUser.nameAr}
                  </span>
                  <span className="block text-[9px] text-amber-400 font-mono">
                    {currentUser.clearanceLevel}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className={`absolute mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-950 p-2 shadow-2xl z-50 ${
                    lang === 'ar' ? 'left-0' : 'right-0'
                  }`}
                >
                  <div className="border-b border-slate-800 p-2.5 text-xs space-y-1">
                    <span className="block font-bold text-white">
                      {lang === 'en' ? currentUser.nameEn : currentUser.nameAr}
                    </span>
                    <span className="block text-[10px] text-slate-400 truncate">
                      {currentUser.email}
                    </span>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="inline-block rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/20">
                        {lang === 'en' ? currentUser.roleEn : currentUser.roleAr}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {currentUser.clearanceLevel}
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5 border-b border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenPermissions();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-500/10 transition-colors text-left"
                    >
                      <ShieldCheck className="h-4 w-4 text-purple-400" />
                      <span>{t.managePermissions}</span>
                    </button>
                  </div>

                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

