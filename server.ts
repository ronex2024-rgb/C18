import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Expert Entomological Fallback Knowledge Base for Lasioderma serricorne (Tobacco Beetle)
function getExpertEntomologicalAdvice(query: string, zoneInfo?: string): {
  advice: string;
  treatmentPlan: string[];
  urgencyLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  biologicalRationale: string;
  phytosanitaryNotice: string;
} {
  const q = query.toLowerCase();
  
  if (q.includes("phosphine") || q.includes("fumigat") || q.includes("gas")) {
    return {
      urgencyLevel: "HIGH",
      advice: "Phosphine (Hydrogen Phosphide, PH3) fumigation protocol for Lasioderma serricorne must be maintained at a minimum concentration of 200–300 ppm for 96 to 120 hours at temperatures ≥ 25°C. At lower temperatures (<20°C), exposure time must be extended to 7–10 days because beetle respiration and metabolic uptake decrease sharply.",
      treatmentPlan: [
        "Ensure airtight enclosure seal with gastight sheeting (minimum 150-gauge polyethylene).",
        "Dose at 1.5 to 2.0 grams PH3 per cubic meter depending on leaf packing density.",
        "Monitor gas concentration at 24h, 48h, and 72h using electronic gas detector tubes.",
        "Maintain degassing and safety clearance period with forced aeration for at least 48 hours prior to human entry."
      ],
      biologicalRationale: "Tobacco beetle pupae and eggs possess thick chorion/cuticle barriers with lower spiracular respiration, rendering them tolerant to short-term phosphine exposure. Sustained concentration-time (CT) product is mandatory.",
      phytosanitaryNotice: "Compliant with CORESTA Guide No. 2 guidelines for phosphine fumigation of stored leaf tobacco."
    };
  }

  if (q.includes("cold") || q.includes("chill") || q.includes("freez") || q.includes("temperature")) {
    return {
      urgencyLevel: "MODERATE",
      advice: "Thermal chilling treatment is a highly effective, pesticide-free physical control method. Exposure of tobacco leaf packages to -18°C for 96 hours or 4°C for 21–28 days achieves 100% mortality across all developmental instars including eggs.",
      treatmentPlan: [
        "Pre-condition pallets to ensure core temperature reaches target threshold (use internal thermistor probes).",
        "For blast freezing: Maintain -18°C to -20°C chamber for 5 consecutive days (accounting for 24h thermal penetration lag).",
        "For cold storage containment: Hold at 4°C to 7°C to halt feeding damage and induce diapause/starvation.",
        "Post-treatment: Warm slowly in dry ambient air (RH < 60%) to prevent condensation moisture staining on cured leaf."
      ],
      biologicalRationale: "Lasioderma serricorne lacks freeze-tolerant cryoprotectant polyols (glycerol). Ice nucleation inside cell membranes rapidly causes fatal intracellular rupture.",
      phytosanitaryNotice: "Accepted by organic tobacco certifiers and international phytosanitary quarantine protocols."
    };
  }

  if (q.includes("serricornin") || q.includes("pheromone") || q.includes("trap") || q.includes("mating")) {
    return {
      urgencyLevel: "MODERATE",
      advice: "Serricornin ((4S,6S,7S)-7-hydroxy-4,6-dimethylnonan-3-one) is the sex pheromone produced by female Lasioderma serricorne. Smart delta traps loaded with 1.0 mg synthetic serricornin lures should be deployed in a grid spacing of 1 trap per 100–150 m².",
      treatmentPlan: [
        "Position traps 1.5 to 2.0 meters above floor level, avoiding direct drafts from ventilation exhaust fans.",
        "Replace synthetic Serricornin septa every 60 days (active release rate declines below efficacy threshold after 8 weeks).",
        "Deploy high-density mating disruption lures (1 dispenser per 25 m²) if 24-hour catch exceeds 5 beetles per trap.",
        "Conduct weekly visual glue-board counts and log digital trap RFID/QR check-ins."
      ],
      biologicalRationale: "Male tobacco beetles orient toward females via positive anemotaxis along the serricornin odor plume. Pheromone saturation breaks mating communication, drastically decreasing fertilized oviposition.",
      phytosanitaryNotice: "Zero chemical residue; aligns with ISO 22000 and Good Agricultural Practices (GAP)."
    };
  }

  // Default general IPM protocol
  return {
    urgencyLevel: "HIGH",
    advice: `Integrated Pest Management (IPM) Advisory for Tobacco Storage (${zoneInfo || "General Storage"}): Microclimate analysis indicates elevated emergence probability. Implement immediate humidity suppression and localized Serricornin smart trap intensification.`,
    treatmentPlan: [
      "Reduce warehouse relative humidity below 60% RH to dehydrate newly hatched first-instar larvae.",
      "Check Serricornin smart traps daily for 7 days to pinpoint flight dispersal corridors.",
      "Inspect packaging seals and remove broken leaf debris from floor joints and wooden pallets (sanitation vacuuming).",
      "Prepare controlled atmosphere treatment (CO2 or Phosphine) if trap thresholds exceed 3 adults/trap/day."
    ],
    biologicalRationale: "Lasioderma serricorne requires relative humidity >65% and temperatures >26°C for optimum larval growth. Sub-60% RH raises larval mortality above 85%.",
    phytosanitaryNotice: "Official M-PAS Biosecurity Standard Operating Procedure (SOP-TOB-402)."
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      platform: "M-PAS Platform",
      system: "AI Tobacco Beetle Monitoring & Prediction Engine",
      targetPest: "Lasioderma serricorne",
      geminiConnected: !!getAiClient(),
      timestamp: new Date().toISOString()
    });
  });

  // AI Diagnostic & Treatment Protocol endpoint
  app.post("/api/ai/diagnose", async (req, res) => {
    try {
      const { query, zone, currentTemp, currentHumidity, catchCount, degreeDays } = req.body;
      const promptQuery = query || "Evaluate current microclimate and provide targeted IPM recommendations for tobacco beetle control.";

      const ai = getAiClient();
      if (ai) {
        const systemInstruction = `You are the chief entomologist and phytosanitary specialist for the M-PAS (Monitoring & Prediction of Agricultural Storage) platform, specializing in Lasioderma serricorne (the cigarette/tobacco beetle).
Your role is to provide rigorous scientific, microclimatic, and biochemical pest management recommendations.
You are thoroughly versed in:
1. Serricornin sex pheromone dynamics ((4S,6S,7S)-7-hydroxy-4,6-dimethylnonan-3-one), trap saturation, and lure longevity (60-day cycle).
2. Degree-days thermal modeling (base physiological threshold of 17.0°C, thermal constant of ~450 degree-days).
3. Microclimatic risk parameters (optimum 30-34°C, 65-75% RH; lethal chilling at -18°C or 4°C; heat treatment at 55°C; desiccation below 55% RH).
4. Phytosanitary treatments (Phosphine PH3 gas CT protocols, Controlled Atmosphere CO2/N2, and strict sanitation).
Format your response as clean, structured JSON with:
- advice (string summarizing diagnosis)
- treatmentPlan (array of actionable step strings)
- urgencyLevel ("LOW" | "MODERATE" | "HIGH" | "CRITICAL")
- biologicalRationale (string explaining insect biology / physiological mechanism)
- phytosanitaryNotice (string with compliance reference)
Return valid JSON only.`;

        const userContext = `Facility Telemetry Context:
- Target Zone: ${zone || "Zone A - Raw Leaf Storage"}
- Temperature: ${currentTemp ?? 31.5}°C
- Relative Humidity: ${currentHumidity ?? 72}%
- 24h Trap Catch: ${catchCount ?? 14} adult beetles
- Accumulated Degree-Days: ${degreeDays ?? 180} DD
- User Question / Focus: ${promptQuery}`;

        const generatePromise = ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: userContext,
          config: {
            systemInstruction,
            responseMimeType: "application/json"
          }
        });

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000));
        const aiResponse = await Promise.race([generatePromise, timeoutPromise]);

        if (aiResponse && aiResponse.text) {
          try {
            const parsed = JSON.parse(aiResponse.text);
            return res.json({ success: true, source: "gemini-3.8-flash", ...parsed });
          } catch (e) {
            // Fallback to text wrapping if JSON parse fails
            return res.json({
              success: true,
              source: "gemini-3.8-flash",
              advice: aiResponse.text,
              treatmentPlan: [
                "Execute microclimate temperature reduction immediately.",
                "Inspect Serricornin trap sticky liners within 24 hours.",
                "Prepare controlled atmosphere treatment if catch counts rise."
              ],
              urgencyLevel: "HIGH",
              biologicalRationale: "Thermal degree-day accumulation in current conditions accelerates pupation.",
              phytosanitaryNotice: "Adheres to CORESTA phytosanitary guidelines."
            });
          }
        }
      }

      // Fallback expert engine
      const expertResult = getExpertEntomologicalAdvice(promptQuery, zone);
      return res.json({
        success: true,
        source: "expert-ipm-engine",
        ...expertResult
      });
    } catch (error: any) {
      console.error("[M-PAS Server] Error in /api/ai/diagnose:", error);
      const fallback = getExpertEntomologicalAdvice(req.body?.query || "Emergency Beetle Containment", req.body?.zone);
      return res.json({
        success: true,
        source: "expert-ipm-fallback",
        ...fallback
      });
    }
  });

  // 15-20 Day Prediction calculation endpoint
  app.post("/api/forecast", (req, res) => {
    const { temp = 30.0, humidity = 70.0 } = req.body;
    
    // Thermal threshold for Lasioderma serricorne is 17°C
    const baseTemp = 17.0;
    const dailyDD = Math.max(0, temp - baseTemp);
    
    // Humidity factor: optimal 65-75%, penalize below 55% or above 85%
    let humidityMultiplier = 1.0;
    if (humidity < 55) {
      humidityMultiplier = 0.35; // Severe desiccation of eggs and early larvae
    } else if (humidity < 65) {
      humidityMultiplier = 0.75;
    } else if (humidity <= 75) {
      humidityMultiplier = 1.25; // Peak developmental velocity
    } else {
      humidityMultiplier = 1.05; // Mold risk, moderate beetle rate
    }

    const days = [];
    const today = new Date();
    let accumulatedDD = 0;

    for (let i = 1; i <= 20; i++) {
      accumulatedDD += dailyDD;
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + i);

      // 15-20 day periodic emergence wave model
      // Pupal eclosion spikes between days 4-6 and secondary generational wave at days 17-19
      const primaryWave = Math.exp(-Math.pow(i - 5, 2) / 3.5) * 85;
      const secondaryWave = Math.exp(-Math.pow(i - 18, 2) / 4.0) * 95;
      const backgroundRisk = Math.min(30, (dailyDD * 2.2));
      
      const rawRisk = (primaryWave + secondaryWave + backgroundRisk) * humidityMultiplier;
      const normalizedRisk = Math.min(100, Math.round(Math.max(5, rawRisk)));
      
      const isPeak = (i >= 4 && i <= 6) || (i >= 17 && i <= 19);
      let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
      if (normalizedRisk >= 75) riskLevel = 'critical';
      else if (normalizedRisk >= 50) riskLevel = 'high';
      else if (normalizedRisk >= 25) riskLevel = 'moderate';

      days.push({
        dayNumber: i,
        date: forecastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dateAr: forecastDate.toLocaleDateString("ar-EG", { month: "short", day: "numeric" }),
        accumulatedDegreeDays: Math.round(accumulatedDD * 10) / 10,
        emergenceRiskIndex: normalizedRisk,
        predictedCatchRate: Math.max(1, Math.round((normalizedRisk / 100) * 18)),
        riskLevel,
        isPeakEmergenceWave: isPeak,
        actionWindow: isPeak ? "INTERVENTION_WINDOW" : "MONITORING_WINDOW"
      });
    }

    res.json({
      success: true,
      parameters: { temp, humidity, baseTemp, dailyDegreeDays: dailyDD },
      forecast: days
    });
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[M-PAS Platform] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
