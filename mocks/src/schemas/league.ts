import { z } from 'zod';
import { SPORT_KEYS } from '../sports';
import type { SportKey } from '../types';

export const leagueFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and dashes only'),
  sport: z.enum(SPORT_KEYS as [SportKey, ...SportKey[]]),
  sportTagline: z.string().min(2).max(80),
  city: z.string().min(2),
  description: z.string().min(8).max(800),
  rulesUrl: z.string().url().optional().or(z.literal('')),
});

export type LeagueFormValues = z.infer<typeof leagueFormSchema>;
