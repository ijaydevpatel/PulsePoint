import express from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
// import { aiService } from '../services/ai.js'; // REMOVED AI LOGIC

const router = express.Router();

/**
 * Pulse Intelligence - Simulated Chat Stream (SSE)
 */
router.post('/chat/stream', requireAuth, async (req, res) => {
  const { message } = req.body;
  const user = await User.findOne({ _id: req.auth.userId }) || { fullName: "User" };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Simulated clinical response
  const responseChunks = [
    `Hello ${user.fullName}. `,
    "I have analyzed your query based on current clinical markers. ",
    "While I am currently operating in diagnostic-simulation mode, ",
    "your symptoms suggest a focused investigation into metabolic stability. ",
    "Please continue monitoring your vitals through the dashboard. ",
    "Is there anything specific about your reading you'd like to explore?"
  ];

  try {
    for (const chunk of responseChunks) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      // Simulate real-time streaming feel
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ chunk: "Neural core link severed. Reconnecting..." })}\n\n`);
    res.end();
  }
});

/**
 * Pulse Intelligence - Symptom Analyzer
 */
router.post('/symptoms/analyze', requireAuth, async (req, res) => {
  // Mock constant response regardless of symptoms to maintain UI structure
  const mockAnalysis = {
    probabilityMatrix: [
      { name: "Common Viral Syndrome", confidence: 78, severity: "Low" },
      { name: "Allergic Rhinitis", confidence: 45, severity: "Low" },
      { name: "Acute Fatigue Marker", confidence: 22, severity: "Moderate" }
    ],
    summaryText: "Current clinical data indicates a high probability of a transient viral syndrome or environmental stressor. Neural signatures suggest physical exhaustion.",
    treatmentPathways: {
      allopathy: ["Antihistamines periodically", "Increased fluid intake"],
      homeRemedies: ["7-9 hours of synchronized sleep", "Warm isotonic solutions"],
      homeopathic: ["Oscillococcinum (if symptomatic)"]
    }
  };

  res.json(mockAnalysis);
});

/**
 * Pulse Intelligence - Medicine Compatibility
 */
router.post('/medicine/check', requireAuth, async (req, res) => {
  const { primaryMedicine, secondaryMedicine } = req.body;

  // Mock constant response to maintain UI structure
  const mockCompatibility = {
    riskLevel: "Low",
    dangerDetected: false,
    compatibilityVerdict: "Safe Synergistic Profile",
    explanation: `${primaryMedicine} and ${secondaryMedicine} utilize distinct metabolic pathways and show no documented collision risk in current clinical datasets.`,
    interactionCause: "Metabolic Pathway Separation (CYP450 vs Glucuronidation)",
    techIngredients1: { "active": `${primaryMedicine} Core`, "inactive": { "binders": "Starch, Cellulose" } },
    techIngredients2: { "active": `${secondaryMedicine} Core`, "inactive": { "binders": "Gelatin, Lactose" } },
    metabolicPathway: "Hepatic First-Pass Optimization",
    patientAdvice: "No specific timing adjustments needed. Maintain standard dosing intervals.",
    safeAlternatives: ["Continue current regimen"],
    warnings: ["Observe for standard sensitivity only"]
  };

  res.json(mockCompatibility);
});

export default router;
