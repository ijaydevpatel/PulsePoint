import fetch from 'node-fetch';
import { createCanvas, loadImage } from 'canvas';

/**
 * Unloads all models currently running in Ollama VRAM.
 * This is critical to free GPU memory before loading the vision model.
 */
const unloadAllModels = async (ollamaUrl) => {
  try {
    const psResponse = await fetch(`${ollamaUrl}/api/ps`);
    if (!psResponse.ok) return;
    const { models } = await psResponse.json();
    if (!models || models.length === 0) return;

    console.log(`[Vision] Unloading ${models.length} model(s) from VRAM to free space...`);

    await Promise.all(models.map(m =>
      fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m.name, keep_alive: 0 }),
        signal: AbortSignal.timeout(10000)
      }).catch(() => {})
    ));

    await new Promise(r => setTimeout(r, 2000));
    console.log('[Vision] VRAM cleared. Proceeding with vision inference...');
  } catch (e) {
    console.warn('[Vision] Could not unload models (non-fatal):', e.message);
  }
};

/**
 * Resizes an image buffer to a maximum dimension while maintaining aspect ratio.
 * This is critical for Llama 3.2 Vision (11B) to prevent VRAM overflow on high-res images.
 */
const optimizeImage = async (buffer) => {
  try {
    const img = await loadImage(buffer);
    const MAX_DIM = 1024; // Sweet spot for OCR vs Memory
    
    let width = img.width;
    let height = img.height;
    
    if (width > MAX_DIM || height > MAX_DIM) {
      if (width > height) {
        height *= MAX_DIM / width;
        width = MAX_DIM;
      } else {
        width *= MAX_DIM / height;
        height = MAX_DIM;
      }
    } else {
      return buffer; // No resize needed
    }

    console.log(`[Vision] Optimizing image resolution from ${img.width}x${img.height} to ${Math.round(width)}x${Math.round(height)}`);
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toBuffer('image/jpeg', { quality: 0.8 });
  } catch (e) {
    console.warn('[Vision] Image optimization failed (using original):', e.message);
    return buffer;
  }
};

/**
 * Unified Vision Service — High-fidelity multimodal inference via Ollama.
 * Automatically handles VRAM management and model loading.
 */
export const callVisionModel = async (imageBuffer, mimeType = 'image/png', prompt = '') => {
  try {
    const model = process.env.OLLAMA_VISION_MODEL || 'llama3.2-vision:latest';
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    console.log(`[Vision] Received request: ${mimeType}, Raw size: ${imageBuffer.length} bytes`);

    // Step 1: Managed VRAM
    console.log('[Vision] Step 1: Managing VRAM...');
    await unloadAllModels(ollamaUrl);

    // Step 2: Optimize Image (Downscale if needed)
    console.log('[Vision] Step 2: Optimizing image payload...');
    const optimizedBuffer = await optimizeImage(imageBuffer);
    console.log(`[Vision] Optimization complete. Final size: ${optimizedBuffer.length} bytes`);

    console.log('[Vision] Step 3: Encoding to Base64...');
    const base64Image = optimizedBuffer.toString('base64');

    const extractionPrompt = prompt ||
      'Describe this medical image in detail. If it is a report, extract all text, numbers, and values. ' +
      'If it is a physical symptom (like a rash, wound, or bite), describe its color, shape, size, texture, and location.' +
      'Provide a comprehensive structural summary.';

    console.log(`[Vision] Step 4: Sending request to Ollama: ${model}`);
    const startTime = Date.now();

    // moondream and older models often prefer /api/generate
    const isChatModel = model.includes('llama3.2');
    const endpoint = isChatModel ? '/api/chat' : '/api/generate';
    
    const requestBody = isChatModel ? {
      model,
      stream: false,
      keep_alive: 0,
      options: { temperature: 0, num_ctx: 1024, num_predict: 1024 },
      messages: [{ role: 'user', content: extractionPrompt, images: [base64Image] }]
    } : {
      model,
      prompt: extractionPrompt,
      images: [base64Image],
      stream: false,
      keep_alive: 0,
      options: { temperature: 0, num_ctx: 1024 }
    };

    const response = await fetch(`${ollamaUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(300000) // 5 minute timeout for moondream
    });

    console.log(`[Vision] Step 5: Ollama [${endpoint}] responded in ${((Date.now() - startTime) / 1000).toFixed(2)}s. Status: ${response.status}`);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Vision Inference Failed: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const extractedText = isChatModel ? data.message?.content : data.response;

    if (!extractedText || extractedText.trim().length < 5) {
      throw new Error('Vision model returned empty extraction');
    }

    console.log(`[Vision] Extraction successful. length: ${extractedText.length} chars`);
    return extractedText;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[Vision Service Error]: Request timed out (600s). Hardware likely cannot process 11B model.');
      throw new Error('Vision Engine Timeout: Your hardware is struggling to process the 11B model. Please try a smaller image.');
    }
    console.error('[Vision Service Error]:', error.stack || error.message);
    throw error;
  }
};
