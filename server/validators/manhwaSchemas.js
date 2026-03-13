import { z } from 'zod';

const status = z.enum(['reading', 'completed', 'on-hold', 'dropped', 'planning']);
const source = z.enum(['asura', 'reaper', 'flame']);
const tagsSchema = z.array(z.string().trim().min(1).max(24)).max(12);

export const createManhwaSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150, 'Title must be 150 characters or less'),
  cover: z.string().url('Cover must be a valid URL').optional().or(z.literal('')),
  totalChapters: z.coerce.number().int().min(0).max(50000).optional(),
  status: status.optional(),
  currentChapter: z.coerce.number().int().min(0).max(50000).optional(),
  latestChapter: z.coerce.number().int().min(0).max(50000).optional(),
  favorite: z.coerce.boolean().optional(),
  tags: tagsSchema.optional(),
  collection: z.string().trim().max(60).optional(),
  source: source.optional(),
  sourceUrl: z.string().url('Source URL must be a valid URL').optional().or(z.literal('')),
  sourceSlug: z.string().trim().max(120).optional(),
});

export const updateManhwaSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
  cover: z.string().url('Cover must be a valid URL').optional().or(z.literal('')),
  totalChapters: z.coerce.number().int().min(0).max(50000).optional(),
  status: status.optional(),
  favorite: z.coerce.boolean().optional(),
  tags: tagsSchema.optional(),
  collection: z.string().trim().max(60).optional(),
});
