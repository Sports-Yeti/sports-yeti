export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  chip: 32,
  card: 32,
  cardLg: 48,
  pill: 9999,
} as const;

export type Radii = typeof radii;
