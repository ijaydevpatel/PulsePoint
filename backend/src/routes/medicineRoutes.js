import express from 'express';
import { checkMedicineCompatibility } from '../controllers/medicineController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/check', protect, checkMedicineCompatibility);

export default router;
