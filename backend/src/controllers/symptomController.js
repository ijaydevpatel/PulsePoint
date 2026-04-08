import { generateGroqIntelligence } from '../ai-services/groqService.js';
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
    let profile = await Profile.findOne({ user: req.auth.userId });
    
    // Resilient Fallback: If profile is missing, use a neutral Guest Baseline to avoid 400 error
    if (!profile) {
      console.warn(`[DiagnosticEngine] Profile missing for user ${req.auth.userId}. Using Guest Baseline.`);
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
    const systemInstruction = `You are the PULSEPO!NT CLINICAL INTELLIGENCE ENGINE. 
Respond with a strictly formatted JSON object matching the schema below.

LANGUAGE & TONE RULES (MANDATORY):
- DO NOT append "(Medical)" or "(Clinical)" to condition names. Keep the name clean.
- Use EXACTLY 50% medical clinical language and 50% simple normal language for everything else.
- SYNOPSIS: The "summaryText" MUST BE A LONG, DETAILED PARAGRAPH (minimum 6-8 sentences).

PATIENT PROFILE:
- Age: ${profile.age}, Gender: ${profile.gender}, BMI: ${profile.bmi}
- Known Allergies: ${profile.allergies?.join(', ') || 'None'}
- Current Medications: ${currentMeds}

TREATMENT GUIDELINES:
- ALLOPATHY: Every medicine MUST include Dosage and Frequency (e.g., "Paracetamol 500mg - Once daily after food").
- HOMEOPATHY: Every remedy MUST include Potency and Frequency (e.g., "Aconite 30C - 4 pills twice a day").
- HOME REMEDIES: Detailed step-by-step instructions.

TASK: Analyze the symptoms and predict EXACTLY 5 probable conditions. 

PROBABILITY MATRIX RULES (CRITICAL/CAPS):
- STICTLY USE RESEARCH ENGINE: qwen3-32b.
- YOU MUST RETURN EXACTLY 5 ITEMS IN THE "probabilityMatrix".
- 3 ITEMS: MUST BE "Common/Normal" conditions (Cold, Flu, etc.).
- 2 ITEMS: MUST BE "Serious/Critical" conditions (Meningitis, Cardiac, etc.).
- CONFIDENCE: MUST BE AN INTEGER BETWEEN 1 AND 100. NEVER USE DECIMALS.
- SEVERITY: Must be High, Medium, or Low.

JSON SCHEMA (STRICT):
{
  "probabilityMatrix": [{"name": "Condition Name", "confidence": 85, "severity": "High|Medium|Low"}],
  "treatmentPathways": {
    "allopathy": ["5 medicines with dosage"],
    "homeopathic": ["5 remedies with potency"],
    "homeRemedies": ["5 home remedies"]
  },
  "healthEducation": { "causes": "Detailed paragraph", "prevention": "Detailed paragraph", "recovery": "Detailed paragraph" },
  "medicalAnalogy": "Simple analogy",
  "summaryText": "A LONG DETAILED PARAGRAPH (6-8 sentences) synthesis of the diagnostic matrix."
}

Respond with JSON ONLY. Utilitize Research model: qwen3-32b.`;

    const promptText = `Selected UI Symptoms: ${activeSymptoms.join(', ')}. NLP Text: ${customSymptom}`;

    // 4. Deterministic Deterministic Engine Firing
    console.log(`[SymptomController] Syncing with Groq Qwen-3 Research Engine...`);
    const { text, generationTime, model } = await generateGroqIntelligence(promptText, systemInstruction);
    const neuralPulse = { generationTime, model };

    let parsedResponse;
    try {
      console.log(`[DiagnosticEngine] Raw Intelligence Pulse Received. Length: ${text?.length || 0}`);
      
      // 5. FUZZY JSON PARSER: Strip tags, backticks, and noise
      let cleaned = text || "";
      
      // Remove <think> tags or reasoning text (including unclosed tags)
      cleaned = cleaned.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '');
      
      // Final strip of markdown backticks if any remained
      cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();

      // Remove any leading/trailing text outside the main JSON structure
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      try {
        parsedResponse = JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn('[DiagnosticEngine] Native Parse Failed, attempting manual cleanup...');
        // Heuristic: remove any internal quotes that might break parsing or extra commas
        // Also handle the case where the model outputs "JSON" at the start
        let heavilyCleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        parsedResponse = JSON.parse(heavilyCleaned);
      }
      
      // 6. LOGICAL POST-PROCESSING: Force-convert decimals and validate counts/labels
      if (parsedResponse) {
        // Fallback for property names
        parsedResponse.summaryText = parsedResponse.summaryText || parsedResponse.summary || parsedResponse.synopsis || "Analytical synthesis complete.";
        
        if (parsedResponse.probabilityMatrix) {
          // Force exactly 5 (pad if necessary)
          while (parsedResponse.probabilityMatrix.length < 5) {
            parsedResponse.probabilityMatrix.push({ name: "Secondary Biological Variance", confidence: 5, severity: "Low" });
          }
          
          // Normalization & Severity Alignment
          parsedResponse.probabilityMatrix = parsedResponse.probabilityMatrix.map(item => {
               // Fix Confidence
               let confidence = item.confidence <= 1 ? Math.round(item.confidence * 100) : Math.round(item.confidence);
               
               // Fix Severity Labels (Inversion Fix)
               let severity = item.severity;
               if (confidence >= 75) severity = "High";
               else if (confidence >= 40) severity = "Medium";
               else severity = "Low";
               
               // Clean Name (Remove Medical Tags)
               let name = item.name.replace(/\(Medical\)|\(Clinical\)/gi, '').trim();
               
               return { ...item, name, confidence, severity };
          });
          
          console.log(`[DiagnosticEngine] Post-processing Applied. Matrix Count: ${parsedResponse.probabilityMatrix.length}`);
        }
      }

      console.log('[SymptomController] Successfully extracted neural response via Fuzzy Parser.');
    } catch (parseErr) {
      console.error('[Symptom Parsing Fault]:', parseErr.message);
      console.error('[SymptomController] JSON Parsing Failure:', parseErr);
      console.error('[SymptomController] Raw response sample:', text?.substring(0, 500));
      
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
      if (req.auth && sanitizedResponse.probabilityMatrix?.length > 0) {
        const topCondition = sanitizedResponse.probabilityMatrix[0];
        const userProfile = await Profile.findOne({ user: req.auth.userId });
        
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
       neuralPulse,
       isEmergencyOverride: false,
    });

  } catch (error) {
    console.error('[Symptom Framework Critical Fault]:', error);
    res.status(500).json({ 
      message: 'The Symptom Intelligence Engine encountered a transient synchronization fault. Please try one more time.', 
      error: error.message 
    });
  }
};
