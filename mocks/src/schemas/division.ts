import { z } from 'zod';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validation note — Phase 1's `DivisionFormScreen` also enforces that
 * registration open/close fall *within* the season window. Because that
 * cross-entity check needs the season's dates at runtime, the screen
 * applies it via `superRefine` after fetching the season; the schema
 * here only enforces the open/close ordering.
 */
export const divisionFormSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    skillLevel: z.enum(['recreational', 'intermediate', 'competitive', 'elite']),
    ageBand: z.string().max(10).optional().or(z.literal('')),
    maxTeams: z.number().int().min(2).max(64),
    registrationFeeCents: z.number().int().min(0).max(10_000_00),
    registrationOpensIso: z.string().regex(ISO_DATE),
    registrationClosesIso: z.string().regex(ISO_DATE),
    rosterMin: z.number().int().min(1).max(50).optional(),
    rosterMax: z.number().int().min(1).max(50).optional(),
  })
  .refine((v) => v.registrationOpensIso < v.registrationClosesIso, {
    message: 'Close must be after open',
    path: ['registrationClosesIso'],
  })
  .refine(
    (v) => !v.rosterMin || !v.rosterMax || v.rosterMin <= v.rosterMax,
    {
      message: 'Min cannot exceed max',
      path: ['rosterMax'],
    },
  );

export type DivisionFormValues = z.infer<typeof divisionFormSchema>;
