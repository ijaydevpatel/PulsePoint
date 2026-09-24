import fetch from 'node-fetch';
import { generateGroqIntelligence } from './groqService.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * PulsePoint Dual-Stage Vision Synthesis
 * Stage 1: Gemini 2.5 Flash (Clinical Extraction)
 * Stage 2: Gemini 3 Flash (Pathological Synthesis)
 */
export const generateDualStageAnalysis = async (files, visionPrompt, synthesisPrompt) => {
  const startTime = Date.now();
  
  // STAGE 1: Clinical Extraction (High Fidelity Vision)
  console.log(`[Neural Pipeline] Starting Stage 1: Clinical Extraction (Gemini 2.5)...`);
  const extraction = await generateGeminiAnalysis(files, visionPrompt, "Gemini 2.5 Flash");
  
  // STAGE 2: Pathological Synthesis (Advanced Reasoning)
  console.log(`[Neural Pipeline] Starting Stage 2: Pathological Synthesis (Gemini 3)...`);
  const fullSynthesisPrompt = `${synthesisPrompt}\n\n[EXTRACTED CLINICAL DATA FROM STAGE 1]:\n${extraction.text}`;
  
  // Call Gemini 3 for final synthesis (no files needed, pure reasoning)
  let synthesis;
  try {
    synthesis = await generateGeminiAnalysis([], fullSynthesisPrompt, "Gemini 3 Flash");
  } catch (err) {
    console.warn(`[Neural Pipeline] Stage 2 Gemini models unavailable (${err.message}). Engaging Groq Intelligence fallback...`);
    synthesis = await generateGroqIntelligence(fullSynthesisPrompt);
  }
  
  const totalTime = (Date.now() - startTime) / 1000;

  return {
    ...synthesis,
    generationTime: totalTime,
    model: `${extraction.model} → ${synthesis.model}`,
    stages: [
      { stage: 'extraction', model: extraction.model, seconds: extraction.generationTime },
      { stage: 'synthesis', model: synthesis.model, seconds: synthesis.generationTime }
    ],
    intermediate: extraction.text
  };
};

/**
 * PulsePoint Gemini Vision Core
 * Optimized for Gemini 2.5 (Fidelity) & 3 Flash (Speed/Preview) with high-demand fallbacks & retries
 */
export const generateGeminiAnalysis = async (files, prompt, targetModel = "Gemini 2.5 Flash") => {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from clinical environment.");
  }

  // Pre-process files into Gemini's multi-part format
  const fileParts = (files || []).map(f => ({
    inline_data: {
      mime_type: f.mimeType,
      data: f.buffer.toString('base64')
    }
  }));

  let requestedId = targetModel.toLowerCase().replace(/ /g, '-');
  if (requestedId === 'gemini-3-flash') {
    requestedId = 'gemini-3.7-flash';
  }

  /*
   * Candidates, per stage, and no wider.
   *
   * Stage 1 is vision extraction and runs on Gemini 2.5 Flash alone. Letting
   * it fall through to a Gemini 3 model was not a safety net: it changed which
   * model read the document without saying so, and every extra attempt
   * re-uploads the whole file as base64, which is what made a multi-page PDF
   * take minutes and time the app out.
   *
   * Stage 2 is synthesis over text that has already been extracted, so it is
   * cheap to retry and genuinely worth a fallback: 3.7, then 3.5, then Groq
   * below when both are busy.
   */
  const isSynthesis = requestedId.includes('3');
  const candidateModels = isSynthesis
    ? ['gemini-3.7-flash', 'gemini-3.5-flash']
    : ['gemini-2.5-flash'];

  let lastError = null;

  for (const modelId of candidateModels) {
    /*
     * One attempt per model.
     *
     * The second attempt was a retry against the same busy model a second
     * later, which a 503 almost never clears in - it doubled the cost of a
     * bad run for close to no chance of success. Moving to the next candidate
     * is the faster and more likely recovery, and that is what happens now.
     */
    /*
     * Runs once, and the loop is deliberate rather than leftover: the `break`
     * statements below mean "give up on this model and try the next one". As
     * a bare block they would break the outer loop instead and silently end
     * the fallback chain after the first failure.
     */
    for (let attempt = 1; attempt <= 1; attempt++) {
      try {
        console.log(`[Gemini Core] Requesting model '${modelId}'...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  ...fileParts
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
              topP: 0.8,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.status === 503 || response.status === 429 || response.status >= 500) {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData.error?.message || `HTTP ${response.status} High Demand/Server Error`;
          lastError = new Error(`Gemini API Error (${response.status}): ${errMsg}`);
          console.warn(`[Gemini Core] Model '${modelId}' returned ${response.status}: ${errMsg}`);
          
          // Straight to the next candidate: a model that is busy now is
          // very unlikely to be free a second later.
          break;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errMsg = errorData.error?.message || 'Unknown clinical fault';
          lastError = new Error(`Gemini API Error (${response.status}): ${errMsg}`);
          console.warn(`[Gemini Core] Model '${modelId}' failed with status ${response.status}: ${errMsg}`);
          break; // Try next fallback model
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
          lastError = new Error("Gemini Vision core returned an empty diagnostic candidate. Check safety filters.");
          console.warn(`[Gemini Core] Model '${modelId}' returned empty candidate.`);
          break;
        }
        
        const generationTime = (Date.now() - startTime) / 1000;
        console.log(`[Gemini Core] Model '${modelId}' succeeded in ${generationTime}s`);
        
        return {
          text: data.candidates[0].content.parts[0].text,
          generationTime,
          model: modelId
        };
      } catch (err) {
        lastError = err;
        console.error(`[Gemini Core] Technical Fault on model '${modelId}':`, err.message);
      }
    }
  }

  // If all Gemini vision/synthesis candidates fail
  if ((!files || files.length === 0)) {
    console.warn(`[Gemini Core] All Gemini models exhausted for synthesis. Attempting Groq fallback...`);
    return await generateGroqIntelligence(prompt);
  }

  throw lastError || new Error("All Gemini Vision models are currently experiencing high demand. Please try again in a few moments.");
};

