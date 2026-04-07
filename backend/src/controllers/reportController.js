import { generateGeminiAnalysis, generateDualStageAnalysis } from '../ai-services/geminiService.js';
import Profile from '../models/Profile.js';

// @desc    Ingest Medical Report PDF/Image — Gemini 1.5 Pro Surgical Pipeline
// @route   POST /api/reports/analyze
// @access  Private
export const analyzeReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please attach a PDF or image.' });
    }

    const profile = await Profile.findOne({ user: req.auth.userId });

    // ── STAGE 1: Vision Extraction Prompt (Gemini 2.5 Fidelity) ──────────────
    const visionExtractionPrompt = `
      You are Stage 1 (Extraction Core) of the PulsePo!int Surgical Pipeline.
      Extract EVERY visible clinical detail from the attached documents.
      
      [REQUIREMENTS]:
      - List all markers, values, ranges, and units.
      - Describe any anatomical abnormalities in images (X-Rays, Scans).
      - Identify dates, clinics, and doctor names.
      - Be exhaustive. Do not summarize yet.
    `;

    // ── STAGE 2: Pathological Synthesis Prompt (Gemini 3 Reasoning) ──────────
    const pathologicalSynthesisPrompt = `
      You are Stage 2 (Synthesis Engine) of the PulsePo!int Surgical Pipeline.
      Using the provided extraction data from Stage 1, perform multi-stage clinical reasoning to generate a consolidated report.

      [REASONING PROTOCOL]:
      1. ANALYZE visual markers against physiological benchmarks.
      2. CORRELATE different document findings.
      3. SYNTHESIZE a precise biological implication.

      Output a surgical analysis in STRICT JSON format:
      {
        "documentType": "Surgical Synthesis (2.5 -> 3 Core)",
        "patientIdentity": "Extract Name, Age, Gender or report [UNKNOWN]",
        "findings": "Detail-heavy segmented audit. Quote the visual evidence from the extraction.",
        "abnormalMarkers": ["Key pathological findings"],
        "implications": "Differentiate pathologies based on synthesized morphological data.",
        "advice": "DO NOT include the title 'Neural Recovery Plan:'. Start directly with 1-2 professional opening sentences providing a clinical preamble based on the findings. Then, provide the structured clinical waitlist. IMPORTANT: EVERY points (1., 2., 3...) MUST start on its own line with explicit newlines (\n).",
        "riskLevel": "Low | Moderate | High | Critical"
      }

      RULES:
      - PRIORITIZE precision over narrative.
      - Output ONLY the JSON object.
    `;

    // ── Dual-Core Neural Dispatch ────────────────────────────────────────────
    console.log(`[Analyzer] Handing off to Dual-Stage Neural Pipeline...`);
    
    const processedFiles = [{
      buffer: req.file.buffer,
      mimeType: req.file.mimetype
    }];

    const { text: aiRawReply, generationTime, model } = await generateDualStageAnalysis(processedFiles, visionExtractionPrompt, pathologicalSynthesisPrompt);
    console.log(`[Analyzer] Dual-Stage Synchronization Complete. Total Time: ${generationTime}s`);

    let parsedResponse = {};
    try {
      // 3. FUZZY JSON PARSER: Strip tags, backticks, and noise
      let cleaned = aiRawReply || "";
      
      // Remove <think> tags or reasoning text (some models include this)
      cleaned = cleaned.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '');
      
      // Clean markdown and prefix text
      cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Robust JSON Extraction
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      try {
        parsedResponse = JSON.parse(cleaned);
      } catch (parseErr) {
        console.warn('[Analyzer] Native Parse Failed, attempting manual cleanup...');
        let heavilyCleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        parsedResponse = JSON.parse(heavilyCleaned);
      }

      // ── Recursive Sanitization ────────────────────────────────────────────
      const sanitize = (val) => {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          return Object.entries(val).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('; ');
        }
        if (Array.isArray(val)) {
          return val.map(item => (typeof item === 'object' ? JSON.stringify(item) : item));
        }
        if (typeof val === 'string') {
          return val.replace(/\*\*|\*/g, '').trim(); // Remove markdown bold/italics
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
      neuralPulse: { generationTime, model },
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
