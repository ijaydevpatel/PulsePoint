import { createRequire } from 'module';
import { callGeminiVision } from './geminiService.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/**
 * PulsePo!int Document Processor
 * Routes to local Fast-Extraction or Cloud High-Fidelity Gemini
 */
export const extractDocumentContent = async (fileBuffer, mimeType) => {
  // ── Digital PDF Strategy (Fast & Free) ───────────────────────────────────
  if (mimeType === 'application/pdf') {
    try {
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData.text?.trim();

      if (text && text.length > 200) {
        console.log(`[Document] Digital PDF Extraction: ${text.length} chars.`);
        const { text: analysis, modelName } = await callGeminiVision(null, 'text/plain', 'Perform clinical analysis.', text);
        return { text: analysis, method: 'pdf-text-gemini', modelName };
      }
    } catch (err) {
      console.warn('[Document] Local Parse Failed. Falling back to Gemini Vision.');
    }
    
    // Scanned PDF Strategy
    const { text: visionAnalysis, modelName } = await callGeminiVision(fileBuffer, mimeType, 'Analyze scanned PDF.');
    return { text: visionAnalysis, method: 'gemini-vision-pdf', modelName };
  }

  // ── Image Strategy (Multimodal) ──────────────────────────────────────────
  if (mimeType.startsWith('image/')) {
    const { text: analysis, modelName } = await callGeminiVision(fileBuffer, mimeType, 'Analyze medical image.');
    return { text: analysis, method: 'gemini-vision-image', modelName };
  }

  throw new Error(`Unsupported type: ${mimeType}`);
};
