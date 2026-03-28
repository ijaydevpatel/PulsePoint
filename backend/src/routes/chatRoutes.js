import express from 'express';
import { sendMessage, streamMessage } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, sendMessage);
router.post('/stream', protect, streamMessage);

export default router;
