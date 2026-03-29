import Profile from '../models/Profile.js';
import User from '../models/User.js';

// @desc    Calculate Health Score based on clinical markers
const calculateHealthScore = (profile) => {
  let score = 100;
  
  // BMI deviance from 22.5 (Optimal baseline)
  const bmiDiff = Math.abs((profile.bmi || 22.5) - 22.5);
  score -= Math.floor(bmiDiff * 2);
  
  // Conditions penalty
  score -= (profile.conditions?.length || 0) * 10;
  
  // Allergies penalty
  score -= (profile.allergies?.length || 0) * 2;
  
  return Math.max(10, Math.min(100, score));
};

// @desc    Calculate Streak based on temporal check-in gaps
const calculateStreak = (profile) => {
  const now = new Date();
  const last = new Date(profile.lastCheckIn || 0);
  
  const diffTime = Math.abs(now.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return profile.streak || 1; // Same day, maintain
  if (diffDays === 1) return (profile.streak || 0) + 1; // Consecutive day, increment
  return 1; // Gap detected or first time, reset to 1
};

// @desc    Get current user profile full biometric payload
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      res.json(profile);
    } else {
      // Return 200 with null instead of 404 to avoid frontend network fault markers
      res.json(null);
    }
  } catch (error) {
    res.status(500).json({ message: 'Profile Extraction Fault', error: error.message });
  }
};

// @desc    Create or Update user profile payload
// @route   POST /api/profile
// @access  Private
export const upsertProfile = async (req, res) => {
  try {
    const { 
      fullName, age, gender, height, weight, 
      bloodGroup, allergies, conditions, medications, 
      emergencyContact, location 
    } = req.body;

    // BMI dynamically computed server-side establishing strict clinical ground truth (weight kg / height m^2)
    const heightInMeters = height / 100;
    const computedBmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing
      profile.fullName = fullName || profile.fullName;
      profile.age = age || profile.age;
      profile.gender = gender || profile.gender;
      profile.height = height || profile.height;
      profile.weight = weight || profile.weight;
      profile.bmi = computedBmi;
      profile.bloodGroup = bloodGroup || profile.bloodGroup;
      profile.allergies = allergies || profile.allergies;
      profile.conditions = conditions || profile.conditions;
      profile.medications = medications || profile.medications;
      profile.emergencyContact = emergencyContact || profile.emergencyContact;
      profile.location = location || profile.location;

      // Update Health Metadata (March 29 Extension)
      profile.healthScore = calculateHealthScore(profile);
      profile.streak = calculateStreak(profile);
      profile.lastCheckIn = new Date();

      const updatedProfile = await profile.save();
      
      // Update global user state tracker
      await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });

      res.json(updatedProfile);
    } else {
      // Create new
      profile = new Profile({
        user: req.user._id,
        fullName, age, gender, height, weight, bmi: computedBmi,
        bloodGroup, allergies, conditions, medications, emergencyContact, location,
        streak: 1,
        lastCheckIn: new Date()
      });
      
      profile.healthScore = calculateHealthScore(profile);
      await profile.save();

      await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });

      res.status(201).json(profile);
    }
  } catch (error) {
    res.status(500).json({ message: 'Profile Mutation Fault', error: error.message });
  }
};
