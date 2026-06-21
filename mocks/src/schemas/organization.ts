import { z } from 'zod';

const HEX = /^#([0-9a-fA-F]{3}){1,2}$/;

export const organizationFormSchema = z.object({
  name: z.string().min(2, 'Name is required').max(80, 'Keep it under 80 characters'),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and dashes only'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2).default('US'),
  brandColor: z.string().regex(HEX, 'Use a hex color like #006495'),
  brandColorAccent: z
    .string()
    .regex(HEX, 'Use a hex color like #3FB1FA')
    .optional()
    .or(z.literal('')),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  socialLinks: z
    .object({
      x: z.string().url().or(z.literal('')).optional(),
      facebook: z.string().url().or(z.literal('')).optional(),
      instagram: z.string().url().or(z.literal('')).optional(),
      linkedin: z.string().url().or(z.literal('')).optional(),
      tiktok: z.string().url().or(z.literal('')).optional(),
      youtube: z.string().url().or(z.literal('')).optional(),
    })
    .partial()
    .optional(),
});

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>;
