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
      Analyze the provided medical content with strict radiological rigor.

      [RADIOLOGICAL SPECIMEN RULES]:
      - If multiple radiographs are present (Montage), analyze each as a DISTINCT specimen.
      - DO NOT assume a sequential timeline or "resolution" unless labels (e.g., Dates) are explicitly visible.
      - NEVER invent patient demographics. If Name/Age/Gender is not ON the document, report it as [UNKNOWN].

      [PULMONARY PATHOLOGY LOGIC]:
      1. MEDIASTINAL SHIFT:
         - Shift TOWARD an opacity = Volume Loss/Atelectasis (Pull).
         - Shift AWAY from an opacity = Mass Effect/Tension/Large Effusion (Push).
      2. MORPHOLOGY CHECKPOINTS:
         - Identify Air-Fluid Levels: Characteristic of Abscesses or Cavitating Pneumonia.
         - Identify Meniscus Sign: Curve along the lateral chest wall (Classical Pleural Effusion).
         - Identify D-Shaped/Lenticular Opacities: Suggestive of Loculated Effusion/Empyema.

      Output a precise, segmented clinical analysis in STRICT JSON format:
      {
        "documentType": "e.g. Chest Radiograph (Montage)",
        "patientIdentity": "Extract Name, Age, Gender or report [UNKNOWN]",
        "findings": "Segmented audit (e.g., Image 1: Cavity with air-fluid level; Image 3: Large effusion with mass effect pushed trachea right; etc.)",
        "abnormalMarkers": ["Specific pathological findings found"],
        "implications": "Differentiate between consolidation, effusion, and cavitary disease based on morphology.",
        "advice": "Next steps including CT characterization and clinical correlation.",
        "riskLevel": "Low | Moderate | High | Critical"
      }

      RULES:
      - Be cold and clinical. No narrative fluff. 
      - Quote exact visual findings (e.g. 'Meniscus sign in left costophrenic angle').
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
