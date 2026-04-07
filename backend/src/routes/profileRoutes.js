import express from 'express';
import { getProfile, upsertProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .post(protect, upsertProfile);

export default router;
