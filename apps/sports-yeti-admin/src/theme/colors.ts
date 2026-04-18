export const colors = {
  brand: {
    primary: '#006495',
    accent: '#3FB1FA',
    soft: '#E0F2FE',
    deep: '#0C4A6E',
    tint: '#075985',
  },
  surface: {
    bg: '#F4F6FA',
    card: '#FFFFFF',
    chip: '#E4E9ED',
    chipMuted: 'rgba(223,227,231,0.4)',
    overlay: 'rgba(255,255,255,0.92)',
    sidebar: '#0F172A',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarActive: 'rgba(63,177,250,0.16)',
  },
  text: {
    primary: '#171C1F',
    secondary: '#3F4850',
    // 4.6:1 against surface.bg #F4F6FA (passes WCAG AA for body text)
    muted: '#6B7785',
    inverse: '#FFFFFF',
    sidebarPrimary: '#F8FAFC',
    sidebarMuted: '#94A3B8',
  },
  border: {
    hairline: 'rgba(190,199,210,0.15)',
    soft: 'rgba(228,233,237,0.7)',
    strong: '#E0E5EB',
    sidebar: 'rgba(255,255,255,0.08)',
  },
  status: {
    live: '#AB3512',
    success: '#2E7D32',
    warning: '#B26200',
    error: '#C62828',
    info: '#075985',
  },
  gradient: {
    cta: ['#006495', '#3FB1FA'] as const,
    ctaAngle: 151,
  },
} as const;

export type Colors = typeof colors;
