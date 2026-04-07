import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

const listModels = async () => {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is missing in .env");
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("API ERROR:", data.error.message);
      return;
    }

    console.log("--- START OF SUPPORTED MODELS ---");
    if (data.models) {
      data.models.forEach(model => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log("No models found or different response structure.");
      console.log(JSON.stringify(data, null, 2));
    }
    console.log("--- END OF SUPPORTED MODELS ---");
  } catch (error) {
    console.error("FETCH ERROR:", error.message);
  }
};

listModels();
