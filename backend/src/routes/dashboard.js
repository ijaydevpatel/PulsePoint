import express from 'express';
import Profile from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';
import { generateGroqIntelligence } from '../ai-services/groqService.js';

const router = express.Router();

router.get('/intel', requireAuth, async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const user = await Profile.findOne({ user: req.auth.userId }) || { fullName: "Active User", bmi: 0, conditions: [] };
    
    // 1. Fetch OSINT (Weather/AQI) - Static fallback
    let osint = { aqi: 38, uv: 5, humidity: 62, location: { lat: lat || 0, lon: lon || 0 }, locationName: "Neural Node Alpha" };

    const healthFoci = ['Biological Patterns', 'Metabolic Efficiency', 'Sleep Architecture', 'Nutritional Synergy', 'Clinical Trends', 'Systemic Vitality'];
    const selectedFocus = healthFoci[Math.floor(Math.random() * healthFoci.length)];
    const neuralPulseId = Date.now().toString(16);

    // Live Intelligence Briefing powered by Groq Qwen-3:32B
    console.log(`[Dashboard] Syncing with Groq Qwen-3 Intelligence (Pulse: ${neuralPulseId})...`);
    const prompt = `
      User Identity: ${user.fullName}
      Current Vitals: ${JSON.stringify({ bmi: user.bmi, conditions: user.conditions })}
      Environment: ${JSON.stringify(osint)}
      Neural Pulse: ${neuralPulseId}
      Priority Focus: ${selectedFocus}
      
      Generate a precise PulsePo!int clinical intelligence summary in STRICT JSON format. 
      CRITICAL: This content MUST be unique and significantly different from any previous sessions. 
      Focus specifically on the ${selectedFocus} aspect of the user's digital twin today.
      
      {
        "dailyTip": "One high-impact clinical tip (max 15 words) - must be totally unique.",
        "dailyStatus": "Optimal | Caution | Alert",
        "intelligenceBrief": "2 sentence status summary of their digital twin synchronization.",
        "digitalTwin": {
          "pattern": "Detected biological pattern name related to ${selectedFocus}",
          "riskTrend": "Stable | Rising | Falling",
          "medInsight": "Short medicine/supplement compatibility note."
        },
        "education": {
          "title": "One clinical concept title",
          "explanation": "Short medical explanation related to their vitals."
        },
        "environmentalAnalysis": "Analysis of AQI/UV/Humidity impact on their specific profile."
      }
      
      Output ONLY the JSON object. Accuracy must be 100% precision mode.
    `;

    const { text, generationTime, model } = await generateGroqIntelligence(prompt);
    
    // Fuzzy JSON Extraction to prevent "Neural intelligence extraction failed"
    let intel;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      intel = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[Dashboard Intel Parse Error]:', parseErr);
      throw new Error('Fuzzy extraction failure');
    }

    res.json({ intelligence: intel, osint, neuralPulse: { generationTime, model } });
  } catch (error) {
    console.error('[Dashboard Intel Error]:', error);
    res.status(500).json({ message: 'Neural intelligence extraction failed.' });
  }
});

export default router;
