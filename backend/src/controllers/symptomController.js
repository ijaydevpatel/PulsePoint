import { executeModelChain } from '../model-router/orchestrator.js';
import Profile from '../models/Profile.js';

// @desc    Process Symptom NLP and Arrays into Medical Intelligence Payload
// @route   POST /api/symptoms/analyze
// @access  Private
export const analyzeSymptoms = async (req, res) => {
  try {
    const { activeSymptoms, customSymptom } = req.body;
    console.log(`[DiagnosticEngine] Symptom Analysis Request Received for: ${activeSymptoms?.length || 0} markers`);

    if (!activeSymptoms.length && !customSymptom) {
      return res.status(400).json({ message: 'Payload Execution Fault: No Symptom Tokens Received' });
    }

    // 1. Gather User Profile Context for strict mapping
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: 'Profile Security Engine Fault. Unverified user context.' });

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
    const systemInstruction = `You are a Predictive Therapeutic Intelligence Engine. Respond with JSON ONLY. No markdown, no commentary.

PATIENT PROFILE:
- Age: ${profile.age}, Gender: ${profile.gender}, BMI: ${profile.bmi}
- Known Allergies: ${profile.allergies.join(', ') || 'None'}
- Current Medications: ${currentMeds}

TASK: Analyze the provided symptoms and predict the top 5 most probable conditions. 
IMPORTANT: Start with the MOST COMMON everyday causes first (e.g., dehydration, food poisoning, stomach upset, viral infection, stress) and only then progress to rarer or more severe conditions. Do NOT jump to extreme diagnoses like Anorexia Nervosa or Meningitis for common symptoms.

CRITICAL RULES:
- NEVER say "Consult a doctor", "Seek professional help", or "Prescription of...". You ARE the predictive engine.
- For ALLOPATHY: List 4-5 EXACT over-the-counter or common prescription drug names with dosage, each specific to one of the predicted conditions. DO NOT recommend any drug the patient is allergic to or that conflicts with their current medications.
- For HOMEOPATHY: List 3-4 EXACT homeopathic remedy names with potency, each specific to one of the predicted conditions.
- For HOME REMEDIES: List 4-5 REAL, specific, condition-relevant traditional home remedies unique to the diagnosed symptoms. These must be actionable things involving real ingredients (spices, herbs, oils, food items, compresses, soaks, etc). Each remedy MUST be different and MUST be specifically chosen for the symptoms provided. DO NOT repeat the same remedies across different symptom analyses. DO NOT say generic things like "stay hydrated", "rest", or "eat balanced diet".

JSON SCHEMA:
{
  "probabilityMatrix": [{"name": "Disease Name", "confidence": 85, "severity": "High"}],
  "treatmentPathways": {
    "allopathy": ["DrugName Dosage - for ConditionName", "DrugName2 Dosage", "DrugName3 Dosage", "DrugName4 Dosage"],
    "homeopathic": ["RemedyName Potency - for ConditionName", "RemedyName2 Potency", "RemedyName3 Potency"],
    "homeRemedies": ["Condition-specific traditional remedy 1", "Condition-specific traditional remedy 2", "Condition-specific traditional remedy 3", "Condition-specific traditional remedy 4"]
  },
  "summaryText": "Brief clinical reasoning connecting symptoms to predictions."
}
FINAL CHECK BEFORE RESPONDING:
- probabilityMatrix MUST have exactly 5 items.
- allopathy MUST have at least 4 items.
- homeopathic MUST have at least 3 items.
- homeRemedies MUST have at least 4 items.
- Every homeRemedies item must be UNIQUE and SPECIFIC to the diagnosed conditions.
If any array has fewer items than required, ADD MORE before responding.`;

    const promptText = `Selected UI Symptoms: ${activeSymptoms.join(', ')}. NLP Text: ${customSymptom}`;

    // 4. Deterministic Deterministic Engine Firing
    const rawAiResponse = await executeModelChain('SYMPTOMS', promptText, systemInstruction);

    // 5. JSON Extraction & Cleaning 
    let parsedResponse;
    try {
      // Robust JSON Extraction for Cloud Models (Groq/Qwen)
      // Strip DeepSeek <think> tags if present
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
      console.error('LLM Syntax Parsing Failure:', parseErr);
      console.error('Raw Response context:', rawAiResponse.substring(0, 200));
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
