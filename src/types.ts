export type Language = 'en' | 'ar';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type DeviceMode = 'desktop' | 'android' | 'iphone';

export interface UserPermissionSet {
  canOverrideHvac: boolean;
  canCalibrateCameraAi: boolean;
  canTriggerFumigation: boolean;
  canSignPhytosanitaryCert: boolean;
  canHaltCigaretteLines: boolean;
  canManageUsers: boolean;
  canEditTraps: boolean;
  canExportAuditLogs: boolean;
}

export interface UserProfile {
  id: string;
  nameEn: string;
  nameAr: string;
  email: string;
  roleEn: string;
  roleAr: string;
  clearanceLevel: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'CHIEF_ENTOMOLOGIST' | 'PLANT_DIRECTOR';
  avatarInitials: string;
  departmentEn: string;
  departmentAr: string;
  assignedFacilityLine?: string;
  permissions: UserPermissionSet;
}

export interface BeetleDetectionBox {
  id: string;
  label: 'adult_weevil' | 'larva' | 'tobacco_moth' | 'debris';
  labelEn: string;
  labelAr: string;
  confidence: number; // e.g. 0.985
  x: number; // %
  y: number; // %
  width: number; // %
  height: number; // %
  isVerified?: boolean;
  technicalStatus?: 'ai_detected' | 'technician_confirmed' | 'technician_rejected';
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface AiCameraScanResult {
  trapId: string;
  trapCode: string;
  timestamp: string;
  imageSnapshot: string;
  adultWeevilCount: number;
  larvaCount: number;
  tobaccoMothCount: number;
  debrisFilteredCount: number;
  averageConfidence: number;
  detections: BeetleDetectionBox[];
  corestaThresholdExceeded: boolean;
  recommendedActionEn: string;
  recommendedActionAr: string;
}

export interface DewPointAnalysis {
  dewPointC: number;
  condensationRisk: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL';
  equilibriumMoistureContent: number; // EMC %
  vpdKpa: number; // Vapor Pressure Deficit
  hazardSummaryEn: string;
  hazardSummaryAr: string;
}

export interface StorageZone {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  leafTypeEn: string;
  leafTypeAr: string;
  temp: number; // in Celsius
  humidity: number; // in %
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  beetleCatch24h: number;
  totalBeetleCatch: number;
  trapsCount: number;
  activeLures: number;
  degreeDaysAccumulated: number;
  volumeM3: number;
  isCigaretteLineHalted?: boolean;
}

export interface SmartTrap {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  zoneId: string;
  locationDetailsEn: string;
  locationDetailsAr: string;
  catchCount24h: number;
  totalCatch: number;
  batteryPct: number;
  serricorninAgeDays: number; // days since lure inserted
  serricorninMaxDays: number; // typically 60 days
  status: 'nominal' | 'warning' | 'critical' | 'maintenance';
  lastInspection: string;
  coordinates: { x: number; y: number }; // percentage on zone map
  firmwareVersion: string;
  signalRssi: number; // -dBm
  hasAiCamera?: boolean;
  cameraStreamStatus?: 'streaming' | 'standby' | 'offline';
  cameraResolution?: string;
  lastAiConfidence?: number;
  lastAiCount?: number;
  cameraSnapshotUrl?: string;
  detectedBoxes?: BeetleDetectionBox[];
  lastTechnicalSignOff?: {
    technicianName: string;
    technicianRole: string;
    timestamp: string;
    verifiedCount: number;
    notes: string;
    status: 'verified' | 'flagged';
  };
}

export interface WaveForecastDay {
  dayNumber: number;
  date: string;
  dateAr: string;
  accumulatedDegreeDays: number;
  emergenceRiskIndex: number; // 0 - 100
  predictedCatchRate: number; // predicted beetles/trap/day
  riskLevel: RiskLevel;
  isPeakEmergenceWave: boolean;
  actionWindow: 'MONITORING_WINDOW' | 'INTERVENTION_WINDOW';
}

export interface InspectionRecord {
  id: string;
  trapCode: string;
  zoneId: string;
  timestamp: string;
  inspectorName: string;
  beetleCount: number;
  lureReplaced: boolean;
  lureCondition: 'fresh' | 'optimal' | 'declining' | 'depleted';
  stickyLinerReplaced: boolean;
  notes: string;
}

export interface MicroclimateTelemetry {
  timestamp: string;
  temp: number;
  humidity: number;
  degreeDays: number;
  riskScore: number;
}

export interface AiDiagnosisResult {
  source: string;
  advice: string;
  treatmentPlan: string[];
  urgencyLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  biologicalRationale: string;
  phytosanitaryNotice: string;
}
