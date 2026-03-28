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

    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: 'Unverified Profile Execution Block.' });

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
    const hasAllergy1 = profile.allergies.some(a => med1.includes(a.toLowerCase()));
    const hasAllergy2 = profile.allergies.some(a => med2.includes(a.toLowerCase()));

    if (hasAllergy1 || hasAllergy2) {
        hardcodedRiskLevel = "Critical";
        hardcodedVerdict = "Hazard: Exact User Profile Anaphylactic Match";
        isContraindicated = true;
    }

    // 2. ONLY USE LLM FOR EXPLANATION (Never rely on LLM to determine safety)
    const systemInstruction = `You are a medical JSON API. You MUST respond with ONLY a valid JSON object. Do NOT include any text before or after the JSON. Do NOT include markdown or code fences.

Return this exact JSON structure with real values filled in:
{
  "explanation": "Write one paragraph in plain English explaining what happens inside the body when ${med1} and ${med2} are taken together. Start with absorption, then describe metabolic interaction, then physiological effects.",
  "ingredients1": ["mandatory full list of ALL active pharmaceutical ingredients (APIs), chemical compounds, and major excipients found in ${med1}"],
  "ingredients2": ["mandatory full list of ALL active pharmaceutical ingredients (APIs), chemical compounds, and major excipients found in ${med2}"],
  "interactionCause": "Identify the EXACT active ingredients in ${med1} and ${med2} that are responsible for the ${hardcodedRiskLevel} risk level. Explain clearly which ingredient from which medicine is interacting and how it specifically leads to the ${hardcodedRiskLevel} risk status. (Example: 'The Acetylsalicylic Acid in Aspirin and the Warfarin Sodium in Warfarin interact to significantly increase bleeding risk, which is why this combination is flagged as ${hardcodedRiskLevel} risk.').",
  "safeAlternatives": ["safer drug name 1 with reason", "safer drug name 2 with reason"],
  "warnings": ["specific named physiological risk with mechanism", "another specific named risk"]
}`;

    const promptText = `Medicine A: ${med1}. Medicine B: ${med2}. Risk level: ${hardcodedRiskLevel}. Patient age: ${profile.age}, weight: ${profile.weight}kg. Return JSON only.`;

    // 3. Fallback Orchestrator Deployment
    let parsedResponse = {};
    try {
      const rawAiResponse = await executeModelChain('MEDICINE_EXPLANATION', promptText, systemInstruction);
      console.log('[Medicine] Raw LLM response (first 500 chars):', rawAiResponse?.substring(0, 500));

      try {
        // Robust JSON Extraction for Cloud Models (Groq/Qwen)
        // Strip DeepSeek <think> tags if present
        let cleaned = rawAiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        
        // Find the first '{' and the last '}' to isolate the JSON object
        const startIdx = cleaned.indexOf('{');
        const endIdx = cleaned.lastIndexOf('}');
        
        if (startIdx === -1 || endIdx === -1) {
          throw new Error("No JSON boundaries found in AI medicine response.");
        }
        
        const jsonStr = cleaned.substring(startIdx, endIdx + 1);
        parsedResponse = JSON.parse(jsonStr);
        console.log('[MedicineController] Successfully parsed neural response.');
      } catch (parseErr) {
        console.error('LLM Syntax Parsing Failure:', parseErr);
        console.error('Raw Response context:', rawAiResponse?.substring(0, 200));
        // Don't crash - return hardcoded data with fallback explanation
        parsedResponse = {
          explanation: `The detailed interaction analysis between ${med1} and ${med2} could not be fully parsed at this time. Risk level has been determined to be ${hardcodedRiskLevel} based on our internal safety protocols.`,
          ingredients1: [med1],
          ingredients2: [med2],
          interactionCause: isContraindicated ? `${med1} and ${med2} are known contraindicated substances.` : 'No known direct contraindication detected in primary database.',
          safeAlternatives: ["Consult a pharmacist for verified alternatives"],
          warnings: isContraindicated ? ['These medicines should not be combined.'] : ["Maintain standard dosage protocols"]
        };
      }
    } catch (llmErr) {
      console.error('LLM Orchestrator Failure:', llmErr);
      parsedResponse = {
        explanation: `AI analysis temporarily unavailable. Risk level: ${hardcodedRiskLevel} (determined by rule engine).`,
        ingredients1: [med1],
        ingredients2: [med2],
        interactionCause: isContraindicated ? `${med1} and ${med2} are known contraindicated substances.` : 'No known direct contraindication.',
        safeAlternatives: [],
        warnings: isContraindicated ? ['These medicines should not be combined.'] : []
      };
    }

    // 4. Force inject Native Rules over LLM Outputs ensuring ultra-safe payload isolation
    res.json({
       compatibilityVerdict: hardcodedVerdict,
       riskLevel: hardcodedRiskLevel,
       dangerDetected: isContraindicated,
       conflictFlags: isContraindicated ? ["Direct Contradiction Rule Breached"] : [],
       ...parsedResponse
    });

  } catch (error) {
    res.status(500).json({ message: 'Medicine Engine Fault', error: error.message });
  }
};
