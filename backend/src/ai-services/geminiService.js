import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Dual-Stage Diagnostic Engine
 * Primary: Gemini 2.5 Flash (Surgical Precision, 20 RPD)
 * Fallback: Gemini 1.5 Flash (High Capacity, 1500 RPD)
 * 
 * @param {Buffer|null} fileBuffer - PDF/Image buffer
 * @param {string} mimeType - MIME Type
 * @param {string} basePrompt - Instructions
 * @param {string} textContext - Pre-extracted text
 */
export const callGeminiVision = async (fileBuffer, mimeType, basePrompt = "", textContext = "") => {
  // Ordered by priority: Surgical (2.0), High Fidelity (1.5), High Capacity (1.5-8B)
  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.5-flash"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

      console.log(`[GeminiService] Attempting phase via [${modelName}]...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      });

      const finalPrompt = `
        ${basePrompt}
        
        [DOCUMENT CONTEXT]:
        ${textContext || "No text context. Analyze the visual multimodal input."}
        
        CRITICAL DIAGNOSTIC RULES:
        1. Classify the document under "documentType".
        2. In "findings", provide a deep surgical description (Morphology for images, Values for labs).
        3. In "abnormalMarkers", list specific concerning features or lab outliers as an array.
        4. In "implications", explain the clinical significance (e.g., "Highly suggestive of Molluscum contagiosum").
        5. In "advice", provide **ALLOPATHIC** and **HOMEOPATHIC** standard protocols for review.
        6. Return ONLY a raw JSON object string. NO MARKDOWN FENCES. 
        
        REQUIRED JSON SCHEMA:
        {
          "documentType": string,
          "findings": string,
          "abnormalMarkers": string[],
          "implications": string,
          "advice": string,
          "riskLevel": "Low" | "Moderate" | "High" | "Critical"
        }
      `;

      const parts = [finalPrompt];
      if (fileBuffer) {
        parts.push({
          inlineData: {
            data: fileBuffer.toString("base64"),
            mimeType
          }
        });
      }

      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) throw new Error("Empty response");

      console.log(`[GeminiService] Success via [${modelName}].`);
      return { text, modelName };

    } catch (error) {
      console.warn(`[GeminiService] ${modelName} failed: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error("Diagnostic Pipeline Exhausted");
};

/**
 * High-Reliability Text-Only Diagnostic Pipeline
 * Used as cloud fallback when local Ollama models are unavailable.
 * 
 * @param {string} prompt - User clinical input
 * @param {string} systemInstruction - Clinical constraints and JSON schema
 */
export const callGeminiText = async (prompt, systemInstruction = "") => {
  // gemini-2.0-flash is fastest & most available; gemini-1.5-flash is stable fallback
  const modelsToTry = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");

      console.log(`[GeminiService] Text-Only Attempt via [${modelName}]...`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction || undefined,
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) throw new Error("Empty response");

      console.log(`[GeminiService] ✅ Success via [${modelName}].`);
      return text;

    } catch (error) {
      console.warn(`[GeminiService] Text fallback ${modelName} failed: ${error.message}`);
      lastError = error;
    }
  }

  throw lastError || new Error("Text Diagnostic Pipeline Exhausted");
};
