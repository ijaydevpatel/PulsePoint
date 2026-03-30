import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    unique: true,
    sparse: true, // Allows null for legacy users
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
