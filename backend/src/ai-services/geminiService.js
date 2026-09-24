import fetch from 'node-fetch';

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
  const synthesis = await generateGeminiAnalysis([], fullSynthesisPrompt, "Gemini 3 Flash");
  
  const totalTime = (Date.now() - startTime) / 1000;

  /*
   * Report both resolved model ids, not a nickname.
   *
   * This used to return the string "Dual-Core (2.5 -> 3)", which tells a
   * reader nothing checkable — the actual ids differ from the labels (Gemini 3
   * resolves to gemini-3-flash-preview on v1beta). Someone looking at a
   * clinical summary is entitled to know exactly which models produced it, and
   * the app surfaces this verbatim.
   */
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
 * Statuses worth trying again.
 *
 * 503 is Google's "this model is currently experiencing high demand", which is
 * a queueing problem rather than a fault in the request - the same call
 * succeeds moments later. 429 and the 5xx family behave the same way. Anything
 * else (400 bad request, 403 bad key, 404 no such model) will fail identically
 * however many times it is sent, so it is thrown immediately.
 */
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

/**
 * Attempts per model, and how long to wait between them.
 *
 * Four rather than three, with a longer tail, because there is deliberately no
 * substitute model to hand over to - see below. Roughly ten seconds of waiting
 * in the worst case, which sits comfortably inside the client's deadline.
 */
const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [1000, 3000, 6000];

/**
 * Empty on purpose.
 *
 * An earlier version of this fell back from gemini-3-flash-preview to
 * gemini-2.5-flash when the preview model stayed busy. That is the wrong
 * trade here: the pipeline is specified as 2.5 for extraction and 3 for
 * synthesis, the website states exactly that on screen, and quietly running
 * the synthesis on 2.5 would make the app disagree with the website about the
 * same document while both claimed the same pipeline.
 *
 * A 503 is transient, so retrying is the honest fix. If a substitute is ever
 * wanted, adding the mapping back here is all it takes - the loop below
 * already handles it, and the resolved id is returned so the app can say which
 * model actually produced the text.
 */
const FALLBACK_MODEL = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * PulsePoint Gemini Vision Core
 * Optimized for Gemini 2.5 (Fidelity) & 3 Flash (Speed/Preview)
 */
export const generateGeminiAnalysis = async (files, prompt, targetModel = "Gemini 2.5 Flash") => {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Keep the exact model versions the user specified, just format them so the API doesn't throw a 400 error.
  // E.g., "Gemini 2.5 Flash" -> "gemini-2.5-flash"
  let modelId = targetModel.toLowerCase().replace(/ /g, '-');
  
  // Gemini 3 Flash requires the "-preview" suffix in the v1beta API currently
  if (modelId === 'gemini-3-flash') {
    modelId = 'gemini-3-flash-preview';
  }

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

  /*
   * One attempt against one model. Returns the parsed text, or throws with the
   * status attached so the caller can tell a queueing problem from a fault.
   */
  const attempt = async (id) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${id}:generateContent?key=${apiKey}`, {
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
          temperature: 0.1, // Forced to 0.1 for MAXIMUM medical extraction precision.
          maxOutputTokens: 2048, // Capped to speed up generation limits
          topP: 0.8, // Reduced to eliminate hallucinations and ramblings (speeds up response)
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      let detail = 'Unknown clinical fault';
      try {
        const errorData = await response.json();
        detail = errorData.error?.message || detail;
      } catch {
        // An overloaded gateway sometimes answers with HTML rather than JSON.
      }
      const error = new Error(`Gemini API Error (${response.status}): ${detail}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("Gemini Vision core returned an empty diagnostic candidate. Check safety filters.");
    }

    return {
      text: data.candidates[0].content.parts[0].text,
      generationTime: (Date.now() - startTime) / 1000,
      model: id
    };
  };

  /*
   * Try the requested model a few times, then its stable fallback once.
   *
   * A 503 was being surfaced to the user as "the report could not be read",
   * which reads as a problem with their document. It is not: it means Google
   * queued the request away. Retrying is the entire fix, and a preview model
   * that stays busy hands over to a general-availability one rather than
   * failing the whole two-stage pipeline.
   */
  const candidates = [modelId];
  if (FALLBACK_MODEL[modelId]) candidates.push(FALLBACK_MODEL[modelId]);

  let lastError;
  for (let c = 0; c < candidates.length; c++) {
    const id = candidates[c];
    // Full run of attempts on the model asked for; one on the fallback.
    const attempts = c === 0 ? MAX_ATTEMPTS : 1;

    for (let i = 0; i < attempts; i++) {
      try {
        return await attempt(id);
      } catch (error) {
        lastError = error;

        const retryable = RETRYABLE_STATUS.has(error.status);
        if (!retryable) {
          console.error("[Gemini Technical Fault]:", error.message);
          throw error;
        }

        const more = i < attempts - 1 || c < candidates.length - 1;
        console.warn(`[Gemini] ${id} returned ${error.status}. ${more ? 'Retrying' : 'Giving up'}.`);
        if (i < attempts - 1) await sleep(BACKOFF_MS[i] ?? 3000);
      }
    }
  }

  console.error("[Gemini Technical Fault]:", lastError?.message);
  throw lastError;
};
