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
  }
}, {
  timestamps: true,
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
