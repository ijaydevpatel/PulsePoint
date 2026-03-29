import fetch from 'node-fetch';

/**
 * Groq LPU Inference Service
 * High-speed cloud alternative for local Ollama models.
 */
export const callGroq = async (prompt, systemInstruction = '', model = 'qwen/qwen3-32b', temperature = 0.2) => {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_placeholder') {
      throw new Error('Groq API Key missing or invalid in .env');
    }

    // Map common names to Groq-specific IDs
    let groqModelId = model;
    if (model.toLowerCase().includes('qwen')) groqModelId = 'qwen/qwen3-32b';

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
        temperature: temperature,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Groq API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('[GroqService] Raw API Response:', JSON.stringify(data).substring(0, 200));
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
  return new Promise(async (resolve, reject) => {
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

      // Node-Fetch v3 uses async iterator for body
      for await (const chunk of response.body) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') {
            if (trimmed === 'data: [DONE]') {
              onChunk(null);
              resolve();
            }
            continue;
          }
          
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const text = data.choices[0]?.delta?.content || '';
              if (text) onChunk(text);
            } catch (e) {
              // Partial JSON chunk, ignore or buffer if needed
            }
          }
        }
      }

      onChunk(null);
      resolve();

    } catch (error) {
      console.error('[GroqStream] Error:', error.message);
      onChunk(null);
      reject(error);
    }
  });
};
