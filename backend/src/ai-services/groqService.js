import fetch from 'node-fetch';

/**
 * PulsePoint Conversational AI (Stage 3)
 *
 * GPT-OSS-120B, the same model the intelligence and symptom paths use.
 *
 * This was 20B, chosen for chat latency. That split meant the assistant
 * answering questions about a symptom was a weaker model than the one that
 * had just assessed it — so the two could disagree about the same case, and
 * the weaker answer was the one phrased conversationally enough to be
 * believed. One model across every clinical surface is worth the extra
 * latency on an LPU.
 *
 * No forced JSON here: this path is conversational guidance, not a structured
 * record.
 */
export const generateGroqChat = async (prompt, systemPrompt = "You are PulsePo!int's AI Doctor.") => {
  const startTime = Date.now();
  const apiKey = process.env.GROQ_API_KEY;
  const modelId = "openai/gpt-oss-120b";

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
 * Optimized for GPT-OSS-120B (High-Accuracy Clinical Intelligence on Groq LPU)
 */
export const generateGroqIntelligence = async (prompt, systemPrompt = "You are PulsePo!int's Clinical Intelligence Engine. Provide precise, medical-grade insights.") => {
  const startTime = Date.now();
  const apiKey = process.env.GROQ_API_KEY;
  const modelId = "openai/gpt-oss-120b"; // High-accuracy model for structured clinical JSON

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
        temperature: 1.0, // Clinical maximum for dynamic intelligence extraction
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

export const callGroq = async (prompt, systemPrompt, model = "openai/gpt-oss-120b", temperature = 1.0) => {
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

/**
 * Streaming chat completion.
 *
 * This function did not exist. chatController.streamMessage called it anyway,
 * so POST /api/chat/stream threw "callGroqStream is not defined" on every
 * request — the website's streaming chat could never have worked. The mobile
 * app uses /api/chat/message, which is why the fault went unnoticed.
 *
 * @param onChunk Called with each text delta, then once with null at the end
 *   of the stream. The null is the signal the controller already expects.
 */
export const callGroqStream = async (
  prompt,
  systemPrompt,
  onChunk,
  model = "openai/gpt-oss-120b",
  temperature = 0.7
) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY missing.");

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens: 1024,
      top_p: 1,
      stream: true
    })
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Groq stream failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  /*
   * SSE frames do not align with network chunks: a single read can end
   * mid-line, and one read can carry several events. The buffer below holds
   * the partial tail until the rest of its line arrives — without it, JSON.parse
   * fails intermittently on exactly the long replies this is for.
   */
  let buffer = '';

  const handleLine = (line) => {
    if (!line.startsWith('data:')) return false;
    const payload = line.slice(5).trim();
    if (payload === '[DONE]') return true;

    try {
      const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
      if (delta) onChunk(delta);
    } catch {
      // A frame we cannot parse is one frame of text, not a reason to kill
      // the stream the user is already reading.
    }
    return false;
  };

  const drain = (text) => {
    buffer += text;
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (handleLine(line.trim())) return true;
    }
    return false;
  };

  // node-fetch gives a Node stream; undici/native fetch gives a web stream.
  // Both appear depending on the runtime, so both are handled.
  if (typeof response.body?.getReader === 'function') {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (drain(decoder.decode(value, { stream: true }))) break;
    }
  } else {
    for await (const chunk of response.body) {
      if (drain(chunk.toString('utf8'))) break;
    }
  }

  onChunk(null);
};
