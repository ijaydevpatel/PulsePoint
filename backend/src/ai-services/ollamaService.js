import fetch from 'node-fetch';

export const callOllama = async (prompt, systemInstruction = '', model = process.env.OLLAMA_PRIMARY_MODEL) => {
  try {
    // Implement AbortController for strict timeout control
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s per model (DeepSeek/Qwen)

    const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        prompt,
        system: systemInstruction,
        stream: false,
        options: {
          temperature: 0.2,
        }
      })
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama Generation Failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama Service Error:', error.message);
    throw error;
  }
};
export const callOllamaStream = async (prompt, systemInstruction = '', model = process.env.OLLAMA_PRIMARY_MODEL, onChunk) => {
  try {
    const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        system: systemInstruction,
        stream: true,
        options: {
          temperature: 0.2,
          num_ctx: 4096,
        }
      })
    });

    if (!response.ok) throw new Error(`Ollama Stream Failed: ${response.statusText}`);

    // Read the stream
    return new Promise((resolve, reject) => {
      const reader = response.body;
      reader.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.response) onChunk(json.response);
            if (json.done) onChunk(null); // Signal end
          } catch (e) {}
        }
      });
      reader.on('error', reject);
      reader.on('end', resolve);
    });

  } catch (error) {
    console.error('Ollama Stream Error:', error.message);
    import('fs').then(fs => fs.appendFileSync('backend_errors.log', `[OllamaStream] ${error.message}\n`));
    throw error;
  }
};
