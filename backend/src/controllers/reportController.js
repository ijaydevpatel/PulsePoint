import { callGeminiVision } from '../ai-services/geminiService.js';
import Profile from '../models/Profile.js';

// @desc    Ingest Medical Report PDF/Image — Gemini 1.5 Pro Surgical Pipeline
// @route   POST /api/reports/analyze
// @access  Private
export const analyzeReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please attach a PDF or image.' });
    }

    const profile = await Profile.findOne({ user: req.user._id });

    // ── Surgical Diagnostic Pipeline ─────────────────────────────────────────
    const clinicalPrompt = `
      You are PulsePo!int's Cognitive Diagnostic Engine (Surgical Precision Mode).
      Analyze the provided medical content.
      
      [EXTERNAL CONTEXT (Account Holder)]:
      User Age: ${profile?.age || 'Unknown'}, Gender: ${profile?.gender || 'Unknown'}

      [CRITICAL IDENTITY RULES]:
      - ALWAYS prioritize the Name, Age, and Gender written on the document itself.
      - If the document belongs to a different person (e.g., family member), use the document's details.
      - Only use the External Context if the document is missing these identifiers.

      Output a precise clinical analysis in STRICT JSON format:
      {
        "documentType": "Classify document clearly",
        "patientIdentity": "Extract Name, Age, Gender from document",
        "findings": "A high-fidelity paragraph describing all clinical data.",
        "abnormalMarkers": ["List every abnormal value or concerning visual find"],
        "implications": "Clinical significance for THIS specific patient.",
        "advice": "Next steps: Allopathy, Homeopathy, and Urgency level.",
        "riskLevel": "Low | Moderate | High | Critical"
      }

      RULES:
      - Be direct. Use surgical clinical language. 
      - Quote exact lab values where relevant.
      - Output ONLY the JSON object. No pre-amble.
    `;

    const { extractDocumentContent } = await import('../ai-services/documentService.js');
    console.log(`[Analyzer] Handing off ${req.file.mimetype} to High-Fidelity Pipeline...`);
    
    // ── Unified Diagnostic Execution ─────────────────────────────────────────
    const { text: aiRawReply, method, modelName } = await extractDocumentContent(req.file.buffer, req.file.mimetype, clinicalPrompt);
    console.log(`[Analyzer] Raw AI Reply (${method}):`, aiRawReply.substring(0, 100) + '...');

    let parsedResponse;
    try {
      // Clean possible MD markers
      let cleaned = aiRawReply.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      parsedResponse = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);

      // ── Recursive Sanitization to prevent React Crashes ───────────────────
      // If AI returns { findings: { lung: "clear" } }, React crashes. 
      // We must flatten any objects into strings.
      const sanitize = (val) => {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return Object.entries(val).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('; ');
        }
        if (Array.isArray(val)) {
          return val.map(item => (typeof item === 'object' ? JSON.stringify(item) : item));
        }
        return val;
      };

      Object.keys(parsedResponse).forEach(key => {
        parsedResponse[key] = sanitize(parsedResponse[key]);
      });

    } catch (e) {
      console.error('[Analyzer] JSON Parse Fault:', e.message);
      return res.status(500).json({ 
        message: 'Intelligence response could not be parsed.', 
        raw: aiRawReply 
      });
    }

    res.json({
      ...parsedResponse,
      extractionMethod: method,
      modelName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Analyzer] Unhandled error:', error.message);
    const detail = error.message.includes('quota') ? 'AI Quota Exceeded. Please try again in 1 minute.' : error.message;
    res.status(500).json({ 
      message: `Report Analysis Fault: ${detail}`
    });
  }
};
