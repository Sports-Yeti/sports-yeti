import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const seasonFormSchema = z
  .object({
    label: z.string().min(2, 'Label is required'),
    cycle: z.enum(['spring_summer', 'fall_winter']),
    year: z.number().int().min(2020).max(2099),
    startIso: z.string().regex(ISO_DATE, 'Use YYYY-MM-DD'),
    endIso: z.string().regex(ISO_DATE, 'Use YYYY-MM-DD'),
    weeklySlotLabel: z.string().max(80).optional(),
    format: z.enum([
      'round_robin',
      'single_elim',
      'double_elim',
      'round_robin_playoff',
      'self_scheduled',
    ]),
    regularWeeks: z.number().int().min(1).max(52),
    playoffWeeks: z.number().int().min(0).max(8),
  })
  .refine((v) => v.startIso < v.endIso, {
    message: 'End date must be after start date',
    path: ['endIso'],
  });

export type SeasonFormValues = z.infer<typeof seasonFormSchema>;
