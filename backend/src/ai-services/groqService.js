import fetch from 'node-fetch';

/**
 * PulsePoint Conversational AI (Stage 3)
 * Optimized for Qwen-3:32B (Ultra-High Speed Chat)
 * No forced-JSON to ensure fluid, conversational clinical guidance.
 */
export const generateGroqChat = async (prompt, systemPrompt = "You are PulsePo!int's AI Doctor.") => {
  const startTime = Date.now();
  const apiKey = process.env.GROQ_API_KEY;
  const modelId = "qwen3-32b";

  if (!apiKey) throw new Error("GROQ_API_KEY missing.");

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7, // High-entropy for dynamic medical conversation
        max_tokens: 1024,
        top_p: 1,
        stream: false
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Groq Chat Failure: ${data.error.message}`);

    const generationTime = (Date.now() - startTime) / 1000;
    return {
      text: data.choices[0].message.content,
      generationTime,
      model: modelId
    };
  } catch (error) {
    console.error("[Groq Chat Fault]:", error.message);
    throw error;
  }
};

/**
 * PulsePoint Groq Intelligence Service
 * Optimized for Qwen-3:32B (Ultra-High Speed LPU)
 */
export const generateGroqIntelligence = async (prompt, systemPrompt = "You are PulsePo!int's Clinical Intelligence Engine. Provide precise, medical-grade insights.") => {
  const startTime = Date.now();
  const apiKey = process.env.GROQ_API_KEY;
  const modelId = "qwen3-32b"; // Updated to official Groq clinical ID

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from clinical environment.");
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1, // Fixed for high-precision diagnostic extraction
        response_format: { type: "json_object" }, // Required for Symptoms/Medicine
        max_tokens: 2048, // Increased for detailed diagnostic
        top_p: 1,
        stream: false
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("[Groq Service Error]:", data.error);
      throw new Error(`Groq Pulse Failure: ${data.error.message}`);
    }

    const generationTime = (Date.now() - startTime) / 1000;
    
    return {
      text: data.choices[0].message.content,
      generationTime,
      model: modelId
    };
  } catch (error) {
    console.error("[Groq Technical Fault]:", error.message);
    throw error;
  }
};

export const callGroq = async (prompt, systemPrompt, model = "qwen3-32b", temperature = 0.1) => {
  const startTime = Date.now();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing from clinical environment.");
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: temperature,
        response_format: { type: "json_object" },
        max_tokens: 2048,
        top_p: 1,
        stream: false
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Groq Pulse Failure: ${data.error.message}`);

    const generationTime = (Date.now() - startTime) / 1000;
    return data.choices[0].message.content;
  } catch (error) {
    console.error("[Groq Technical Fault]:", error.message);
    throw error;
  }
};
