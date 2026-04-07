import Settings from '../models/Settings.js';
import User from '../models/User.js';

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.auth.userId });
    
    // Auto-create default settings if none exist
    if (!settings) {
      settings = await Settings.create({ user: req.auth.userId });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed fetching settings', error: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ user: req.auth.userId });
    
    if (!settings) {
      settings = await Settings.create({ user: req.auth.userId, ...req.body });
    } else {
      settings = await Settings.findOneAndUpdate(
        { user: req.auth.userId },
        req.body,
        { new: true }
      );
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Settings Update Failed', error: error.message });
  }
};
