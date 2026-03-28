import { callGeminiText } from '../ai-services/geminiService.js';
import { callGroq, callGroqStream } from '../ai-services/groqService.js';
import dotenv from 'dotenv';

dotenv.config();

export { callGroqStream };

/**
 * Deterministic AI Routing Orchestrator.
 * 
 * STRICT ARCHITECTURE:
 *   - Clinical tools (Symptoms, Medicine, Chat): GROQ (Qwen 3-32B)
 *   - Chat Streaming: GROQ Stream
 *   - Report/Document Analyzer: Gemini Vision (Multimodal)
 */
export const executeModelChain = async (taskType, prompt, systemInstruction) => {
  // Use Qwen 3-32B (Groq Model ID: qwen/qwen3-32b)
  const primaryModel = 'qwen/qwen3-32b';

  console.log(`[Orchestrator] Task: ${taskType} | Engine: ${taskType === 'REPORT_ANALYSIS' ? 'Gemini' : 'Groq'}`);

  switch (taskType) {
    case 'REPORT_ANALYSIS':
      return await callGeminiText(prompt, systemInstruction);

    default:
      // All other tasks (SYMPTOMS, MEDICINE, AI_DOCTOR, etc.) use Groq (Qwen)
      try {
        return await callGroq(prompt, systemInstruction, primaryModel);
      } catch (e) {
        console.error(`[Orchestrator] Neural Engine Error: ${e.message}`);
        throw e; // No fallbacks allowed per user instruction
      }
  }
};
