import { callOllama, callOllamaStream } from '../ai-services/ollamaService.js';
import { callGeminiText } from '../ai-services/geminiService.js';
import { callGroq, callGroqStream } from '../ai-services/groqService.js';
export { callOllamaStream, callGroqStream };
import dotenv from 'dotenv';
dotenv.config();

/**
 * Deterministic AI Routing Orchestrator.
 * 
 * Model Strategy:
 *   - Clinical tools (Symptoms, Medicine, Chat): GROQ (Qwen2.5/Qwen3) -> LLAMA (Local Fallback)
 *   - Chat Streaming: GROQ Stream
 *   - Report/Document Analyzer: Gemini Vision (Multimodal)
 */
export const executeModelChain = async (taskType, prompt, systemInstruction) => {
  // Use Qwen-2.5-32b-distill (aliased as Qwen3 by user) for maximum reasoning/speed balance
  const primaryModel = 'qwen-2.5-32b-distill';

  switch (taskType) {

    case 'SYMPTOMS':
      try {
        console.log(`[Orchestrator] SYMPTOMS | Primary: Groq (${primaryModel})`);
        return await callGroq(prompt, systemInstruction, primaryModel);
      } catch (e) {
        console.warn(`[Orchestrator] Groq failed (${e.message}). Falling back to Local Qwen/DeepSeek...`);
        try {
          return await callOllama(prompt, systemInstruction, process.env.OLLAMA_PRIMARY_MODEL);
        } catch (ollamaErr) {
          return await callOllama(prompt, systemInstruction, process.env.OLLAMA_CHAT_MODEL);
        }
      }

    case 'MEDICINE_EXPLANATION':
      try {
        console.log(`[Orchestrator] MEDICINE | Primary: Groq (${primaryModel})`);
        return await callGroq(prompt, systemInstruction, primaryModel);
      } catch (e) {
        console.warn(`[Orchestrator] Groq failed (${e.message}). Falling back to local...`);
        try {
          return await callOllama(prompt, systemInstruction, process.env.OLLAMA_PRIMARY_MODEL);
        } catch (ollamaErr) {
          return await callOllama(prompt, systemInstruction, process.env.OLLAMA_CHAT_MODEL);
        }
      }

    case 'AI_DOCTOR':
      try {
        console.log(`[Orchestrator] AI_DOCTOR | Primary: Groq (${primaryModel})`);
        return await callGroq(prompt, systemInstruction, primaryModel);
      } catch (e) {
        console.warn(`[Orchestrator] Groq failed (${e.message}). Falling back to local...`);
        try {
          return await callOllama(prompt, systemInstruction, process.env.OLLAMA_PRIMARY_MODEL);
        } catch (ollamaErr) {
          return await callOllama(prompt, systemInstruction, process.env.OLLAMA_CHAT_MODEL);
        }
      }

    case 'DASHBOARD_INSIGHTS':
      try {
        return await callGroq(prompt, systemInstruction, primaryModel);
      } catch (e) {
        return await callOllama(prompt, systemInstruction, process.env.OLLAMA_PRIMARY_MODEL);
      }

    case 'MEDICAL_ANALYSIS':
      try {
        return await callGroq(prompt, systemInstruction, primaryModel);
      } catch (e) {
        return await callOllama(prompt, systemInstruction, process.env.OLLAMA_PRIMARY_MODEL);
      }

    case 'REPORT_ANALYSIS':
      // Gemini ONLY for the document/report analyzer tab
      console.log('[Orchestrator] REPORT_ANALYSIS | Gemini Vision');
      return await callGeminiText(prompt, systemInstruction);

    default:
      try {
        return await callGroq(prompt, systemInstruction, primaryModel);
      } catch (e) {
        return await callOllama(prompt, systemInstruction, process.env.OLLAMA_PRIMARY_MODEL);
      }
  }
};
