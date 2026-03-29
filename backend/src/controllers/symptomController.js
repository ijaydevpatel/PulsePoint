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
    const currentMeds = profile.medications?.join(', ') || 'None';
    const systemInstruction = `You are a helpful health guide for non-medical users. Respond with JSON ONLY. No markdown, no bolding, no code fences.
    Explain medical terms with simple analogies (e.g., your immune system is like a shield, lungs are like bellows).
    DO NOT use markdown bolding (no ** text **). Keep all text plain and normal.

PATIENT PROFILE:
- Age: ${profile.age}, Gender: ${profile.gender}, BMI: ${profile.bmi}
- Known Allergies: ${profile.allergies?.join(', ') || 'None'}
- Current Medications: ${currentMeds}

TASK: Analyze the provided symptoms and predict the top 5 most probable conditions. 

CRITICAL RULES:
- NEVER say "Consult a doctor" or "Seek professional help". You are a diagnostic aid.
- For ALLOPATHY: List 6 EXACT over-the-counter names with plain-English explanation.
- For HOMEOPATHY: List 5 EXACT remedy names with simple analogy.
- For HOME REMEDIES: List 6 REAL traditional remedies with step-by-step instructions.
- HEALTH EDUCATION: For the top condition, provide "causes", "prevention", and "recovery" in short plain text.
- ANALOGY ENGINE: Provide a "medicalAnalogy" for the top condition connecting it to a simple daily concept.

JSON SCHEMA:
{
  "probabilityMatrix": [{"name": "Disease Name", "confidence": 85, "severity": "High"}],
  "treatmentPathways": {
    "allopathy": ["entry 1", "entry 2", "entry 3", "entry 4", "entry 5", "entry 6"],
    "homeopathic": ["entry 1", "entry 2", "entry 3", "entry 4", "entry 5"],
    "homeRemedies": ["remedy 1", "remedy 2", "remedy 3", "remedy 4", "remedy 5", "remedy 6"]
  },
  "healthEducation": {
    "causes": "Plain text reasons",
    "prevention": "Plain text steps",
    "recovery": "Plain text duration and care"
  },
  "medicalAnalogy": "Simple plain text analogy",
  "summaryText": "Brief clinical reasoning in plain, non-bolded English."
}
FINAL CHECK: Ensure NO bolding (**) or markdown. Return JSON only.`;

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

    // 6. AGGRESSIVE SANITIZATION: Force-strip all markdown bold/italics from entire object
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

    const sanitizedResponse = cleanObj(parsedResponse);

    // 7. Digital Twin Pattern Detection & Logging (March 29 Extension)
    try {
      if (req.user && sanitizedResponse.probabilityMatrix?.length > 0) {
        const topCondition = sanitizedResponse.probabilityMatrix[0];
        const userProfile = await Profile.findOne({ user: req.user._id });
        
        if (userProfile) {
          // Detect Patterns
          const recentInsights = userProfile.healthInsights?.slice(-10) || [];
          const isRecurring = recentInsights.some(ins => 
            ins.content?.toLowerCase().includes(topCondition.name.toLowerCase())
          );

          const newInsight = {
            type: isRecurring ? 'Pattern' : 'Risk',
            content: `${isRecurring ? 'Recurring' : 'Detected'} trend for ${topCondition.name}.`,
            severity: topCondition.severity,
            date: new Date()
          };

          // Limit insights to last 50 to prevent document bloat
          userProfile.healthInsights.push(newInsight);
          if (userProfile.healthInsights.length > 50) userProfile.healthInsights.shift();
          
          await userProfile.save();
          console.log(`[DigitalTwin] Insight logged: ${newInsight.type}`);
        }
      }
    } catch (twinErr) {
      console.error('[DigitalTwin] Logging Fault:', twinErr);
    }

    res.json({
       ...sanitizedResponse,
       isEmergencyOverride: false,
    });

  } catch (error) {
    res.status(500).json({ message: 'Symptom Framework Fault', error: error.message });
  }
};
