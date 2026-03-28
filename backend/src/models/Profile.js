import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: true,
  },
  height: { // in cm
    type: Number,
    required: true,
  },
  weight: { // in kg
    type: Number,
    required: true,
  },
  bmi: {
    type: Number,
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true,
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
    relation: String,
  },
  location: {
    type: String,
  }
}, {
  timestamps: true,
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
