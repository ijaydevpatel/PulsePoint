import express from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Synchronize Biological Profile Data
 * Uses the Clerk Identity Hub to locate or initialize the clinical profile.
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    // Neural Link: Identify user via Clerk ID
    const user = await User.findOne({ clerkId: req.auth.userId });
    
    if (!user) {
      console.log(`[Neural Link] Profile not initialized for Clerk ID: ${req.auth.userId}`);
      return res.status(404).json({ message: 'Neural profile not initialized.' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('[Profile Extraction Fault]:', error);
    res.status(500).json({ message: 'Profile extraction fault.' });
  }
});

/**
 * Update/Upsert Clinical Metrics
 * Automatically synchronizes Clerk Identity with MongoDB Clinical Repository.
 */
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { 
      fullName, 
      email, // Optional: Injected from Clerk frontend normally
      age, 
      gender, 
      height, 
      weight, 
      bloodGroup, 
      allergies, 
      conditions, 
      medications 
    } = req.body;

    // Calculate BMI for digital twin metrics
    const heightInMeters = height / 100;
    const bmiValue = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(1) : 0;

    // Pulse-Sync: Reconcile Clerk Identity with Clinical Data
    const user = await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      { 
        $set: {
          clerkId: req.auth.userId, // Explicitly set for upsert
          fullName, 
          age, 
          gender, 
          height, 
          weight, 
          bloodGroup, 
          allergies, 
          conditions, 
          medications,
          bmi: parseFloat(bmiValue),
          lastActive: Date.now()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    res.json(user);
  } catch (error) {
    console.error('[Neural Synchronization Error]:', error);
    res.status(500).json({ message: 'Neural synchronization error.' });
  }
});

/**
 * Settings Neural Configuration
 */
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.userId });
    if (!user) return res.status(404).json({ message: 'Settings node unavailable.' });
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: 'Neural configuration error.' });
  }
});

router.put('/settings', requireAuth, async (req, res) => {
  try {
    const updateObj = {};
    Object.keys(req.body).forEach(key => {
      updateObj[`settings.${key}`] = req.body[key];
    });

    const user = await User.findOneAndUpdate(
      { clerkId: req.auth.userId },
      { $set: updateObj },
      { new: true }
    );
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: 'Setting modification failed.' });
  }
});

export default router;
