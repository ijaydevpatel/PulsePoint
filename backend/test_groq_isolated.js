import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const test = async () => {
    const key = process.env.GROQ_API_KEY;
    console.log('Using Key:', key?.substring(0, 10), '...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3-32b',
        messages: [
          { role: 'system', content: 'Respond with JSON only: {"status": "ok"}' },
          { role: 'user', content: 'test' }
        ],
        temperature: 0
      })
    });

    const data = await response.json();
    console.log('Raw Data:', JSON.stringify(data));
};

test();
