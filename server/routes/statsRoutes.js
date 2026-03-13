import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getStatsOverview } from '../controllers/statsController.js';

const router = Router();

router.use(protect);
router.get('/overview', getStatsOverview);

export default router;
