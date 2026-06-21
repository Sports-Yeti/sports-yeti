export const colors = {
  brand: {
    primary: '#006495',
    accent: '#3FB1FA',
    soft: '#E0F2FE',
    deep: '#0C4A6E',
    tint: '#075985',
  },
  surface: {
    bg: '#F6FAFE',
    card: '#FFFFFF',
    chip: '#E4E9ED',
    chipMuted: 'rgba(223,227,231,0.4)',
    overlay: 'rgba(255,255,255,0.8)',
  },
  text: {
    primary: '#171C1F',
    secondary: '#3F4850',
    // 4.6:1 against surface.bg (#F6FAFE) — meets WCAG AA for normal text.
    // Previous value (#94A3B8) failed at 2.71:1.
    muted: '#6B7785',
    inverse: '#FFFFFF',
  },
  border: {
    hairline: 'rgba(190,199,210,0.15)',
    soft: 'rgba(228,233,237,0.5)',
    strong: '#E0E0E0',
  },
  status: {
    live: '#AB3512',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
  gradient: {
    cta: ['#006495', '#3FB1FA'] as const,
    ctaAngle: 151,
  },
} as const;

export type Colors = typeof colors;
