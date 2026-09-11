/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageZone, SmartTrap, Language, InspectionRecord, UserProfile, BeetleDetectionBox, UserPermissionSet } from './types';
import { INITIAL_ZONES, INITIAL_TRAPS, DEFAULT_USERS } from './data/mockData';
import { translations } from './utils/translations';
import { calculateMicroclimateRisk } from './utils/bioCalculations';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { TemperatureHumidityCenter } from './components/TemperatureHumidityCenter';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { BreedingWaveForecaster } from './components/BreedingWaveForecaster';
import { MicroclimateZoneMap } from './components/MicroclimateZoneMap';
import { SerricorninTrapManager } from './components/SerricorninTrapManager';
import { AiAgronomicAdvisor } from './components/AiAgronomicAdvisor';
import { AiCameraTrapCounter } from './components/AiCameraTrapCounter';
import { UserPermissionsModal } from './components/UserPermissionsModal';
import { MobileAppSimulator } from './components/MobileAppSimulator';
import { MobileDownloadQrModal } from './components/MobileDownloadQrModal';
import { QrCodeModal } from './components/QrCodeModal';
import { InspectionModal } from './components/InspectionModal';
import { ReportModal } from './components/ReportModal';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { Bug } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('ar'); // Default to Arabic as requested by user
  const [zones, setZones] = useState<StorageZone[]>(INITIAL_ZONES);
  const [traps, setTraps] = useState<SmartTrap[]>(INITIAL_TRAPS);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(DEFAULT_USERS);

  // User Authentication State (Login / Logout Screen)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('mpas_user_session');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return null; // Show Login Screen first to allow secure & direct access for all devices
  });

  // Modal states
  const [selectedTrapForQr, setSelectedTrapForQr] = useState<SmartTrap | null>(null);
  const [selectedTrapForInspection, setSelectedTrapForInspection] = useState<SmartTrap | null>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState<boolean>(false);
  const [isMobileDownloadQrOpen, setIsMobileDownloadQrOpen] = useState<boolean>(false);

  // Sync HTML dir attribute for RTL support with Arabic
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Authentication Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('mpas_user_session', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('mpas_user_session');
    } catch {
      // ignore
    }
  };

  // Update permissions for a specific user
  const handleUpdateUserPermissions = (userId: string, newPermissions: UserPermissionSet) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions: newPermissions } : u))
    );
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, permissions: newPermissions };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('mpas_user_session', JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
    }
  };

  // Emergency Halt / Resume Cigarette Maker Lines
  const handleHaltCigaretteLine = (zoneId: string) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const isHalted = !zone.isCigaretteLineHalted;
          return {
            ...zone,
            isCigaretteLineHalted: isHalted
          };
        }
        return zone;
      })
    );
  };

  // Synchronize AI Camera Weevil Count to Trap & Zone
  const handleSyncTrapCount = (trapId: string, newCount: number, detectedBoxes: BeetleDetectionBox[]) => {
    setTraps((prev) =>
      prev.map((trap) => {
        if (trap.id === trapId) {
          const newStatus = newCount >= 8 ? 'critical' : newCount >= 4 ? 'warning' : 'nominal';
          return {
            ...trap,
            catchCount24h: newCount,
            lastAiCount: newCount,
            detectedBoxes: detectedBoxes,
            status: newStatus,
            lastInspection: new Date().toISOString().split('T')[0]
          };
        }
        return trap;
      })
    );

    // Update Zone cumulative catch
    const targetTrap = traps.find((t) => t.id === trapId);
    if (targetTrap) {
      setZones((prev) =>
        prev.map((zone) => {
          if (zone.id === targetTrap.zoneId) {
            return {
              ...zone,
              beetleCatch24h: Math.max(zone.beetleCatch24h, newCount)
            };
          }
          return zone;
        })
      );
    }
  };

  // Live Microclimate Temperature & Humidity Control Handlers
  const handleUpdateZoneClimate = (zoneId: string, newTemp: number, newHumidity: number) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const risk = calculateMicroclimateRisk(newTemp, newHumidity);
          return {
            ...zone,
            temp: newTemp,
            humidity: newHumidity,
            riskScore: risk.score,
            riskLevel: risk.level
          };
        }
        return zone;
      })
    );
  };

  const handleApplyGlobalClimate = (newTemp: number, newHumidity: number) => {
    const risk = calculateMicroclimateRisk(newTemp, newHumidity);
    setZones((prev) =>
      prev.map((zone) => ({
        ...zone,
        temp: newTemp,
        humidity: newHumidity,
        riskScore: risk.score,
        riskLevel: risk.level
      }))
    );
  };

  // Handle saving physical inspection
  const handleSaveInspection = (record: Omit<InspectionRecord, 'id' | 'timestamp'>) => {
    setTraps((prevTraps) =>
      prevTraps.map((trap) => {
        if (trap.code === record.trapCode) {
          const newAge = record.lureReplaced ? 0 : trap.serricorninAgeDays;
          const newStatus =
            newAge >= 55 ? 'critical' : newAge >= 45 ? 'warning' : 'nominal';

          return {
            ...trap,
            serricorninAgeDays: newAge,
            catchCount24h: record.beetleCount,
            totalCatch: trap.totalCatch + Math.max(0, record.beetleCount - trap.catchCount24h),
            status: newStatus,
            lastInspection: new Date().toISOString().split('T')[0]
          };
        }
        return trap;
      })
    );
  };

  const t = translations[lang];

  // If no user is logged in, show dedicated Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          lang={lang}
          onToggleLang={toggleLanguage}
          onLogin={handleLogin}
          onOpenMobileQr={() => setIsMobileDownloadQrOpen(true)}
        />
        {isMobileDownloadQrOpen && (
          <MobileDownloadQrModal
            lang={lang}
            isOpen={isMobileDownloadQrOpen}
            onClose={() => setIsMobileDownloadQrOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation with Current Operator Badge, Permissions, & Logout Trigger */}
      <Navbar
        lang={lang}
        currentUser={currentUser}
        onToggleLang={toggleLanguage}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        onOpenQrModal={() => setIsMobileDownloadQrOpen(true)}
        onScrollToSection={scrollToSection}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Executive Real-Time Microclimate Telemetry KPIs */}
        <ExecutiveSummary zones={zones} traps={traps} lang={lang} />

        {/* Dedicated Temperature & Humidity (الحرارة والرطوبة) Environmental Control Center */}
        <TemperatureHumidityCenter
          zones={zones}
          lang={lang}
          currentUser={currentUser}
          onUpdateZoneClimate={handleUpdateZoneClimate}
          onApplyGlobalClimate={handleApplyGlobalClimate}
        />

        {/* AI Camera Vision & Weevil Counter (عد السوس بالذكاء الاصطناعي عبر الكاميرات) */}
        <AiCameraTrapCounter
          traps={traps}
          zones={zones}
          lang={lang}
          currentUser={currentUser}
          onSyncTrapCount={handleSyncTrapCount}
          onHaltLine={handleHaltCigaretteLine}
        />

        {/* Android & iPhone Mobile Applications Interactive Simulator (تطبيقات الهواتف الاندرويد والايفون) */}
        <MobileAppSimulator
          zones={zones}
          traps={traps}
          lang={lang}
          currentUser={currentUser}
          onUpdateZoneClimate={handleUpdateZoneClimate}
          onHaltLine={handleHaltCigaretteLine}
          onSyncTrapCount={handleSyncTrapCount}
          onOpenQrModal={() => setIsMobileDownloadQrOpen(true)}
        />

        {/* Flagship 15-20 Day Breeding Wave & Emergence Forecaster */}
        <BreedingWaveForecaster
          initialTemp={zones[0]?.temp || 31.4}
          initialHumidity={zones[0]?.humidity || 71.8}
          lang={lang}
        />

        {/* Warehouse Floorplan Microclimate Zone Map */}
        <MicroclimateZoneMap
          zones={zones}
          traps={traps}
          lang={lang}
          currentUser={currentUser}
          onSelectTrap={(trap) => setSelectedTrapForInspection(trap)}
          onOpenQr={(trap) => setSelectedTrapForQr(trap)}
          onHaltLine={handleHaltCigaretteLine}
        />

        {/* Serricornin Smart Traps Grid & Lure Lifespan Monitor */}
        <SerricorninTrapManager
          traps={traps}
          lang={lang}
          onOpenQr={(trap) => setSelectedTrapForQr(trap)}
          onOpenInspection={(trap) => setSelectedTrapForInspection(trap)}
        />

        {/* Gemini AI Agronomic & IPM Specialist Module */}
        <AiAgronomicAdvisor zones={zones} lang={lang} />
      </main>

      {/* Application Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-amber-500" />
            <span className="font-semibold text-slate-400">
              {lang === 'ar'
                ? 'منصة M-PAS للأمن الحيوي ومراقبة مصانع السجائر والتبغ'
                : 'M-PAS Tobacco & Cigarette Biosecurity Platform'}
            </span>
            <span>•</span>
            <span>Lasioderma serricorne 4K AI Vision & IoT Telemetry</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
              CORESTA Guide No. 2 Compliant
            </span>
            <span>Serricornin Pheromone Mesh v3.2</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MobileDownloadQrModal
        isOpen={isMobileDownloadQrOpen}
        onClose={() => setIsMobileDownloadQrOpen(false)}
        lang={lang}
      />

      <QrCodeModal
        trap={selectedTrapForQr}
        isOpen={!!selectedTrapForQr}
        onClose={() => setSelectedTrapForQr(null)}
        lang={lang}
      />

      <InspectionModal
        trap={selectedTrapForInspection}
        isOpen={!!selectedTrapForInspection}
        onClose={() => setSelectedTrapForInspection(null)}
        onSaveInspection={handleSaveInspection}
        lang={lang}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        zones={zones}
        traps={traps}
        lang={lang}
      />

      {/* User Permissions & Role Management (RBAC) Modal */}
      <UserPermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        lang={lang}
        onSelectUser={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('mpas_user_session', JSON.stringify(user));
          } catch {
            // ignore
          }
        }}
        onUpdatePermissions={handleUpdateUserPermissions}
      />

      {/* Direct PWA Install Notification for Mobile / Android */}
      <PwaInstallBanner lang={lang} />
    </div>
  );
}

