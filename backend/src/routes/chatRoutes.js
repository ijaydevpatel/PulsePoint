import express from 'express';
import { sendMessage, streamMessage, getGreeting } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/greeting', protect, getGreeting);
router.post('/message', protect, sendMessage);
router.post('/stream', protect, streamMessage);

export default router;
