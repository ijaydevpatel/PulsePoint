import express from 'express';
import multer from 'multer';
import { analyzeReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ 
   storage: multer.memoryStorage(),
   limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/analyze', protect, upload.single('reportFile'), analyzeReport);

export default router;
