import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user / set token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);
      
      res.json({
        _id: user._id,
        email: user.email,
        profileCompleted: user.profileCompleted,
        token, // React captures this for Context Header Injection
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password constraints' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Authentication Fault', error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User infrastructure context already inherently exists' });
    }

    const user = await User.create({
      email,
      password,
    });

    if (user) {
      // Identity Handshake: Ensure Profile exists immediately
      await (await import('../models/Profile.js')).default.create({
        user: user._id,
        emergencyContact: { name: "", phone: "", relation: "" }
      });

      const token = generateToken(res, user._id);
      
      res.status(201).json({
        _id: user._id,
        email: user.email,
        profileCompleted: user.profileCompleted,
        token,
      });
    } else {
      res.status(400).json({ message: 'Invalid infrastructure payload syntax during User mapping' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Registration Fault', error: error.message });
  }
};

// @desc    Get user profile base context
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User Context Object Not Found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Trace Fault', error: error.message });
  }
};
