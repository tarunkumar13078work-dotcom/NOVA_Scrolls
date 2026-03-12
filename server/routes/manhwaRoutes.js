import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { listManhwa, createManhwa, updateManhwa, deleteManhwa } from '../controllers/manhwaController.js';

const router = Router();

router.use(protect);
router.get('/', listManhwa);
router.post('/', createManhwa);
router.put('/:id', updateManhwa);
router.delete('/:id', deleteManhwa);

export default router;
