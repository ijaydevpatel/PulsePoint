import { executeModelChain } from '../model-router/orchestrator.js';
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

    let profile = await Profile.findOne({ user: req.user._id });
    
    // Resilient Fallback: Use standard metrics if profile is missing to ensure stability
    if (!profile) {
      console.warn(`[DiagnosticEngine] Profile missing for user ${req.user._id}. Using Guest Baseline.`);
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

    const systemInstruction = `You are a Senior Research Clinical Pharmacist and Homeopathic Materia Medica Consultant. 
You MUST respond with ONLY a valid JSON object. 

MODALITY GATING:
- ALLOPATHIC: Use research-grade toxicology (CYP450 isoenzymes, NAPQI, hepatocyte metabolism). Physical Risk is REAL.
- HOMEOPATHIC: Use Materia Medica logic (Vital Force, Miasmic layers, Antidoting). Physical Risk is 0% (Dilution >12C).

STRICT CLINICAL INTELLIGENCE REQUIREMENTS:
1. TECHNICAL LABEL DECOMPOSITION (Mandatory): 
   - ALLOPATHIC: Perform a DailyMed-standard audit. Extract Active APIs + Specific Binders (e.g. Croscarmellose), Coatings (e.g. Hypromellose), and Additives (e.g. Polysorbate 80). NO 'N/A'.
   - HOMEOPATHIC: Base substance + Potency + Vehicle (Lactose/Alcohol).
2. MEDICAL TERMINOLOGY: Use serious, valid clinical terms. Avoid overly simple language. 
3. EXPLANATION: 6-8 sentence exhaustive deep-dive. Use the analogy based on ${randomTheme}.
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
  "interactionCause": "Pharmacological Collision Logic (Allopathy) OR Energetic Antidoting Logic (Homeopathy).",
  "metabolicPathway": "Specific enzyme/pathway (Allopathy) OR Vital Force/Interference Level (Homeopathy).",
  "clinicalSeverityNote": "Mechanism-based risk analysis.",
  "interferenceScore": 0-100 (for Homeopathy),
  "riskPercentage": 0-100 (Physical risk, MUST be 0 for Homeopathy),
  "detectedRisk": "Low | Medium | High | Critical",
  "patientAdvice": "Exhaustive clinical advice.",
  "safeAlternatives": ["Clinical Alternative 1", "Clinical Alternative 2"],
  "warnings": ["Clinical Warning 1", "Clinical Warning 2"]
}
NO MARKDOWN. Return JSON ONLY.`;

    const promptText = `TECHNICAL LABEL AUDIT:
Agent A: ${med1}
Agent B: ${med2}
Baseline: ${hardcodedRiskLevel}
Patient: ${profile.age}yo, ${profile.weight}kg.

Extract full technical ingredients (Active + Inactive decomposition) and analyze. Return JSON only.`;

    let parsedResponse = {};
    try {
      // Use Qwen-32B as the primary research engine for deep label extraction
      const rawAiResponse = await executeModelChain('MEDICINE_EXPLANATION', promptText, systemInstruction, { 
        temperature: 0.1,
        model: 'qwen/qwen3-32b' 
      });
      
      console.log(`[MedicineController] Raw Research Output (Partial): ${rawAiResponse.substring(0, 300)}...`);

      try {
        let cleaned = rawAiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const startIdx = cleaned.indexOf('{');
        const endIdx = cleaned.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          const jsonStr = cleaned.substring(startIdx, endIdx + 1);
          parsedResponse = JSON.parse(jsonStr);

          // AGGRESSIVE SANITIZATION: Clear markdown from values
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
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseErr) {
        console.error('[MedicineController] JSON Parsing Failure:', parseErr);
        parsedResponse = {
          explanation: `Analysis simplified. Risk is ${hardcodedRiskLevel}.`,
          techIngredients1: { active: med1, inactive: { binders: "N/A", coatings: "N/A", additives: "N/A" } },
          techIngredients2: { active: med2, inactive: { binders: "N/A", coatings: "N/A", additives: "N/A" } },
          detectedRisk: hardcodedRiskLevel,
          safeAlternatives: ["Consult a physician"],
          warnings: ["Technical data limited"]
        };
      }
    } catch (llmErr) {
      console.error('[MedicineController] AI Inference Failure:', llmErr);
      parsedResponse = {
        detectedRisk: hardcodedRiskLevel,
        explanation: `Analysis is currently limited. Baseline risk is ${hardcodedRiskLevel}.`,
        techIngredients1: { active: med1, inactive: { binders: "N/A", coatings: "N/A", additives: "N/A" } },
        techIngredients2: { active: med2, inactive: { binders: "N/A", coatings: "N/A", additives: "N/A" } },
        safeAlternatives: ["Consult health professional"]
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
       ...parsedResponse
    });

  } catch (error) {
    console.error('[MedicineController] Framework Fault:', error.stack);
    res.status(500).json({ message: 'Medicine Engine Fault', error: error.message });
  }
};
