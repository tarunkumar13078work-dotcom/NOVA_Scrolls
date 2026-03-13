import { Router } from 'express';
import { register, login, me, refresh, logout } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { loginSchema, refreshSchema, registerSchema } from '../validators/authSchemas.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', validate(refreshSchema), logout);
router.get('/me', protect, me);

export default router;
