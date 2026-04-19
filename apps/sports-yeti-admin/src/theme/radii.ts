export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  card: 12,
  // "Friendly aggressive" rounding for Glacier hero cards (ethos §5).
  cardLg: 24,
  // "Summit" — the most rounded surface, for hero panels.
  summit: 32,
  pill: 9999,
} as const;

export type Radii = typeof radii;
