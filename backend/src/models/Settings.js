import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system',
  },
  notificationsEnabled: {
    type: Boolean,
    default: true,
  },
  emailAlerts: {
    type: Boolean,
    default: false,
  },
  dataSharing: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    default: 'en',
  }
}, {
  timestamps: true,
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
