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
export const executeModelChain = async (taskType, prompt, systemInstruction, options = {}) => {
  // Default to Qwen 3-32B or use specifically requested model (e.g. Llama 70B for high-fidelity extraction)
  const primaryModel = options.model || 'qwen/qwen3-32b';
  const temperature = options.temperature || 0.2;

  console.log(`[Orchestrator] Task: ${taskType} | Engine: Groq | Model: ${primaryModel} | Temp: ${temperature}`);

  switch (taskType) {
    case 'REPORT_ANALYSIS':
      return await callGeminiText(prompt, systemInstruction);

    default:
      // All other tasks use Groq
      try {
        return await callGroq(prompt, systemInstruction, primaryModel, temperature);
      } catch (e) {
        console.error(`[Orchestrator] Neural Engine Error: ${e.message}`);
        throw e; // No fallbacks allowed per user instruction
      }
  }
};
