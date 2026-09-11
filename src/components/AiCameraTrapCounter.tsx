import React, { useState, useEffect, useRef } from 'react';
import { SmartTrap, Language, UserProfile, BeetleDetectionBox, StorageZone } from '../types';
import { translations } from '../utils/translations';
import {
  Camera,
  Eye,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Filter,
  RefreshCw,
  Lock,
  Sparkles,
  Layers,
  Zap,
  Radio,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  UserCheck,
  Plus,
  Trash2,
  ShieldCheck,
  FileCheck2
} from 'lucide-react';

interface Props {
  traps: SmartTrap[];
  zones: StorageZone[];
  lang: Language;
  currentUser: UserProfile;
  onSyncTrapCount: (trapId: string, newCount: number, detectedBoxes: BeetleDetectionBox[]) => void;
  onHaltLine?: (zoneId: string) => void;
}

export const AiCameraTrapCounter: React.FC<Props> = ({
  traps,
  zones,
  lang,
  currentUser,
  onSyncTrapCount,
  onHaltLine
}) => {
  const t = translations[lang];
  const isAr = lang === 'ar';

  // Filter traps that have camera capability (or all optical traps)
  const cameraTraps = traps.filter((trap) => trap.hasAiCamera || trap.code.startsWith('CAM'));
  const [selectedTrapId, setSelectedTrapId] = useState<string>(cameraTraps[0]?.id || traps[0]?.id || '');
  const activeTrap = traps.find((t) => t.id === selectedTrapId) || traps[0];
  const activeZone = zones.find((z) => z.id === activeTrap?.zoneId);

  // Optical Inspection Controls
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(85); // 85%
  const [filterDebris, setFilterDebris] = useState<boolean>(true);
  const [isNightVision, setIsNightVision] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [syncedSuccess, setSyncedSuccess] = useState<boolean>(false);

  // Zoom & Pan State (Zoom In / Zoom Out)
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1x to 4x
  const [panOrigin, setPanOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Technical Review State (Confirm AI Count by Technician)
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [isAddingManualPin, setIsAddingManualPin] = useState<boolean>(false);
  const [technicianNotes, setTechnicianNotes] = useState<string>(
    isAr
      ? 'تم الفحص الماكروسكوبي بدقة 4K واعتماد عدد خنافس السيريكورني واستبعاد الشوائب'
      : 'Verified under 4K optical macro zoom - validated Lasioderma serricorne count and filtered leaf chaff.'
  );
  const [isTechnicallyCertified, setIsTechnicallyCertified] = useState<boolean>(false);
  const [certifiedTimestamp, setCertifiedTimestamp] = useState<string>('');

  // Local detection boxes for the selected trap
  const [boxes, setBoxes] = useState<BeetleDetectionBox[]>(() => {
    return (
      activeTrap?.detectedBoxes || [
        { id: 'b1', label: 'adult_weevil', labelEn: 'Adult Cigarette Weevil', labelAr: 'سوسة سجائر بالغة (سيريكورني)', confidence: 0.985, x: 25, y: 30, width: 9, height: 12, isVerified: true, technicalStatus: 'technician_confirmed' },
        { id: 'b2', label: 'adult_weevil', labelEn: 'Adult Cigarette Weevil', labelAr: 'سوسة سجائر بالغة (سيريكورني)', confidence: 0.972, x: 48, y: 40, width: 8, height: 11, isVerified: true, technicalStatus: 'technician_confirmed' },
        { id: 'b3', label: 'adult_weevil', labelEn: 'Adult Cigarette Weevil', labelAr: 'سوسة سجائر بالغة (سيريكورني)', confidence: 0.991, x: 62, y: 22, width: 9, height: 13, isVerified: true, technicalStatus: 'technician_confirmed' },
        { id: 'b4', label: 'larva', labelEn: 'Lasioderma Larva', labelAr: 'يرقة خنفساء التبغ', confidence: 0.941, x: 75, y: 55, width: 11, height: 9, isVerified: true, technicalStatus: 'technician_confirmed' },
        { id: 'b5', label: 'debris', labelEn: 'Tobacco Dust / Leaf Flake', labelAr: 'غبار تبغ / شوائب ورقية', confidence: 0.892, x: 15, y: 72, width: 12, height: 14, isVerified: false, technicalStatus: 'technician_rejected' }
      ]
    );
  });

  // When selected trap changes, update default boxes
  useEffect(() => {
    if (activeTrap?.detectedBoxes && activeTrap.detectedBoxes.length > 0) {
      setBoxes(activeTrap.detectedBoxes);
    } else {
      // Generate default realistic boxes based on trap's 24h count
      const count = activeTrap?.catchCount24h || 3;
      const newBoxes: BeetleDetectionBox[] = [];
      for (let i = 0; i < count; i++) {
        newBoxes.push({
          id: `box-${i}`,
          label: i === 0 && count > 4 ? 'larva' : 'adult_weevil',
          labelEn: i === 0 && count > 4 ? 'Lasioderma Larva' : 'Adult Cigarette Weevil',
          labelAr: i === 0 && count > 4 ? 'يرقة خنفساء التبغ' : 'سوسة سجائر بالغة',
          confidence: 0.92 + (i % 7) * 0.01,
          x: 18 + (i * 19) % 68,
          y: 20 + (i * 27) % 62,
          width: 8 + (i % 3),
          height: 10 + (i % 4),
          isVerified: true,
          technicalStatus: 'ai_detected'
        });
      }
      // Add a dust particle
      newBoxes.push({
        id: 'debris-1',
        label: 'debris',
        labelEn: 'Tobacco Dust (Filtered)',
        labelAr: 'غبار تبغ (مستبعد)',
        confidence: 0.86,
        x: 82,
        y: 80,
        width: 10,
        height: 10,
        isVerified: false,
        technicalStatus: 'technician_rejected'
      });
      setBoxes(newBoxes);
    }
    setSyncedSuccess(false);
    setIsTechnicallyCertified(!!activeTrap?.lastTechnicalSignOff);
    setCertifiedTimestamp(activeTrap?.lastTechnicalSignOff?.timestamp || '');
    setZoomLevel(1);
    setSelectedBoxId(null);
  }, [selectedTrapId, activeTrap]);

  // Zoom Controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(4, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) {
        setPanOrigin({ x: 50, y: 50 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOrigin({ x: 50, y: 50 });
  };

  // Focal click to zoom / pan
  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    if (isAddingManualPin) {
      // Add a manual beetle box at the click location
      const newBox: BeetleDetectionBox = {
        id: `manual-${Date.now()}`,
        label: 'adult_weevil',
        labelEn: 'Adult Cigarette Weevil (Manual Pin)',
        labelAr: 'سوسة سجائر بالغة (تحديد يدوي)',
        confidence: 1.0,
        x: Math.max(2, Math.min(88, clickX - 4)),
        y: Math.max(2, Math.min(88, clickY - 5)),
        width: 8,
        height: 11,
        isVerified: true,
        technicalStatus: 'technician_confirmed',
        verifiedBy: currentUser.nameEn || currentUser.nameAr,
        verifiedAt: new Date().toLocaleTimeString()
      };
      setBoxes((prev) => [...prev, newBox]);
      setIsAddingManualPin(false);
      setSelectedBoxId(newBox.id);
      return;
    }

    if (zoomLevel > 1) {
      setPanOrigin({ x: Math.round(clickX), y: Math.round(clickY) });
    }
  };

  // Technical Review Box Actions
  const handleConfirmBoxAsBeetle = (boxId: string) => {
    setBoxes((prev) =>
      prev.map((b) => {
        if (b.id === boxId) {
          return {
            ...b,
            label: b.label === 'debris' ? 'adult_weevil' : b.label,
            labelEn: b.label === 'debris' ? 'Adult Cigarette Weevil' : b.labelEn,
            labelAr: b.label === 'debris' ? 'سوسة سجائر بالغة' : b.labelAr,
            technicalStatus: 'technician_confirmed',
            isVerified: true,
            verifiedBy: currentUser.nameEn || currentUser.nameAr,
            verifiedAt: new Date().toLocaleTimeString()
          };
        }
        return b;
      })
    );
  };

  const handleRejectBoxAsDebris = (boxId: string) => {
    setBoxes((prev) =>
      prev.map((b) => {
        if (b.id === boxId) {
          return {
            ...b,
            label: 'debris',
            labelEn: 'Tobacco Dust / Leaf Flake (Rejected)',
            labelAr: 'غبار تبغ / شوائب ورقية (مستبعد)',
            technicalStatus: 'technician_rejected',
            isVerified: false,
            verifiedBy: currentUser.nameEn || currentUser.nameAr,
            verifiedAt: new Date().toLocaleTimeString()
          };
        }
        return b;
      })
    );
  };

  const handleDeleteBox = (boxId: string) => {
    setBoxes((prev) => prev.filter((b) => b.id !== boxId));
    if (selectedBoxId === boxId) {
      setSelectedBoxId(null);
    }
  };

  // Compute filtered counts based on current threshold & technical status
  const activeThresholdRatio = confidenceThreshold / 100;
  const filteredBoxes = boxes.filter((b) => {
    // If technician confirmed, always include regardless of raw AI threshold
    if (b.technicalStatus === 'technician_confirmed') return true;
    // If technician rejected, hide if filterDebris is active
    if (b.technicalStatus === 'technician_rejected' && filterDebris) return false;
    if (b.confidence < activeThresholdRatio) return false;
    if (filterDebris && b.label === 'debris') return false;
    return true;
  });

  const adultWeevilCount = filteredBoxes.filter(
    (b) => b.label === 'adult_weevil' && b.technicalStatus !== 'technician_rejected'
  ).length;
  const larvaeCount = filteredBoxes.filter(
    (b) => b.label === 'larva' && b.technicalStatus !== 'technician_rejected'
  ).length;
  const mothCount = filteredBoxes.filter(
    (b) => b.label === 'tobacco_moth' && b.technicalStatus !== 'technician_rejected'
  ).length;
  const totalInsectCount = adultWeevilCount + larvaeCount + mothCount;
  const debrisCount = boxes.filter((b) => b.label === 'debris' || b.technicalStatus === 'technician_rejected').length;
  const confirmedByTechCount = boxes.filter((b) => b.technicalStatus === 'technician_confirmed').length;

  const averageConfidence =
    filteredBoxes.length > 0
      ? (filteredBoxes.reduce((acc, curr) => acc + curr.confidence, 0) / filteredBoxes.length) * 100
      : 98.2;

  // Run AI Scan simulation
  const handleTriggerAiScan = () => {
    setIsScanning(true);
    setSyncedSuccess(false);
    setIsTechnicallyCertified(false);
    setTimeout(() => {
      setIsScanning(false);
      setBoxes((prev) =>
        prev.map((box) => ({
          ...box,
          confidence: Math.min(0.998, Math.max(0.88, box.confidence + (Math.random() * 0.02 - 0.01)))
        }))
      );
    }, 1200);
  };

  // Master Technical Confirmation & Digital Sign-off
  const handleConfirmAiCountTechnical = () => {
    const timestamp = new Date().toLocaleString(isAr ? 'ar-EG' : 'en-US');
    setIsTechnicallyCertified(true);
    setCertifiedTimestamp(timestamp);

    // Update trap with technical sign-off
    const updatedTrap = {
      ...activeTrap,
      catchCount24h: totalInsectCount,
      lastAiCount: totalInsectCount,
      lastTechnicalSignOff: {
        technicianName: currentUser.nameEn || currentUser.nameAr,
        technicianRole: isAr ? currentUser.roleAr : currentUser.roleEn,
        timestamp: timestamp,
        verifiedCount: totalInsectCount,
        notes: technicianNotes,
        status: 'verified' as const
      }
    };

    onSyncTrapCount(activeTrap.id, totalInsectCount, boxes);
    setSyncedSuccess(true);
    setTimeout(() => setSyncedSuccess(false), 3500);
  };

  const isMakerHall = activeZone?.nameEn.includes('Making') || activeTrap.code.includes('C01');
  const isThresholdBreached = totalInsectCount >= 4;

  return (
    <section id="ai-camera-center" className="w-full bg-slate-900 border-y border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Camera className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  {t.aiCameraTitle}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    YOLOv8-Serricorne 4K Macro
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">{t.aiCameraSubtitle}</p>
              </div>
            </div>
          </div>

          {/* Quick Camera Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="camera-trap-select" className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              {t.selectCameraTrap}:
            </label>
            <select
              id="camera-trap-select"
              value={selectedTrapId}
              onChange={(e) => setSelectedTrapId(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs sm:text-sm text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono cursor-pointer"
            >
              {cameraTraps.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {ct.code} - {isAr ? ct.nameAr : ct.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Warning Banner if Maker Hall has high count */}
        {isThresholdBreached && isMakerHall && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3 text-red-300">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-400" />
              <div className="text-sm">
                <p className="font-bold text-white">
                  {isAr
                    ? 'تحذير عاجل: تجاوز عتبة منظمة كورستا (CORESTA) في صالة تصنيع وتعبئة السجائر!'
                    : 'CRITICAL ALERT: CORESTA Zero-Tolerance Threshold Exceeded in Cigarette Making Hall!'}
                </p>
                <p className="text-xs text-red-300/90 mt-0.5">
                  {isAr
                    ? `تم رصد ${totalInsectCount} حشرات في محطة تغذية ماكينة السجائر. يلزم إيقاف الخط وتنفيذ تطهير بالشفط فوراً.`
                    : `Detected ${totalInsectCount} beetles at Maker Hopper. Immediate line halt and vacuum decontamination recommended.`}
                </p>
              </div>
            </div>
            {onHaltLine && activeZone && (
              <button
                type="button"
                id="emergency-halt-line-btn"
                onClick={() => onHaltLine(activeZone.id)}
                disabled={!currentUser.permissions.canHaltCigaretteLines}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all shadow-lg ${
                  currentUser.permissions.canHaltCigaretteLines
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
                title={!currentUser.permissions.canHaltCigaretteLines ? (isAr ? 'يتطلب صلاحية إيقاف الخطوط' : 'Requires line halt permission') : ''}
              >
                {!currentUser.permissions.canHaltCigaretteLines && <Lock className="w-3.5 h-3.5 inline mr-1" />}
                {activeZone.isCigaretteLineHalted ? t.resumeCigaretteLine : t.haltCigaretteLine}
              </button>
            )}
          </div>
        )}

        {/* Technical Confirmation Status Banner */}
        <div className={`rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
          isTechnicallyCertified
            ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
            : 'border-amber-500/30 bg-amber-950/20 text-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isTechnicallyCertified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {isTechnicallyCertified ? <FileCheck2 className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isTechnicallyCertified ? t.technicianVerified : t.pendingVerification}</span>
                {isTechnicallyCertified && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                    {t.certifiedByTech}
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTechnicallyCertified
                  ? `${isAr ? 'تم الاعتماد والمصادقة بواسطة:' : 'Certified by:'} ${currentUser.nameEn || currentUser.nameAr} (${isAr ? currentUser.roleAr : currentUser.roleEn}) • ${certifiedTimestamp}`
                  : isAr
                  ? 'يمكن للفني أو خبير الحشرات فحص الصناديق بالتكبير (Zoom) ثم الضغط على "المصادقة والاعتماد الفني للعد"'
                  : 'Technician can inspect detection boxes under Zoom and click "Confirm AI Count by Technician" to sign off.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmAiCountTechnical}
              disabled={!currentUser.permissions.canCalibrateCameraAi && !currentUser.permissions.canEditTraps}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                isTechnicallyCertified
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t.confirmAiCountTechnical}</span>
            </button>
          </div>
        </div>

        {/* Core Vision Studio: Screen & Control Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Optical Camera Canvas with Bounding Boxes & Zoom Controls (8 cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
              {/* Camera Header Bar */}
              <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    {t.cameraLiveFeed} • {activeTrap.code}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>{activeTrap.cameraResolution || '4K Ultra-Macro'}</span>
                  <span>|</span>
                  <span className="text-amber-400">{isAr ? activeZone?.nameAr : activeZone?.nameEn}</span>
                </div>
              </div>

              {/* FLOATING ZOOM CONTROLS OVERLAY (Zoom In / Zoom Out / Reset) */}
              <div className="absolute top-12 left-4 z-30 flex flex-col gap-1.5 p-1.5 rounded-xl bg-slate-950/90 border border-slate-700/90 shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title={t.zoomIn}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="text-center font-mono text-[10px] font-bold text-amber-400 py-0.5">
                  {zoomLevel}x
                </div>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title={t.zoomOut}
                  disabled={zoomLevel <= 1}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-slate-800 disabled:hover:text-slate-200"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title={t.resetZoom}
                  className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer border-t border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* QUICK ZOOM PRESETS OVERLAY */}
              <div className="absolute top-12 right-4 z-30 flex items-center gap-1 p-1 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-xl backdrop-blur-md text-[11px] font-mono">
                {[1, 1.5, 2.5, 4].map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => {
                      setZoomLevel(scale);
                      if (scale === 1) setPanOrigin({ x: 50, y: 50 });
                    }}
                    className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      zoomLevel === scale
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {scale === 4 ? '4x Macro' : `${scale}x`}
                  </button>
                ))}
              </div>

              {/* The Optical Trap Surface Viewport with Zoom & Pan */}
              <div
                ref={viewportRef}
                onClick={handleViewportClick}
                className={`relative w-full aspect-[16/10] select-none overflow-hidden transition-all duration-300 ${
                  isAddingManualPin ? 'cursor-crosshair' : zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
                } ${
                  isNightVision
                    ? 'bg-gradient-to-b from-emerald-950 via-slate-950 to-emerald-950 filter brightness-110 contrast-125'
                    : 'bg-gradient-to-br from-amber-950/40 via-slate-950 to-stone-900/60'
                }`}
              >
                {/* Micro-grid & Reticle Background (Sticky Board Texture) */}
                <div
                  className="absolute inset-0 opacity-20 transition-transform duration-300"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`,
                    backgroundImage: `
                      radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 70%),
                      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '100% 100%, 30px 30px, 30px 30px'
                  }}
                />

                {/* Millimeter Measurement Ruler when Zoomed In */}
                {zoomLevel > 1 && (
                  <div className="absolute bottom-3 right-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-950/90 border border-slate-700 px-3 py-1 rounded-lg text-[10px] font-mono text-amber-300">
                    <span>Macro Scale:</span>
                    <div className="w-16 h-1.5 bg-amber-400 relative">
                      <div className="absolute -top-1 left-0 w-0.5 h-3 bg-amber-400"></div>
                      <div className="absolute -top-1 right-0 w-0.5 h-3 bg-amber-400"></div>
                      <div className="absolute -top-1 left-1/2 w-0.5 h-2 bg-amber-400"></div>
                    </div>
                    <span>2.5mm (Weevil Size)</span>
                  </div>
                )}

                {/* Scanning Laser Animation Line */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] z-20 animate-bounce" />
                )}

                {/* Scalable Container for Bounding Boxes according to Zoom and Pan */}
                <div
                  className="absolute inset-0 transition-transform duration-200 pointer-events-auto"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: `${panOrigin.x}% ${panOrigin.y}%`
                  }}
                >
                  {boxes.map((box) => {
                    const isVisible =
                      box.technicalStatus === 'technician_confirmed' ||
                      (box.confidence >= activeThresholdRatio && (!filterDebris || box.label !== 'debris'));
                    if (!isVisible) return null;

                    const isWeevil = box.label === 'adult_weevil';
                    const isLarva = box.label === 'larva';
                    const isMoth = box.label === 'tobacco_moth';
                    const isDebris = box.label === 'debris';
                    const isConfirmed = box.technicalStatus === 'technician_confirmed';
                    const isRejected = box.technicalStatus === 'technician_rejected';

                    let colorBorder = 'border-amber-400 bg-amber-500/10 text-amber-300';
                    if (isConfirmed) colorBorder = 'border-emerald-400 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400';
                    else if (isRejected) colorBorder = 'border-slate-500/60 border-dashed bg-slate-800/30 text-slate-400 line-through';
                    else if (isLarva) colorBorder = 'border-purple-400 bg-purple-500/10 text-purple-300';
                    else if (isMoth) colorBorder = 'border-sky-400 bg-sky-500/10 text-sky-300';
                    else if (isDebris) colorBorder = 'border-slate-500/60 border-dashed bg-slate-800/20 text-slate-400';

                    return (
                      <div
                        key={box.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBoxId(selectedBoxId === box.id ? null : box.id);
                        }}
                        className={`absolute border-2 transition-all duration-150 group cursor-pointer ${colorBorder} rounded-sm`}
                        style={{
                          left: `${box.x}%`,
                          top: `${box.y}%`,
                          width: `${box.width}%`,
                          height: `${box.height}%`
                        }}
                      >
                        {/* Insect Silhouette */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {isWeevil && (
                            <div className="w-3 h-4 bg-amber-900/90 rounded-full border border-amber-600/80 transform rotate-12 flex items-center justify-center shadow-inner">
                              <div className="w-1.5 h-1.5 bg-amber-500/80 rounded-full"></div>
                            </div>
                          )}
                          {isLarva && (
                            <div className="w-4 h-2 bg-amber-100/80 rounded-full border border-amber-300/80 flex items-center justify-center">
                              <div className="w-1 h-1 bg-amber-800 rounded-full"></div>
                            </div>
                          )}
                          {isMoth && (
                            <div className="w-5 h-3 bg-stone-500/80 rounded-sm border border-stone-300 flex items-center justify-center">
                              <div className="w-2 h-1 bg-stone-300 rounded-full"></div>
                            </div>
                          )}
                          {isDebris && (
                            <div className="w-2.5 h-2.5 bg-yellow-900/60 transform rotate-45 border border-yellow-700/40"></div>
                          )}
                        </div>

                        {/* Tag label */}
                        <div className="absolute -top-5 left-0 whitespace-nowrap px-1.5 py-0.5 rounded bg-slate-950/95 border border-slate-700 text-[9px] font-mono leading-none shadow-md flex items-center gap-1 z-20">
                          {isConfirmed && <Check className="w-2.5 h-2.5 text-emerald-400 inline" />}
                          <span>{isAr ? box.labelAr : box.labelEn}</span>
                          <span className="font-bold text-amber-400">{(box.confidence * 100).toFixed(1)}%</span>
                        </div>

                        {/* Technical Action Popover on Click */}
                        {selectedBoxId === box.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -bottom-14 left-0 z-40 bg-slate-950 border border-slate-700 rounded-lg p-1.5 shadow-2xl flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <button
                              type="button"
                              onClick={() => handleConfirmBoxAsBeetle(box.id)}
                              className="px-2 py-1 rounded bg-emerald-600/90 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>{t.confirmBox}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectBoxAsDebris(box.id)}
                              className="px-2 py-1 rounded bg-amber-600/80 hover:bg-amber-600 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>{t.rejectBox}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBox(box.id)}
                              className="p-1 rounded bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Delete marker"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Night vision watermark */}
                {isNightVision && (
                  <div className="absolute bottom-3 left-4 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    IR NIGHT VISION ACTIVE (850nm)
                  </div>
                )}
              </div>

              {/* Bottom Quick Bar inside Viewport */}
              <div className="px-4 py-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTriggerAiScan}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    <Scan className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? t.aiCounting : t.runAiDetection}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsNightVision(!isNightVision)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      isNightVision
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t.nightVisionIr}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingManualPin(!isAddingManualPin)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      isAddingManualPin
                        ? 'bg-purple-600 text-white border-purple-500'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.addManualBeetle}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
                  <span>
                    {t.averageModelAccuracy}:{' '}
                    <strong className="text-emerald-400">{averageConfidence.toFixed(1)}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analytics, Technical Sign-Off & Database Sync (4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5">
            {/* KPI Cards: Weevils vs Larvae vs Confirmed by Tech */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30">
                <p className="text-xs text-amber-300 font-medium">{t.adultWeevilsDetected}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white font-mono">{adultWeevilCount}</span>
                  <span className="text-xs text-slate-400">{isAr ? 'خنفساء' : 'beetles'}</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  <span>Lasioderma serricorne</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                <p className="text-xs text-emerald-300 font-medium">{isAr ? 'المعتمد فنياً' : 'Verified by Tech'}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-emerald-400 font-mono">{confirmedByTechCount}</span>
                  <span className="text-xs text-slate-400">{isAr ? 'مؤكد' : 'certified'}</span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>{isAr ? 'مصادقة خبير الوقاية' : 'Entomologist validated'}</span>
                </div>
              </div>
            </div>

            {/* TECHNICAL SIGN-OFF & NOTES PANEL */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {t.technicalSignOff}
                </span>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {currentUser.clearanceLevel}
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  {t.technicianNotes}:
                </label>
                <textarea
                  rows={2}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none font-sans"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmAiCountTechnical}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.confirmAiCountTechnical}</span>
              </button>
            </div>

            {/* Filter Controls & Model Threshold Slider */}
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  {t.confidenceThreshold}
                </span>
                <span className="text-sm font-mono font-bold text-amber-400">{confidenceThreshold}%</span>
              </div>

              <div>
                <input
                  type="range"
                  min={60}
                  max={99}
                  step={1}
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                  <span>60% (High Recall)</span>
                  <span>85% (Balanced)</span>
                  <span>99% (High Precision)</span>
                </div>
              </div>

              {/* Debris Filter Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-200">{t.filterDustDebris}</p>
                    <p className="text-[11px] text-slate-500">
                      {isAr
                        ? `تم حجب ${debrisCount} جزيئة غبار تبغ بواسطة الذكاء الاصطناعي`
                        : `${debrisCount} leaf dust artifacts isolated`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterDebris(!filterDebris)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    filterDebris ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      filterDebris ? (isAr ? '-translate-x-5' : 'translate-x-5') : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Sync to Database & Permissions Gate */}
            <div className="space-y-3">
              <button
                type="button"
                id="sync-camera-telemetry-btn"
                onClick={handleConfirmAiCountTechnical}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                {t.syncCountToTrap}
              </button>

              {syncedSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  <span>
                    {isAr
                      ? `تمت المصادقة والاعتماد الفني ومزامنة عدد ${totalInsectCount} حشرة مع سجل المصيدة ${activeTrap.code} بنجاح!`
                      : `Successfully verified and synchronized ${totalInsectCount} beetle count to ${activeTrap.code} telemetry!`}
                  </span>
                </div>
              )}

              {/* Security Authorization Footnote */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" />
                  {t.activeClearance}: <strong className="text-slate-200">{currentUser.clearanceLevel}</strong>
                </span>
                <span className="text-emerald-400 font-medium">CORESTA IPM Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
