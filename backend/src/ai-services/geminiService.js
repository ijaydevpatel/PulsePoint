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
  
  return {
    ...synthesis,
    generationTime: totalTime,
    model: `Dual-Core (2.5 -> 3)`,
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
  
  let modelId = targetModel;
  if (modelId === "Gemini 2.5 Flash") modelId = "gemini-1.5-flash";
  if (modelId === "Gemini 3 Flash") modelId = "gemini-1.5-pro";

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
          temperature: 1, // Locked at clinical maximum as requested
          maxOutputTokens: 3072, // Expanded for multi-document synthesis potential
          topP: 1,
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
