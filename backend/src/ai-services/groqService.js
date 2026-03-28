import fetch from 'node-fetch';

/**
 * Groq LPU Inference Service
 * High-speed cloud alternative for local Ollama models.
 */
export const callGroq = async (prompt, systemInstruction = '', model = 'qwen/qwen3-32b') => {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_placeholder') {
      throw new Error('Groq API Key missing or invalid in .env');
    }

    // Map common names to Groq-specific IDs
    let groqModelId = model;
    if (model.toLowerCase().includes('qwen')) groqModelId = 'qwen/qwen3-32b';
    if (model.toLowerCase().includes('deepseek')) groqModelId = 'deepseek-r1-distill-llama-70b';

    console.log(`[GroqService] Calling Cloud LPU | Model: ${groqModelId}`);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: groqModelId,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('[GroqService] Error:', error.message);
    throw error;
  }
};

/**
 * Groq LPU Streaming Service
 */
export const callGroqStream = async (prompt, systemInstruction = '', model = 'qwen/qwen3-32b', onChunk) => {
  try {
    if (!process.env.GROQ_API_KEY) throw new Error('Groq API Key missing');

    let groqModelId = model;
    if (model.toLowerCase().includes('qwen')) groqModelId = 'qwen/qwen3-32b';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: groqModelId,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        stream: true,
        temperature: 0.5
      })
    });

    if (!response.ok) throw new Error(`Groq Stream Error: ${response.statusText}`);

    // Standard ReadableStream consumption
    const reader = response.body;
    let buffer = '';

    reader.on('data', (chunk) => {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.trim() === 'data: [DONE]') {
          onChunk(null);
          return;
        }
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.choices[0]?.delta?.content || '';
            if (text) onChunk(text);
          } catch (e) {
            // Partial chunk
          }
        }
      }
    });

  } catch (error) {
    console.error('[GroqStream] Error:', error.message);
    onChunk(null);
  }
};
