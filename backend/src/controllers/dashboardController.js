import { executeModelChain } from '../model-router/orchestrator.js';
import Profile from '../models/Profile.js';
import Notification from '../models/Notification.js';

// @desc    Assemble comprehensive Dashboard Analytics Data payloads
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: 'Unverified Profile Integration Block.' });

    // Fetch real trajectory (Placeholder until new biometric tracking source is implemented)
    const trajectoryData = [
      { day: 'Mon', risk: 10 },
      { day: 'Tue', risk: 15 },
      { day: 'Wed', risk: 8 },
      { day: 'Thu', risk: 12 },
      { day: 'Fri', risk: 20 },
      { day: 'Sat', risk: 14 },
      { day: 'Today', risk: 18 }
    ];

    // Generate Dynamic Prompting based exclusively on Profile state mapping fast-inference Latency targets
    const systemInstruction = `You are a clinical intelligence summarizer reporting directly to the patient's dashboard widget. Keep your responses under 3 sentences. Generate a quick, encouraging, yet analytical health summary based exclusively on this profile context: Age ${profile.age}, Gender ${profile.gender}, BMI ${profile.bmi}, existing conditions: ${profile.conditions.join(', ')}.`;
    const promptText = `Generate a very quick dashboard health summary overview for the user named ${profile.fullName}.`;

    const dynamicInsight = await executeModelChain('DASHBOARD_INSIGHTS', promptText, systemInstruction);

    // Fetch real notifications for alerts widget
    const recentAlerts = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt read type');

    res.json({
      fullName: profile.fullName,
      computedBmi: profile.bmi,
      clinicalScore: profile.bmi > 0 ? (100 - profile.bmi) : 85, // Profile-based fallback
      trajectory: trajectoryData,
      aiInsight: dynamicInsight,
      activeConditions: profile.conditions.length,
      activeMedications: profile.medications.length,
      recentAlerts: recentAlerts.map(a => ({
        id: a._id,
        title: a.title,
        time: a.createdAt,
        unread: !a.read,
        type: a.type
      }))
    });

  } catch (error) {
    res.status(500).json({ message: 'Dashboard Scaffolding Fault', error: error.message });
  }
};
