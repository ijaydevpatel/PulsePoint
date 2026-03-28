import { callGeminiVision } from './geminiService.js';

/**
 * PulsePoint Multimodal Vision Service
 * Migrated to Google Gemini for production-grade clinical analysis.
 * All local Ollama references have been purged per user hardening request.
 */
export const callVisionModel = async (imageBuffer, mimeType = 'image/png', prompt = '') => {
  try {
    console.log(`[VisionService] Processing multimodal request | MIME: ${mimeType}`);
    
    // Default medical extraction prompt if none provided
    const extractionPrompt = prompt || 
      'Describe this medical image in detail. If it is a report, extract all text and values. ' +
      'If it is a physical symptom, describe morphology (color, shape, size). ' +
      'Respond with clinical observations only.';

    // Gemini handles the vision analysis directly
    const result = await callGeminiVision(imageBuffer, mimeType, extractionPrompt);
    
    return result.text;
  } catch (error) {
    console.error('[VisionService] Neural Processing Error:', error.message);
    throw new Error('Vision Engine Processing Fault: Unable to analyze multimodal payload.');
  }
};
