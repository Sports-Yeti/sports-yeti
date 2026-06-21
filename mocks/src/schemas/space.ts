import { z } from 'zod';
import { SPORT_KEYS } from '../sports';
import type { SportKey } from '../types';

export const spaceFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    sports: z
      .array(z.enum(SPORT_KEYS as [SportKey, ...SportKey[]]))
      .min(1, 'Pick at least one sport'),
    surface: z.string().min(2),
    capacity: z.number().int().min(1).max(2000),
    isIndoor: z.boolean(),
    rentalMode: z.enum(['internal', 'external', 'both']),
    externalHourlyRateCents: z
      .number()
      .int()
      .min(0)
      .max(1_000_00)
      .optional(),
    internalLeagueIds: z.array(z.string()).optional(),
  })
  .refine(
    (v) =>
      v.rentalMode === 'internal' ||
      (typeof v.externalHourlyRateCents === 'number' &&
        v.externalHourlyRateCents > 0),
    {
      message: 'External rate is required when external rental is enabled',
      path: ['externalHourlyRateCents'],
    },
  );

export type SpaceFormValues = z.infer<typeof spaceFormSchema>;
