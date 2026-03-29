import express from 'express';
import { triggerEmergency, getEmergencyStatus } from '../controllers/emergencyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/trigger', protect, triggerEmergency);
router.get('/status', protect, getEmergencyStatus);

export default router;
