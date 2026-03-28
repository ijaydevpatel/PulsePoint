import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  messages: [
    {
      role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true,
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
