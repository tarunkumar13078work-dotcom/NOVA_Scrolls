import { z } from 'zod';

export const metadataFromUrlSchema = z.object({
  url: z.string().url('A valid URL is required'),
});

export const recommendationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const predictionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(30).optional(),
});
