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
      Analyze the provided medical content using MULTI-STAGE CLINICAL REASONING.

      [STAGE 1: ANATOMICAL AUDIT]:
      - Segment the image (if montage, analyze each 1-4 separately).
      - Audit: Mediastinum, Trachea position, Costophrenic angles, Hemidiaphragms, Lung Fields.
      - Identify physical markers: Air-fluid levels (cavities), Meniscus signs (effusions).

      [STAGE 2: RADIOLOGICAL PHYSICS]:
      - Apply THE PUSH/PULL RULE:
        * Shift TOWARD opacity = VOLUME LOSS/COLLAPSE.
        * Shift AWAY from opacity = MASS EFFECT/EFFUSION.
      - Cross-verify every lung opacity against mediastinal position.

      [STAGE 3: CLINICAL SYNTHESIS]:
      - NEVER assume a recovery timeline or "improvement" unless explicit dates are present.
      - If no demographics are ON THE IMAGE, report [UNKNOWN].

      Output a surgical analysis in STRICT JSON format:
      {
        "documentType": "Strict classification",
        "patientIdentity": "Extract Name, Age, Gender or report [UNKNOWN]",
        "findings": "Detail-heavy segmented audit. Reference specific images (1-4). List exact anatomical status (e.g., 'Image 1: 5cm cavity with air-fluid level; Mediastinum shifted right in Image 3 suggesting mass effect').",
        "abnormalMarkers": ["Key pathological findings"],
        "implications": "Differentiate pathologies based on morphology and physics.",
        "advice": "Precise next clinical steps (e.g., CT, Thoracocentesis, Follow-up).",
        "riskLevel": "Low | Moderate | High | Critical"
      }

      RULES:
      - PRIORITIZE precision over narrative.
      - Quote visual evidence for every claim.
      - Output ONLY the JSON object.
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
