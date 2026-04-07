import express from 'express';
import { analyzeSymptoms } from '../controllers/symptomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', protect, analyzeSymptoms);

export default router;
