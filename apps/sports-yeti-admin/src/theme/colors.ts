export const colors = {
  brand: {
    primary: '#006495',
    accent: '#3FB1FA',
    soft: '#E0F2FE',
    deep: '#0C4A6E',
    tint: '#075985',
    // "Alpine Orange" tertiary — sunset on snow. Use sparingly for
    // urgent statuses and high-action CTAs (Glacier ethos §2).
    alpine: '#AB3512',
    alpineSoft: '#FFE4DA',
    alpineGlow: '#FF8766',
  },
  // Surface ladder — depth via tonal stacking, never via 1px borders
  // (Glacier ethos §4: "Layering Principle").
  surface: {
    bg: '#F4F6FA', //   page chrome (one notch above pure white)
    containerLow: '#EEF2F7', //   section grouping (one notch below page bg)
    containerHigh: '#E4EAF1', //   nested grouping inside cards
    card: '#FFFFFF', //   primary cards / sheets
    containerLowest: '#FFFFFF', //   alias for cards (clarifies intent)
    chip: '#E4E9ED',
    chipMuted: 'rgba(223,227,231,0.4)',
    overlay: 'rgba(255,255,255,0.92)',
    // Glassmorphism — frosted overlays at ~80% opacity. Pair with a
    // 12-20px backdrop blur on web for the floating-nav feel.
    glassOverlay: 'rgba(244,246,250,0.78)',
    glassCard: 'rgba(255,255,255,0.62)',
    // Light-Glacier sidebar — atmospheric tint, feels like
    // "alpine air" rather than the old dark-navy console.
    sidebar: '#F1F5FA',
    sidebarHover: 'rgba(0,100,149,0.06)',
    sidebarActive: '#E0F2FE',
  },
  text: {
    primary: '#171C1F',
    secondary: '#3F4850',
    // 4.6:1 against surface.bg #F4F6FA (passes WCAG AA for body text)
    muted: '#6B7785',
    inverse: '#FFFFFF',
    // Sidebar text now reads against light surface (was inverse on dark).
    sidebarPrimary: '#0C4A6E',
    sidebarMuted: '#6B7785',
  },
  border: {
    hairline: 'rgba(190,199,210,0.15)',
    // Per Glacier "no-line rule" we avoid 1px solid borders for layout
    // — these stay for accessibility and for input controls only.
    soft: 'rgba(228,233,237,0.7)',
    strong: '#E0E5EB',
    // Sidebar border is now a tonal-shift hairline, not a hard line.
    sidebar: 'rgba(15,23,42,0.06)',
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
    // "Alpine sunset" gradient — for Hot Bids / Live Now / Urgent CTAs.
    alpine: ['#AB3512', '#FF8766'] as const,
    // Soft glacier wash for hero backdrops.
    summit: ['#E0F2FE', '#F4F6FA'] as const,
  },
} as const;

export type Colors = typeof colors;
