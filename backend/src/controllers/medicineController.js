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
    const systemInstruction = `You are a medical JSON API for non-medical users. You MUST respond with ONLY a valid JSON object. 
    Explain everything in simple, plain English using everyday analogies (e.g., your liver is like a filter, blood is like water in pipes). 
    DO NOT use markdown bolding (no **). Keep all text normal.

Return this exact JSON structure:
{
  "explanation": "One paragraph in plain English. Use analogies. No jargon. No bolding.",
  "ingredients1": ["API list for ${med1}"],
  "ingredients2": ["API list for ${med2}"],
  "interactionCause": "Explain clearly which ingredients are clashing. If they are the same ingredient (overlap), explain the risk of 'double dosing'. No bolding.",
  "detectedRisk": "Low, Medium, High, or Critical based on your analysis of these specific drugs.",
  "safeAlternatives": ["alternative 1 with reason", "alternative 2 with reason"],
  "warnings": ["specific risk 1", "specific risk 2"]
}`;

    const promptText = `Medicine A: ${med1}. Medicine B: ${med2}. System Baseline Risk: ${hardcodedRiskLevel}. Patient: ${profile.age}yo, ${profile.weight}kg. Return JSON only. No bolding.`;

    // 3. Fallback Orchestrator Deployment
    let parsedResponse = {};
    try {
      const rawAiResponse = await executeModelChain('MEDICINE_EXPLANATION', promptText, systemInstruction);
      
      try {
        let cleaned = rawAiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        const startIdx = cleaned.indexOf('{');
        const endIdx = cleaned.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          const jsonStr = cleaned.substring(startIdx, endIdx + 1);
          parsedResponse = JSON.parse(jsonStr);
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseErr) {
        console.error('[MedicineController] JSON Parsing Failure:', parseErr);
        console.error('[MedicineController] Raw AI Response (first 500 chars):', rawAiResponse.substring(0, 500));
        parsedResponse = {
          explanation: `The internal analysis for ${med1} and ${med2} is being simplified for you. Risk is ${hardcodedRiskLevel}.`,
          ingredients1: [med1],
          ingredients2: [med2],
          interactionCause: isContraindicated ? 'These medicines are not a good match.' : 'No major clash found in our primary list.',
          detectedRisk: hardcodedRiskLevel,
          safeAlternatives: ["Consult your local pharmacist"],
          warnings: ["Take care with dosing"]
        };
      }
    } catch (llmErr) {
      console.error('[MedicineController] AI Inference Failure:', llmErr);
      parsedResponse = {
        detectedRisk: hardcodedRiskLevel,
        explanation: `Analysis is currently limited. Baseline risk is ${hardcodedRiskLevel}.`,
        ingredients1: [med1],
        ingredients2: [med2],
        interactionCause: 'System baseline check only.',
        safeAlternatives: [],
        warnings: []
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
