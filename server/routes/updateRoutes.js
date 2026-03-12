import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { getUpdates, markAsRead, upsertUpdate } from '../controllers/updateController.js';

const router = Router();

router.use(protect);
router.get('/', getUpdates);
router.put('/:id/read', markAsRead);
router.put('/:id', upsertUpdate);

export default router;
