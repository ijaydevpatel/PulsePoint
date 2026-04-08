import express from 'express';
import Profile from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Synchronize Biological Profile Data
 * Uses the Clerk Identity Hub to locate or initialize the clinical profile.
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    // Neural Link: Identify user via unique Identity String
    const user = await Profile.findOne({ user: req.auth.userId });
    
    if (!user) {
      console.log(`[Neural Link] Profile not initialized for Identity: ${req.auth.userId}`);
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

    // Pulse-Sync: Reconcile Identity with Clinical Profile repository
    const user = await Profile.findOneAndUpdate(
      { user: req.auth.userId },
      { 
        $set: {
          user: req.auth.userId, 
          fullName, 
          age, 
          gender, 
          height, 
          weight, 
          bloodGroup, 
          allergies, 
          conditions, 
          medications,
          bmi: parseFloat(bmiValue)
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
    const user = await Profile.findOne({ user: req.auth.userId });
    if (!user) return res.status(404).json({ message: 'Settings node unavailable.' });
    res.json(user.settings || { theme: 'dark', notificationsEnabled: true });
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

    const user = await Profile.findOneAndUpdate(
      { user: req.auth.userId },
      { $set: updateObj },
      { new: true }
    );
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ message: 'Setting modification failed.' });
  }
});

export default router;
