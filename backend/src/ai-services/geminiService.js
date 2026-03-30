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
  // Ordered by priority (High-Fidelity Clinical Engines)
  // Ordered by priority (High-Fidelity Clinical Engines)
  const modelsToTry = ["gemini-1.5-pro-latest", "gemini-2.0-flash", "gemini-1.5-flash-latest"];
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

      // If a specific basePrompt (like from reportController) is provided, 
      // we use it as the main instruction to avoid redundancy.
      const finalPrompt = basePrompt ? `
        ${basePrompt}
        
        [ADDITIONAL CONTEXT]:
        ${textContext ? `Extracted Text: ${textContext}` : "Analyze multimodal visual input."}
      ` : `
        Analyze the provided medical content.
        
        [DOCUMENT CONTEXT]:
        ${textContext || "Multimodal vision input."}
        
        REQUIRED JSON SCHEMA:
        {
          "documentType": string,
          "findings": string,
          "abnormalMarkers": string[],
          "implications": string,
          "advice": string,
          "riskLevel": "Low" | "Moderate" | "High" | "Critical"
        }
        OUTPUT ONLY RAW JSON.
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
