import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: false, unique: true },
  clerkId: { type: String, unique: true, sparse: true },
  password: { type: String, required: false },
  fullName: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  age: { type: Number, default: 0 },
  gender: { type: String, default: "" },
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  bmi: { type: Number, default: 0 },
  bloodGroup: { type: String, default: "O+" },
  allergies: { type: [String], default: [] },
  conditions: { type: [String], default: [] },
  medications: { type: [String], default: [] },
  streak: { type: Number, default: 1 },
  healthScore: { type: Number, default: 72 },
  healthInsights: [{
    type: { type: String },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  settings: {
    notificationsEnabled: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: false },
    dataSharing: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' }
  },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
