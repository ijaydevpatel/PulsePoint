import express from 'express';
import { sendMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, sendMessage);
router.post('/stream', protect, (req, res) => {
  // We will implement the stream logic directly in controller
  import('../controllers/chatController.js').then(m => m.streamMessage(req, res));
});

export default router;
