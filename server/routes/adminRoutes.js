import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import adminGuard from '../middleware/adminGuard.js';
import { checkUpdatesNow } from '../controllers/adminController.js';

const router = Router();

router.use(protect);
router.use(adminGuard);
router.post('/check-updates', checkUpdatesNow);

export default router;
