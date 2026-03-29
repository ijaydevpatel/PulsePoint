import Profile from '../models/Profile.js';
import User from '../models/User.js';

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

      const updatedProfile = await profile.save();
      
      // Update global user state tracker
      await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });

      res.json(updatedProfile);
    } else {
      // Create new
      profile = await Profile.create({
        user: req.user._id,
        fullName, age, gender, height, weight, bmi: computedBmi,
        bloodGroup, allergies, conditions, medications, emergencyContact, location
      });

      await User.findByIdAndUpdate(req.user._id, { profileCompleted: true });

      res.status(201).json(profile);
    }
  } catch (error) {
    res.status(500).json({ message: 'Profile Mutation Fault', error: error.message });
  }
};
