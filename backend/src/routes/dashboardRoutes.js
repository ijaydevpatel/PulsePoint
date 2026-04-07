import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { getIntelligence } from '../controllers/intelligenceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getDashboardData);
router.get('/intel', protect, getIntelligence);

export default router;
