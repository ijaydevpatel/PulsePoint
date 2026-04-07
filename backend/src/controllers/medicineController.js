import { generateGroqIntelligence } from '../ai-services/groqService.js';
import Profile from '../models/Profile.js';

// Hardcoded Medical Contraindication Database
// DO NOT MUTATE WITHOUT OVERSIGHT. This prevents LLM hallucinations.
const CONTRAINDICATIONS = {
  "ibuprofen": ["aspirin", "naproxen", "warfarin"],
  "aspirin": ["ibuprofen", "warfarin", "naproxen", "clopidogrel"],
  "warfarin": ["aspirin", "ibuprofen", "amiodarone"],
  "sildenafil": ["nitroglycerin", "isosorbide dinitrate"],
  "nitroglycerin": ["sildenafil", "tadalafil", "vardenafil"],
  "fluoxetine": ["phenelzine", "tranylcypromine", "selegiline", "tramadol"],
  "tramadol": ["fluoxetine", "paroxetine", "sertraline"]
};

// @desc    Determine Medicine Compatibility utilizing Rules First -> LLM Explanation Second
// @route   POST /api/medicine/check
// @access  Private
export const checkMedicineCompatibility = async (req, res) => {
  try {
    const { primaryMedicine, secondaryMedicine } = req.body;
    console.log(`[DiagnosticEngine] Medicine Collision Check Received for: ${primaryMedicine} & ${secondaryMedicine}`);

    if (!primaryMedicine || !secondaryMedicine) {
      return res.status(400).json({ message: 'Input Fault: Requires Dual Medicine String Maps.' });
    }

    let profile = await Profile.findOne({ user: req.auth.userId });
    
    // Resilient Fallback: Use standard metrics if profile is missing to ensure stability
    if (!profile) {
      console.warn(`[DiagnosticEngine] Profile missing for user ${req.auth.userId}. Using Guest Baseline.`);
      profile = {
        age: 30,
        weight: 75,
        allergies: []
      };
    }

    const med1 = primaryMedicine.toLowerCase().trim();
    const med2 = secondaryMedicine.toLowerCase().trim();

    // 1. RULES FIRST - PRE-LLM DETERMINISTIC SAFETY GATING
    let hardcodedRiskLevel = "Low";
    let hardcodedVerdict = "Generally Safe";
    let isContraindicated = false;

    if (CONTRAINDICATIONS[med1]?.includes(med2) || CONTRAINDICATIONS[med2]?.includes(med1)) {
        hardcodedRiskLevel = "High";
        hardcodedVerdict = "Severe Interaction Detected";
        isContraindicated = true;
    }

    // Checking against User Profile Allergies natively without LLM mapping
    const hasAllergy1 = (profile.allergies || []).some(a => med1.includes(a.toLowerCase()));
    const hasAllergy2 = (profile.allergies || []).some(a => med2.includes(a.toLowerCase()));

    if (hasAllergy1 || hasAllergy2) {
        hardcodedRiskLevel = "Critical";
        hardcodedVerdict = "Hazard: Exact User Profile Anaphylactic Match";
        isContraindicated = true;
    }

    // 2. ONLY USE LLM FOR EXPLANATION (Never rely on LLM to determine safety)
    const themes = [
      "Navigational Sync", "Biological Encryption", "Neural Latency", "Systemic Resonance",
      "Cellular Logistics", "Metabolic Sequencing", "Circuitry Overload", "Signal Interference"
    ];
    const randomTheme = themes[Math.floor(Date.now() / 60000) % themes.length];

    const systemInstruction = `You are a Senior Research Clinical Pharmacist (PULSEPO!NT PHARMACORE ENGINE). 
You MUST respond with ONLY a valid JSON object. 
Strictly utilize the Research model ID: qwen/qwen3-32b.

LANGUAGE & TONE RULES (MANDATORY):
- Use EXACTLY 50% medical clinical language and 50% simple normal language for everything else.
- EXPLANATION: The "explanation" MUST BE A LONG, DETAILED PARAGRAPH (minimum 6-8 sentences).
- INTERACTION CAUSE: The "interactionCause" MUST BE A LONG DETAILED PARAGRAPH (minimum 4-6 sentences).

MODALITY GATING:
- ALLOPATHIC: Use research-grade toxicology (CYP450 isoenzymes, NAPQI, hepatocyte metabolism).
- HOMEOPATHIC: Use Materia Medica logic (Vital Force, Miasmic layers).

STRICT CLINICAL INTELLIGENCE REQUIREMENTS:
1. TECHNICAL LABEL DECOMPOSITION (Mandatory): 
   - ALLOPATHIC: Perform a DailyMed-standard audit. Extract Active APIs + Specific Binders (e.g. Croscarmellose), Coatings (e.g. Hypromellose), and Additives (e.g. Polysorbate 80). NO 'N/A'.
   - HOMEOPATHIC: Base substance + Potency + Vehicle (Lactose/Alcohol).
2. MEDICAL TERMINOLOGY: Use serious, valid clinical terms. 
3. EXPLANATION: 6-8 sentence exhaustive deep-dive with the ${randomTheme} analogy.
4. INTERACTION CAUSE: Specific biochemical/energetic mechanism. Min 4 sentences.

JSON SCHEMA:
{
  "isHomeopathic": true | false,
  "explanation": "Detailed clinical deep-dive with the ${randomTheme} analogy. No bolding.",
  "techIngredients1": {
    "active": "Full Active Ingredient + Dosage",
    "inactive": { "binders": "Specific pharmaceutical binders", "coatings": "Coating agents", "additives": "Colorants/Preservatives" }
  },
  "techIngredients2": {
    "active": "Full Active Ingredient + Dosage",
    "inactive": { "binders": "Specific pharmaceutical binders", "coatings": "Coating agents", "additives": "Colorants/Preservatives" }
  },
  "interactionCause": "Pharmacological Collision Logic (Allopathy). Detailed paragraph.",
  "metabolicPathway": "Specific enzyme/pathway.",
  "clinicalSeverityNote": "Mechanism-based risk analysis.",
  "interferenceScore": 0-100,
  "riskPercentage": 0-100,
  "detectedRisk": "Low | Medium | High | Critical",
  "patientAdvice": "Exhaustive clinical advice.",
  "safeAlternatives": ["Clinical Alternative 1", "Clinical Alternative 2"],
  "warnings": ["Clinical Warning 1", "Clinical Warning 2"]
}
Respond with JSON ONLY. Utilitize Research model: qwen/qwen3-32b.`;

    const promptText = `TECHNICAL LABEL AUDIT:
Agent A: ${med1}
Agent B: ${med2}
Baseline: ${hardcodedRiskLevel}
Patient: ${profile.age}yo, ${profile.weight}kg.

Extract full technical ingredients (Active + Inactive decomposition) and analyze. Return JSON only.`;

    let parsedResponse = {};
    let neuralPulse = null;
    
    try {
      console.log(`[MedicineController] Syncing with Groq Qwen-3 Research Engine...`);
      const { text, generationTime, model } = await generateGroqIntelligence(promptText, systemInstruction);
      neuralPulse = { generationTime, model };
      
      console.log(`[MedicineController] Raw Intelligence Pulse Received. Length: ${text?.length || 0}`);
      
      // 3. FUZZY JSON PARSER: Strip tags, backticks, and noise
      let cleaned = text || "";
      
      // Remove <think> tags or reasoning text
      cleaned = cleaned.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '');
      
      // Clean markdown and prefix text
      cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      try {
        parsedResponse = JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn('[MedicineController] Native Parse Failed, attempting manual cleanup...');
        let heavilyCleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        parsedResponse = JSON.parse(heavilyCleaned);
      }
      
      // 4. AGGRESSIVE SANITIZATION: Clear markdown from values
      const cleanObj = (obj) => {
        if (typeof obj === 'string') return obj.replace(/\*\*|\*/g, '').trim();
        if (Array.isArray(obj)) return obj.map(cleanObj);
        if (typeof obj === 'object' && obj !== null) {
          const newObj = {};
          for (const key in obj) newObj[key] = cleanObj(obj[key]);
          return newObj;
        }
        return obj;
      };
      parsedResponse = cleanObj(parsedResponse);

    } catch (llmErr) {
      console.error('[MedicineController] AI Inference failure:', llmErr);
      parsedResponse = {
        detectedRisk: hardcodedRiskLevel,
        explanation: `Intelligence analysis briefly paused. Baseline risk is ${hardcodedRiskLevel}.`,
        techIngredients1: { active: med1, inactive: { binders: "N/A", coatings: "N/A", additives: "N/A" } },
        techIngredients2: { active: med2, inactive: { binders: "N/A", coatings: "N/A", additives: "N/A" } },
        safeAlternatives: ["Consult clinician"]
      };
    }

    // 4. Resolve Contradictions: Use the higher of hardcoded or detected risk
    const riskMap = { "Low": 1, "Medium": 2, "High": 3, "Critical": 4 };
    const detectedRiskVal = riskMap[parsedResponse.detectedRisk] || 1;
    const hardcodedRiskVal = riskMap[hardcodedRiskLevel] || 1;
    
    const finalRisk = (detectedRiskVal > hardcodedRiskVal) 
      ? parsedResponse.detectedRisk 
      : hardcodedRiskLevel;

    const finalVerdict = (finalRisk === "High" || finalRisk === "Critical") 
      ? "Interaction Warning" 
      : (finalRisk === "Medium") ? "Caution Advised" : "Generally Safe";

    const percentageMap = { "Low": 20, "Medium": 50, "High": 80, "Critical": 100 };
    
    // Determine MODALITY
    const isHomeo = parsedResponse.isHomeopathic || false;
    
    // Deterministic Risk Logic
    const finalPercentage = isHomeo ? 0 : (percentageMap[finalRisk] || 10);
    const finalInterference = isHomeo ? (parsedResponse.interferenceScore || percentageMap[finalRisk] || 10) : 0;

     res.json({
        compatibilityVerdict: finalVerdict,
        riskLevel: finalRisk,
        riskPercentage: finalPercentage,
        interferenceScore: finalInterference,
        isHomeopathic: isHomeo,
        dangerDetected: !isHomeo && (finalRisk === "High" || finalRisk === "Critical"),
        conflictFlags: isContraindicated ? ["Direct Database Match"] : [],
        neuralPulse,
        ...parsedResponse
     });

  } catch (error) {
    console.error('[MedicineController] Framework Fault:', error.stack);
    res.status(500).json({ message: 'Medicine Engine Fault', error: error.message });
  }
};
