import { WaveForecastDay, RiskLevel, DewPointAnalysis } from '../types';

export const BASE_PHYSIOLOGICAL_TEMP = 17.0; // Base threshold below which development ceases (°C)
export const OPTIMAL_TEMP_MIN = 30.0;
export const OPTIMAL_TEMP_MAX = 34.0;
export const OPTIMAL_RH_MIN = 65.0;
export const OPTIMAL_RH_MAX = 75.0;
export const SERRICORNIN_MAX_LIFESPAN_DAYS = 60;

/**
 * Calculates Dew Point using Magnus-Tetens formula (°C)
 */
export function calculateDewPoint(temp: number, humidity: number): number {
  const b = 17.67;
  const c = 243.5;
  const clampedRh = Math.max(1, Math.min(100, humidity));
  const gamma = (b * temp) / (c + temp) + Math.log(clampedRh / 100);
  const dp = (c * gamma) / (b - gamma);
  return Math.round(dp * 10) / 10;
}

/**
 * Calculates Equilibrium Moisture Content (EMC %) for cured tobacco leaf
 * Under typical warehouse conditions: EMC ~ 5.5 + 0.13 * RH - 0.05 * Temp
 */
export function calculateEquilibriumMoistureContent(temp: number, humidity: number): number {
  const emc = 5.5 + 0.135 * humidity - 0.045 * temp;
  return Math.round(Math.max(6, Math.min(24, emc)) * 10) / 10;
}

/**
 * Calculates Vapor Pressure Deficit (VPD in kPa)
 */
export function calculateVpd(temp: number, humidity: number): number {
  // Saturated vapor pressure (kPa)
  const es = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  // Actual vapor pressure
  const ea = es * (humidity / 100);
  const vpd = Math.max(0, es - ea);
  return Math.round(vpd * 100) / 100;
}

/**
 * Comprehensive Dew Point and Microclimate Moisture Risk Analysis
 */
export function calculateDewPointAnalysis(temp: number, humidity: number): DewPointAnalysis {
  const dewPointC = calculateDewPoint(temp, humidity);
  const emc = calculateEquilibriumMoistureContent(temp, humidity);
  const vpd = calculateVpd(temp, humidity);

  const delta = temp - dewPointC;
  let condensationRisk: 'NONE' | 'LOW' | 'HIGH' | 'CRITICAL' = 'NONE';
  let hazardSummaryEn = 'Safe microclimate balance. No condensation hazard.';
  let hazardSummaryAr = 'توازن بيئي آمن للمناخ الدقيق. لا يوجد خطر تكثف رطوبة.';

  if (delta <= 1.5) {
    condensationRisk = 'CRITICAL';
    hazardSummaryEn = 'Immediate condensation hazard on leaf stacks. Severe risk of mold proliferation & fungal symbiote explosion.';
    hazardSummaryAr = 'خطر تكثف رطوبة فوري على بالات التبغ. احتمال مرتفع جداً لنمو الفطريات وانفجار أعداد الخنافس.';
  } else if (delta <= 3.5) {
    condensationRisk = 'HIGH';
    hazardSummaryEn = 'High condensation vulnerability during diurnal warehouse cool-down cycles.';
    hazardSummaryAr = 'حساسية مرتفعة لتشكل قطرات الندى أثناء فترات التبريد الليلي للمستودع.';
  } else if (delta <= 6.0) {
    condensationRisk = 'LOW';
    hazardSummaryEn = 'Moderate margin above dew point. Standard air circulation recommended.';
    hazardSummaryAr = 'هامش معتدل فوق نقطة الندى. يوصى بالحفاظ على التهوية الميكانيكية المعتادة.';
  }

  return {
    dewPointC,
    condensationRisk,
    equilibriumMoistureContent: emc,
    vpdKpa: vpd,
    hazardSummaryEn,
    hazardSummaryAr
  };
}

/**
 * Returns biological zone category for given Temp & RH
 */
export function getMicroclimateCategory(temp: number, humidity: number) {
  if (temp <= 17.0) {
    return {
      labelEn: 'Thermal Quiescence / Dormancy',
      labelAr: 'سكون فسيولوجي كامل (توقف النمو)',
      color: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
      badge: 'SAFE',
      descriptionEn: 'Larval feeding completely arrested below 17°C base threshold.',
      descriptionAr: 'توقف تام عن التغذية والحركة ليرقات خنفساء التبغ دون 17.0°م.'
    };
  }
  if (humidity < 50.0) {
    return {
      labelEn: 'Lethal Egg Desiccation Zone',
      labelAr: 'منطقة جفاف قاتلة للبيض واليرقات',
      color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
      badge: 'SUPPRESSED',
      descriptionEn: 'Low relative humidity (<50%) desiccates eggs and starves symbiotic yeast.',
      descriptionAr: 'انخفاض الرطوبة النسبية لأقل من 50% يسبب جفاف البيض وموت فطر الخميرة التعايشي.'
    };
  }
  if (temp >= 30.0 && temp <= 34.0 && humidity >= 65.0 && humidity <= 75.0) {
    return {
      labelEn: 'Critical Optimum Breeding Zone',
      labelAr: 'المنطقة المثالية الحرجة للتكاثر السريع',
      color: 'text-red-400 border-red-500/50 bg-red-500/20',
      badge: 'CRITICAL HAZARD',
      descriptionEn: 'Maximum reproductive rate, fastest life cycle (26-30 days), peak flight activity.',
      descriptionAr: 'أقصى سرعة تكاثر، أقصر دورة حياة (26-30 يوم)، ونشاط طيران مكثف جداً.'
    };
  }
  if (temp >= 26.0 && humidity >= 60.0) {
    return {
      labelEn: 'Active Generation Window',
      labelAr: 'نافذة نمو وتغذية نشطة',
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      badge: 'ELEVATED RISK',
      descriptionEn: 'Active larval growth and moderate flight waves observed.',
      descriptionAr: 'نمو يرقات نشط وموجات خروج متوسطة للخنافس البالغة.'
    };
  }
  return {
    labelEn: 'Controlled Storage Environment',
    labelAr: 'بيئة تخزين مضبوطة ومستقرة',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    badge: 'CONTROLLED',
    descriptionEn: 'Acceptable equilibrium storage conditions for cured tobacco leaf.',
    descriptionAr: 'شروط توازن مقبولة ومستقرة لأوراق التبغ المعالجة.'
  };
}

/**
 * Calculates Daily Accumulated Degree-Days above 17°C
 */
export function calculateDegreeDays(temp: number): number {
  return Math.max(0, temp - BASE_PHYSIOLOGICAL_TEMP);
}

/**
 * Calculates Humidity-Weighted Microclimate Risk Score (0 - 100)
 */
export function calculateMicroclimateRisk(temp: number, humidity: number): {
  score: number;
  level: RiskLevel;
  factors: { tempFactor: number; humidityFactor: number; thermalHazard: string };
} {
  // Temperature hazard (0 - 100)
  let tempScore = 0;
  if (temp <= BASE_PHYSIOLOGICAL_TEMP) {
    tempScore = 5; // Dormancy / negligible development
  } else if (temp < 25) {
    tempScore = 25 + ((temp - BASE_PHYSIOLOGICAL_TEMP) / (25 - BASE_PHYSIOLOGICAL_TEMP)) * 25; // 25-50
  } else if (temp >= 25 && temp < OPTIMAL_TEMP_MIN) {
    tempScore = 50 + ((temp - 25) / (OPTIMAL_TEMP_MIN - 25)) * 35; // 50-85
  } else if (temp >= OPTIMAL_TEMP_MIN && temp <= OPTIMAL_TEMP_MAX) {
    tempScore = 95 + ((temp - OPTIMAL_TEMP_MIN) / (OPTIMAL_TEMP_MAX - OPTIMAL_TEMP_MIN)) * 5; // 95-100 peak
  } else if (temp > OPTIMAL_TEMP_MAX && temp <= 40) {
    tempScore = 80 - ((temp - OPTIMAL_TEMP_MAX) / (40 - OPTIMAL_TEMP_MAX)) * 40; // High heat stress
  } else {
    tempScore = 15; // Above 40°C lethal thermal stress
  }

  // Relative Humidity hazard (0 - 100)
  let rhScore = 0;
  if (humidity < 50) {
    rhScore = 10; // Extreme egg & larval desiccation
  } else if (humidity < 60) {
    rhScore = 35;
  } else if (humidity >= 60 && humidity < OPTIMAL_RH_MIN) {
    rhScore = 65;
  } else if (humidity >= OPTIMAL_RH_MIN && humidity <= OPTIMAL_RH_MAX) {
    rhScore = 98; // Ideal fungal symbiote & beetle growth
  } else {
    rhScore = 75; // Mold hazard / high humidity
  }

  // Weighted formula: Temp 55%, Humidity 45%
  const composite = Math.round((tempScore * 0.55) + (rhScore * 0.45));
  const score = Math.max(0, Math.min(100, composite));

  let level: RiskLevel = 'low';
  if (score >= 75) level = 'critical';
  else if (score >= 55) level = 'high';
  else if (score >= 35) level = 'moderate';

  let thermalHazard = 'Safe / Stagnant Development';
  if (level === 'critical') thermalHazard = 'Rapid Generational Acceleration (Optimum Breeding)';
  else if (level === 'high') thermalHazard = 'Active Larval Feeding & Flight Triggered';
  else if (level === 'moderate') thermalHazard = 'Sub-optimal Growth Window';

  return {
    score,
    level,
    factors: {
      tempFactor: Math.round(tempScore),
      humidityFactor: Math.round(rhScore),
      thermalHazard
    }
  };
}

/**
 * Generates 15-20 Day Breeding Wave & Emergence Forecaster Model
 */
export function generateBreedingWaveForecast(
  temp: number,
  humidity: number,
  baseCatchRate = 12
): WaveForecastDay[] {
  const dailyDD = calculateDegreeDays(temp);
  const microclimate = calculateMicroclimateRisk(temp, humidity);
  const riskCoeff = microclimate.score / 100;

  const results: WaveForecastDay[] = [];
  const today = new Date();
  let accumulatedDD = 0;

  for (let i = 1; i <= 20; i++) {
    accumulatedDD += dailyDD;
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Bimodal distribution: Primary pupal emergence wave at days 4-6; secondary generation emergence at days 17-19
    const wave1 = Math.exp(-Math.pow(i - 5, 2) / 3.2) * 88;
    const wave2 = Math.exp(-Math.pow(i - 18, 2) / 3.8) * 94;
    const baseline = 12 + (dailyDD * 1.6);

    const rawEmergence = (wave1 + wave2 + baseline) * riskCoeff;
    const emergenceRiskIndex = Math.min(100, Math.max(8, Math.round(rawEmergence)));

    const isPeak = (i >= 4 && i <= 6) || (i >= 17 && i <= 19);

    let riskLevel: RiskLevel = 'low';
    if (emergenceRiskIndex >= 75) riskLevel = 'critical';
    else if (emergenceRiskIndex >= 50) riskLevel = 'high';
    else if (emergenceRiskIndex >= 25) riskLevel = 'moderate';

    // Catch rate projection based on emergence index and baseline trap sensitivity
    const predictedCatchRate = Math.max(1, Math.round((emergenceRiskIndex / 100) * (baseCatchRate * 1.8)));

    results.push({
      dayNumber: i,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateAr: date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
      accumulatedDegreeDays: Math.round(accumulatedDD * 10) / 10,
      emergenceRiskIndex,
      predictedCatchRate,
      riskLevel,
      isPeakEmergenceWave: isPeak,
      actionWindow: isPeak ? 'INTERVENTION_WINDOW' : 'MONITORING_WINDOW'
    });
  }

  return results;
}

/**
 * Serricornin Pheromone Remaining Efficacy Calculator
 */
export function calculateLureEfficacy(ageDays: number, maxDays = SERRICORNIN_MAX_LIFESPAN_DAYS): {
  percentRemaining: number;
  daysRemaining: number;
  condition: 'fresh' | 'optimal' | 'declining' | 'depleted';
  urgencyColor: string;
} {
  const daysRemaining = Math.max(0, maxDays - ageDays);
  const percentRemaining = Math.max(0, Math.min(100, Math.round((daysRemaining / maxDays) * 100)));

  if (percentRemaining >= 70) {
    return { percentRemaining, daysRemaining, condition: 'fresh', urgencyColor: 'text-emerald-400' };
  } else if (percentRemaining >= 40) {
    return { percentRemaining, daysRemaining, condition: 'optimal', urgencyColor: 'text-sky-400' };
  } else if (percentRemaining >= 15) {
    return { percentRemaining, daysRemaining, condition: 'declining', urgencyColor: 'text-amber-400' };
  } else {
    return { percentRemaining, daysRemaining, condition: 'depleted', urgencyColor: 'text-rose-400' };
  }
}
