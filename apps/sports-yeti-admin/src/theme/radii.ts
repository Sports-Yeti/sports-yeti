export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  card: 12,
  // "Friendly aggressive" rounding for Glacier hero cards (ethos §5).
  // Tuned to match Stitch reference's `rounded-xl` (~28px).
  cardLg: 28,
  // "Summit" — the most rounded surface, for hero panels.
  summit: 36,
  pill: 9999,
} as const;

export type Radii = typeof radii;
