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
   * resolves to a dated GA release, see the mapping below). Someone looking at a
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
 * PulsePoint Gemini Vision Core
 * Optimized for Gemini 2.5 (Fidelity) & 3 Flash (Speed/Preview)
 */
export const generateGeminiAnalysis = async (files, prompt, targetModel = "Gemini 2.5 Flash") => {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  
  // Keep the exact model versions the user specified, just format them so the API doesn't throw a 400 error.
  // E.g., "Gemini 2.5 Flash" -> "gemini-2.5-flash"
  let modelId = targetModel.toLowerCase().replace(/ /g, '-');
  
  /*
   * Gemini 3 Flash, resolved to a generally-available release.
   *
   * This used to resolve to 'gemini-3-flash-preview', which was correct when
   * it was written and is not any more. Preview endpoints run on a small pool,
   * and once the GA releases shipped (3.7 Flash on 13 Aug 2026, 3.8 Flash on
   * 2 Sep) that pool stopped being fed - so the id kept resolving, kept being
   * accepted, and answered 503 "this model is currently experiencing high
   * demand" more or less permanently. It looked like an outage because the
   * same call genuinely used to work.
   *
   * 3.7 rather than 3.8 on purpose: it has been GA about a month longer, and a
   * freshly released model is where the capacity pressure moves next. This is
   * still Gemini 3 doing the synthesis, which is the pipeline as specified.
   *
   * If this needs changing again, it is this one line.
   */
  if (modelId === 'gemini-3-flash') {
    modelId = 'gemini-3.7-flash';
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

  try {
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
          temperature: 0.1, // Forced to 0.1 for MAXIMUM medical extraction precision.
          maxOutputTokens: 2048, // Capped to speed up generation limits
          topP: 0.8, // Reduced to eliminate hallucinations and ramblings (speeds up response)
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error (${response.status}): ${errorData.error?.message || 'Unknown clinical fault'}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("Gemini Vision core returned an empty diagnostic candidate. Check safety filters.");
    }
    
    const generationTime = (Date.now() - startTime) / 1000;
    
    return {
      text: data.candidates[0].content.parts[0].text,
      generationTime,
      model: modelId
    };
  } catch (error) {
    console.error("[Gemini Technical Fault]:", error.message);
    throw error;
  }
};
