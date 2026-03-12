import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getProgress, updateProgress } from '../controllers/progressController.js';

const router = Router();

router.use(protect);
router.get('/', getProgress);
router.put('/:id', updateProgress);

export default router;
