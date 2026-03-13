import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import {
  metadataFromUrlSchema,
  predictionQuerySchema,
  recommendationQuerySchema,
} from '../validators/aiSchemas.js';
import { autofillMetadata, getPredictions, getRecommendations } from '../controllers/aiController.js';

const router = Router();

router.use(protect);
router.post('/metadata-from-url', validate(metadataFromUrlSchema), autofillMetadata);
router.get('/recommendations', validate(recommendationQuerySchema, 'query'), getRecommendations);
router.get('/predictions', validate(predictionQuerySchema, 'query'), getPredictions);

export default router;
