import { executeModelChain } from '../model-router/orchestrator.js';
import Profile from '../models/Profile.js';

// @desc    Process Symptom NLP and Arrays into Medical Intelligence Payload
// @route   POST /api/symptoms/analyze
// @access  Private
export const analyzeSymptoms = async (req, res) => {
  try {
    const { activeSymptoms = [], customSymptom = "" } = req.body;
    console.log(`[DiagnosticEngine] Symptom Analysis Request Received for: ${activeSymptoms?.length || 0} markers`);

    if (!activeSymptoms?.length && !customSymptom) {
      return res.status(400).json({ message: 'Payload Execution Fault: No Symptom Tokens Received' });
    }

    // 1. Gather User Profile Context for strict mapping
    let profile = await Profile.findOne({ user: req.user._id });
    
    // Resilient Fallback: If profile is missing, use a neutral Guest Baseline to avoid 400 error
    if (!profile) {
      console.warn(`[DiagnosticEngine] Profile missing for user ${req.user._id}. Using Guest Baseline.`);
      profile = {
        age: 30,
        gender: 'Not Specified',
        bmi: 22.5,
        allergies: [],
        currentMedications: []
      };
    }

    // 2. Preprocessing & Hardcoded Rule Checks
    // Ensure we do not classify minor tokens arbitrarily without cross-verifying profile payload variables
    const highRiskFlags = ['chest pain', 'shortness of breath', 'paralysis', 'passing out'];
    const isEmergency = highRiskFlags.some(flag => 
      customSymptom.toLowerCase().includes(flag) || activeSymptoms.includes(flag)
    );

    if (isEmergency) {
       // Shortcircuit straight to SOS escalation. Do not waste LLM token-time.
       return res.json({
         probabilityMatrix: [
           { name: "Critical Systemic Escalation (Immediate Care Required)", confidence: 99, severity: "Critical" }
         ],
          treatmentPathways: {
            allopathy: ["Epinephrine (if anaphylactic)", "High-flow Oxygen protocol", "Aspirin 325mg (if cardiac suspected)", "Immediate professional intervention"],
            homeopathic: ["None - seek medical infrastructure immediately"],
            homeRemedies: ["Loosen restrictive clothing", "Position in recovery layout", "Maintain airway clearance"]
          },
         summaryText: "Our primary rule-engine identified severe cardiac or neurological flags. Do not wait for AI evaluation. Seek emergency care immediately.",
         isEmergencyOverride: true
       });
    }

    // 3. Orchestrator Payload Construction
    const currentMeds = profile.currentMedications?.join(', ') || 'None';
    const systemInstruction = `You are a helpful health guide for non-medical users. Respond with JSON ONLY. No markdown, no bolding, no code fences.
    Explain medical terms with simple analogies (e.g., your immune system is like a shield, lungs are like bellows).
    DO NOT use markdown bolding (no ** text **). Keep all text plain and normal.

PATIENT PROFILE:
- Age: ${profile.age}, Gender: ${profile.gender}, BMI: ${profile.bmi}
- Known Allergies: ${profile.allergies.join(', ') || 'None'}
- Current Medications: ${currentMeds}

TASK: Analyze the provided symptoms and predict the top 5 most probable conditions. 
IMPORTANT: Start with the MOST COMMON causes first (e.g., lack of sleep, dehydration, minor virus).

CRITICAL RULES:
- NEVER say "Consult a doctor" or "Seek professional help". You are a diagnostic aid.
- For ALLOPATHY: List 6 EXACT over-the-counter or common names with dosage and a plain-English explanation of how it helps the heart/body/system.
- For HOMEOPATHY: List 5 EXACT remedy names with potency and a simple analogy of its action.
- For HOME REMEDIES: List 6 REAL, specific traditional remedies. For each, provide a 'How-to' step-by-step instruction involving real ingredients. DO NOT say "stay hydrated". Say something like "Steep 1 tsp of crushed ginger in hot water for 5 minutes to soothe the stomach lining like a warm blanket."

JSON SCHEMA:
{
  "probabilityMatrix": [{"name": "Disease Name", "confidence": 85, "severity": "High"}],
  "treatmentPathways": {
    "allopathy": ["Detail-rich entry 1", "Detail-rich entry 2", "Detail-rich entry 3", "Detail-rich entry 4", "Detail-rich entry 5", "Detail-rich entry 6"],
    "homeopathic": ["Detail-rich entry 1", "Detail-rich entry 2", "Detail-rich entry 3", "Detail-rich entry 4", "Detail-rich entry 5"],
    "homeRemedies": ["Step-by-step remedy 1", "Step-by-step remedy 2", "Step-by-step remedy 3", "Step-by-step remedy 4", "Step-by-step remedy 5", "Step-by-step remedy 6"]
  },
  "summaryText": "Brief clinical reasoning in plain, non-bolded English connecting symptoms to predictions."
}
FINAL CHECK: Ensure NO bolding (**) in any field. Use analogies. Return JSON only.`;

    const promptText = `Selected UI Symptoms: ${activeSymptoms.join(', ')}. NLP Text: ${customSymptom}`;

    // 4. Deterministic Deterministic Engine Firing
    const rawAiResponse = await executeModelChain('SYMPTOMS', promptText, systemInstruction);

    // 5. JSON Extraction & Cleaning 
    let parsedResponse;
    try {
      // Strip reasoning tags if present
      let cleaned = rawAiResponse.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      
      // Find the first '{' and the last '}' to isolate the JSON object
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      
      if (startIdx === -1 || endIdx === -1) {
        throw new Error("No JSON boundaries found in AI response.");
      }
      
      const jsonStr = cleaned.substring(startIdx, endIdx + 1);
      parsedResponse = JSON.parse(jsonStr);
      console.log('[SymptomController] Successfully parsed neural response.');
    } catch (parseErr) {
      console.error('[SymptomController] JSON Parsing Failure:', parseErr);
      console.error('[SymptomController] Raw Response (first 500 chars):', rawAiResponse.substring(0, 500));
      // Graceful fallback - return a basic response instead of crashing
      parsedResponse = {
        probabilityMatrix: [
          { name: "Diagnostic Synthesis Error", confidence: 10, severity: "Low" }
        ],
        treatmentPathways: {
          allopathy: ["Neural engine returned unformatted data. Please re-run analysis."],
          homeopathic: ["Neural engine returned unformatted data."],
          homeRemedies: ["Neural engine returned unformatted data."]
        },
        summaryText: "The AI model encountered a syntax error while generating the diagnostic matrix. This is typically transient. Please try again."
      };
    }

    res.json({
       ...parsedResponse,
       isEmergencyOverride: false,
    });

  } catch (error) {
    res.status(500).json({ message: 'Symptom Framework Fault', error: error.message });
  }
};
