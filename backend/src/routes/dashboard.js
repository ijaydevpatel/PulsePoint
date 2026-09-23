import express from 'express';
import Profile from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';
import { generateGroqIntelligence } from '../ai-services/groqService.js';

const router = express.Router();

/** How many previously-shown tips to withhold from the model. */
const TIP_MEMORY = 20;

/**
 * GET /api/dashboard/intel
 *
 * The daily clinical tip and digital-twin summary, from GPT-OSS-120B on Groq.
 *
 * ── On freshness ─────────────────────────────────────────────────────────────
 *
 * This used to serve a cached result for thirty minutes with no way to opt out,
 * so opening the app twice in an afternoon showed the same sentence — the tip
 * read as static furniture rather than as something generated for you.
 *
 * `?fresh=1` skips the cache read. The cache is still *written*, so other
 * surfaces and rapid re-renders stay cheap, and a generation failure can still
 * fall back to the last good value rather than showing nothing.
 *
 * ── On repetition ────────────────────────────────────────────────────────────
 *
 * Freshness alone is not enough. The profile the model reasons from does not
 * change between requests, so asking again mostly returns the same advice in
 * new words — omega-3, hydration, sleep hygiene, round and round. The last 20
 * tips are passed back as an explicit do-not-repeat list, the same technique
 * the chat greeting already uses. `recentTips` has been on the Profile schema
 * all along and was never written to.
 *
 * ── On what is no longer asked for ───────────────────────────────────────────
 *
 * The `education` block is gone. It fed the "Intelligence Briefing" card,
 * which the app does not show — generating it cost tokens and latency on every
 * request for output nobody read.
 */
router.get('/intel', requireAuth, async (req, res) => {
  const wantsFresh = req.query.fresh === '1' || req.query.fresh === 'true';

  try {
    const user = await Profile.findOne({ user: req.auth.userId })
      || { fullName: 'Active User', bmi: 0, conditions: [], recentTips: [] };

    /*
     * Environment is not measured here.
     *
     * These three values are fixed and always have been. They are kept only so
     * the model has something concrete to write its environmental note
     * against; they are NOT returned as readings any more, because the mobile
     * app fetches real conditions for the device's own coordinates and
     * rendering a constant beside those would be indistinguishable from a
     * measurement. See conditionsService.ts on the client.
     */
    const assumedEnvironment = { aqi: 38, uv: 5, humidity: 62 };

    const now = new Date();
    const staleThreshold = 30 * 60 * 1000;
    const cacheIsWarm = user.cachedIntelligence
      && user.lastIntelUpdate
      && (now - new Date(user.lastIntelUpdate) < staleThreshold);

    if (!wantsFresh && cacheIsWarm) {
      return res.json({
        intelligence: user.cachedIntelligence,
        neuralPulse: { generationTime: 0, model: 'cache' },
      });
    }

    const recentTips = Array.isArray(user.recentTips) ? user.recentTips.slice(-TIP_MEMORY) : [];
    const antiRepeat = recentTips.length > 0
      ? `\nTIPS ALREADY SHOWN TO THIS USER — do not repeat any of these, not even reworded:\n${recentTips.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n`
      : '';

    const healthFoci = [
      'hydration and kidney function', 'sleep architecture', 'metabolic efficiency',
      'cardiovascular conditioning', 'micronutrient balance', 'gut and digestion',
      'musculoskeletal load', 'stress and cortisol rhythm', 'respiratory capacity',
      'skin and barrier health',
    ];
    const focus = healthFoci[Math.floor(Math.random() * healthFoci.length)];

    const prompt = `
User: ${user.fullName}
Vitals: ${JSON.stringify({ bmi: user.bmi, conditions: user.conditions })}
Assumed environment: ${JSON.stringify(assumedEnvironment)}
Focus this response on: ${focus}
${antiRepeat}
Generate a PulsePoint clinical intelligence summary as STRICT JSON.

{
  "dailyTip": "One genuinely useful, specific piece of health guidance, max 18 words. It must be actionable today and must not repeat anything in the list above. Avoid generic advice like 'drink more water' or 'get enough sleep' unless you can make it specific and concrete.",
  "dailyStatus": "Optimal | Caution | Alert",
  "intelligenceBrief": "Two sentences explaining why this tip suits this person's vitals.",
  "digitalTwin": {
    "pattern": "Short name for the biological pattern their vitals suggest, related to ${focus}",
    "riskTrend": "Stable | Rising | Falling",
    "medInsight": "One short, concrete note on medicine or supplement compatibility."
  },
  "environmentalAnalysis": "One or two sentences on how the environment above affects this specific profile."
}

RULES:
- Ground every claim in the vitals given. Do not invent measurements.
- Never state or imply a diagnosis.
- Output ONLY the JSON object.
`;

    const { text, generationTime, model } = await generateGroqIntelligence(prompt);

    let intel;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      intel = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (parseErr) {
      console.error('[Dashboard] Intel parse failure:', parseErr.message);

      /*
       * A malformed generation is not worth a 500 when a good one is on file.
       * The client cannot tell the difference and the person sees their last
       * valid tip rather than an error.
       */
      if (user.cachedIntelligence) {
        return res.json({
          intelligence: user.cachedIntelligence,
          neuralPulse: { generationTime: 0, model: 'cache (regeneration failed)' },
        });
      }
      throw new Error('Intelligence could not be parsed.');
    }

    // Persist the tip into the do-not-repeat buffer alongside the cache.
    const tip = typeof intel?.dailyTip === 'string' ? intel.dailyTip.trim() : '';
    await Profile.findOneAndUpdate(
      { user: req.auth.userId },
      {
        cachedIntelligence: intel,
        lastIntelUpdate: new Date(),
        ...(tip ? { recentTips: [...recentTips, tip].slice(-TIP_MEMORY) } : {}),
      },
    );

    res.json({ intelligence: intel, neuralPulse: { generationTime, model } });
  } catch (error) {
    console.error('[Dashboard] Intel error:', error.message);
    res.status(500).json({ message: 'Could not generate your briefing just now.' });
  }
});

export default router;
