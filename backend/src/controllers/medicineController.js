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

    const systemInstruction = `You are a professional board-certified senior clinical pharmacist. You MUST respond with ONLY a valid JSON object. 
Safety and clinical accuracy are your highest priorities.

STRICT CLINICAL TRUTHS:
- CETIRIZINE, LORATADINE, FEXOFENADINE ARE 2ND GENERATION (Non-sedating).
- DIPHENHYDRAMINE, CHLORPHENIRAMINE ARE 1ST GENERATION (Sedating).

STRICT PROMPT RULES:
1. ANALOGY: Use a unique, deep analogy based on ${randomTheme}. 2-3 detailed paragraphs.
2. TECHNICAL INGREDIENTS: Perform a DailyMed-grade label audit.
   - Extract 'Active Ingredient' string with common dosages.
   - Decompose 'Inactive Ingredients' into Binders, Coatings, and Additives.
3. JSON SCHEMA:
{
  "explanation": "6-8 sentence deep-dive analysis. Must integrate high-level medical terminology (e.g., CYP450 isoenzymes, hepatocyte glutathione depletion, toxic metabolites like NAPQI, first-pass metabolism). Use the analogy but maintain a serious clinical tone. No bolding.",
  "techIngredients1": {
    "active": "API Name (Common dosages)",
    "inactive": {
      "binders": "Fillers/Binders list",
      "coatings": "Glazing/Coating agents",
      "additives": "Other additives/colorants"
    }
  },
  "techIngredients2": {
    "active": "API Name (Common dosages)",
    "inactive": {
      "binders": "Fillers/Binders list",
      "coatings": "Glazing/Coating agents",
      "additives": "Other additives/colorants"
    }
  },
  "interactionCause": "Exhaustive physiological and pharmacological breakdown of how these agents collide. Min 3 sentences.",
  "metabolicPathway": "Specific enzyme (CYP450, etc.) and systemic pathway affected in detail.",
  "clinicalSeverityNote": "Detailed clinical rationale including half-life and clearance impact.",
  "patientAdvice": "Comprehensive, multi-point patient guidance and safety maneuvers.",
  "detectedRisk": "Low | Medium | High | Critical",
  "safeAlternatives": ["Alternative 1", "Alternative 2"],
  "warnings": ["Warning 1", "Warning 2"]
}
4. NO MARKDOWN: No bolding (**). No think tags. No preamble. Return JSON ONLY.`;

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

    res.json({
       compatibilityVerdict: finalVerdict,
       riskLevel: finalRisk,
       dangerDetected: (finalRisk === "High" || finalRisk === "Critical"),
       conflictFlags: isContraindicated ? ["Direct Database Match"] : [],
       ...parsedResponse
    });

  } catch (error) {
    console.error('[MedicineController] Framework Fault:', error.stack);
    res.status(500).json({ message: 'Medicine Engine Fault', error: error.message });
  }
};
