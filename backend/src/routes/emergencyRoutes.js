import express from 'express';
import { triggerEmergency } from '../controllers/emergencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/trigger', protect, triggerEmergency);

export default router;
