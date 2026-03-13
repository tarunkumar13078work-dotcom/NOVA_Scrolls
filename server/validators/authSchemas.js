import { z } from 'zod';

const username = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be 30 characters or less')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only include letters, numbers, and underscores');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or less');

export const registerSchema = z.object({
  username,
  password,
});

export const loginSchema = z.object({
  username,
  password,
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(16, 'Refresh token is required'),
});
