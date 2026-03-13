import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getPushPublicKey,
  sendTestNotification,
  subscribe,
  unsubscribe,
} from '../controllers/notificationController.js';

const router = Router();

router.get('/public-key', getPushPublicKey);
router.use(protect);
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.post('/test', sendTestNotification);

export default router;
