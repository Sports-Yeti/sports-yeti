import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const tournamentFormSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    format: z.enum([
      'round_robin',
      'single_elim',
      'double_elim',
      'round_robin_playoff',
      'self_scheduled',
    ]),
    startIso: z.string().regex(ISO_DATE, 'Use YYYY-MM-DD'),
    endIso: z.string().regex(ISO_DATE, 'Use YYYY-MM-DD'),
    registrationClosesIso: z.string().regex(ISO_DATE, 'Use YYYY-MM-DD'),
    maxTeams: z.number().int().min(2).max(256),
    feeCents: z.number().int().min(0),
    venue: z.string().min(2, 'Venue is required'),
    city: z.string().min(2, 'City is required'),
    description: z.string().max(600).optional(),
  })
  .refine((v) => v.startIso < v.endIso, {
    message: 'End date must be after start date',
    path: ['endIso'],
  })
  .refine((v) => v.registrationClosesIso <= v.startIso, {
    message: 'Registration must close on or before the start date',
    path: ['registrationClosesIso'],
  });

export type TournamentFormValues = z.infer<typeof tournamentFormSchema>;
