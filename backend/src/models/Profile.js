import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    ref: 'User',
    unique: true,
  },
  fullName: {
    type: String,
    required: false,
    default: "Active User"
  },
  age: {
    type: Number,
    required: false,
    default: 0
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say', 'Unknown'],
    required: false,
    default: 'Unknown'
  },
  height: { // in cm
    type: Number,
    required: false,
  },
  weight: { // in kg
    type: Number,
    required: false,
  },
  bmi: {
    type: Number,
    required: false,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    required: false,
    default: 'Unknown'
  },
  allergies: [{
    type: String,
  }],
  conditions: [{
    type: String,
  }],
  medications: [{
    type: String,
  }],
  emergencyContact: {
    name: String,
    phone: String,
    email: String,
    relation: String,
  },
  location: {
    type: String,
  },
  // Ecosystem Extension (March 29)
  streak: {
    type: Number,
    default: 0
  },
  lastCheckIn: {
    type: Date,
    default: Date.now
  },
  healthScore: {
    type: Number,
    default: 100
  },
  healthInsights: [{
    type: { type: String }, // e.g., 'Risk', 'Pattern', 'Medicine'
    content: String,
    severity: String,
    date: { type: Date, default: Date.now }
  }],
  cachedIntelligence: {
    type: Object,
    default: null
  },
  lastIntelUpdate: {
    type: Date,
    default: null
  },
  // Anti-Repetition History Buffers
  recentFacts: [{
    type: String
  }],
  recentTips: [{
    type: String
  }]
}, {
  timestamps: true,
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
