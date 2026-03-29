import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function testGroqModel() {
  const model = 'llama-3.3-70b-versatile';
  console.log(`Testing Groq Connectivity for model: ${model}...`);
  
  if (!process.env.GROQ_API_KEY) {
    console.error("Missing GROQ_API_KEY");
    return;
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      console.log(`✅ SUCCESS: Model ${model} is functional.`);
    } else {
      const error = await response.json();
      console.error(`❌ FAILED: ${error.error?.message || response.statusText}`);
    }
  } catch (e) {
    console.error("Connection Error:", e.message);
  }
}

testGroqModel();
