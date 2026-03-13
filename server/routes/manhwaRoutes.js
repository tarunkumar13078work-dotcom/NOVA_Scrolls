import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { listManhwa, createManhwa, updateManhwa, deleteManhwa } from '../controllers/manhwaController.js';
import validate from '../middleware/validate.js';
import { createManhwaSchema, updateManhwaSchema } from '../validators/manhwaSchemas.js';

const router = Router();

router.use(protect);
router.get('/', listManhwa);
router.post('/', validate(createManhwaSchema), createManhwa);
router.put('/:id', validate(updateManhwaSchema), updateManhwa);
router.delete('/:id', deleteManhwa);

export default router;
