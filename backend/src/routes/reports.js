import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { analyzeReport } from '../controllers/reportController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/reports/analyze — Neural Vision Core Activation
router.post('/analyze', requireAuth, upload.single('reportFile'), analyzeReport);

export default router;
