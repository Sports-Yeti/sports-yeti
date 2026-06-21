// AI highlight "models" the user can pick from before generating a reel.
// These are prototype/mock definitions — the shape is intentionally close to
// what a real model-routing backend would return (id, pricing delta, ETA,
// capability hints) so the UI can stay unchanged when a real service lands.

export type ModelSpeed = 'fast' | 'balanced' | 'thorough';
export type HighlightVibe = 'cinematic' | 'hype' | 'clean' | 'tactical';

export type ModelIconKey =
  | 'zap'
  | 'clapperboard'
  | 'target'
  | 'flame'
  | 'crosshair';

export interface AIHighlightModel {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconKey: ModelIconKey;
  /** Accent used for the card border + icon chip. */
  accent: string;
  speed: ModelSpeed;
  /** 1–5 visual quality meter. */
  quality: number;
  /** Surcharge added on top of the base highlight price, in cents. */
  priceModifierCents: number;
  etaLabel: string;
  /** Vibe the model leans toward — seeds the director brief. */
  defaultVibe: HighlightVibe;
  bestFor: string[];
  premium?: boolean;
}

export const SPEED_LABEL: Record<ModelSpeed, string> = {
  fast: 'Fast',
  balanced: 'Balanced',
  thorough: 'Thorough',
};

export const VIBE_LABEL: Record<HighlightVibe, string> = {
  cinematic: 'Cinematic',
  hype: 'Hype',
  clean: 'Clean cut',
  tactical: 'Tactical',
};

// Brand palette references (kept literal to avoid a theme import in mock data):
// brand.accent #3FB1FA · brand.primary #006495 · brand.deep #0C4A6E
// status.live #AB3512 · brand.tint #075985
export const AI_HIGHLIGHT_MODELS: AIHighlightModel[] = [
  {
    id: 'quick-clip',
    name: 'Quick Clip',
    tagline: 'Same-day social cuts',
    description:
      'Fast vertical edits tuned for Reels and Shorts. Great when you want it posted before you leave the field.',
    iconKey: 'zap',
    accent: '#3FB1FA',
    speed: 'fast',
    quality: 3,
    priceModifierCents: 0,
    etaLabel: '~60 sec',
    defaultVibe: 'hype',
    bestFor: ['Reels & Shorts', 'Same-day posts'],
  },
  {
    id: 'yeti-vision-pro',
    name: 'Yeti Vision Pro',
    tagline: 'Flagship cinematic editor',
    description:
      'Our most detailed model. Multi-angle awareness, slow-mo on the biggest moments, and color-graded polish.',
    iconKey: 'clapperboard',
    accent: '#006495',
    speed: 'thorough',
    quality: 5,
    priceModifierCents: 200,
    etaLabel: '~4 min',
    defaultVibe: 'cinematic',
    bestFor: ['Cinematic edits', 'Slow-mo', 'Multi-angle'],
    premium: true,
  },
  {
    id: 'coaches-eye',
    name: "Coach's Eye",
    tagline: 'Tactical film breakdowns',
    description:
      'Built for the film room. Surfaces build-up play, set pieces, and defensive shape — not just the goals.',
    iconKey: 'target',
    accent: '#0C4A6E',
    speed: 'balanced',
    quality: 4,
    priceModifierCents: 100,
    etaLabel: '~3 min',
    defaultVibe: 'tactical',
    bestFor: ['Film review', 'Build-up play', 'Set pieces'],
  },
  {
    id: 'hype-machine',
    name: 'Hype Machine',
    tagline: 'Beat-synced energy',
    description:
      'Cuts to the music, leans into celebrations and crowd noise, and never lets the energy drop.',
    iconKey: 'flame',
    accent: '#AB3512',
    speed: 'balanced',
    quality: 4,
    priceModifierCents: 100,
    etaLabel: '~2 min',
    defaultVibe: 'hype',
    bestFor: ['Beat-synced', 'Celebrations', 'Crowd noise'],
  },
  {
    id: 'scout-track',
    name: 'Scout Track',
    tagline: 'Follows one player',
    description:
      'Locks onto a single jersey number across the whole game — ideal for recruiting tape and personal reels.',
    iconKey: 'crosshair',
    accent: '#075985',
    speed: 'thorough',
    quality: 4,
    priceModifierCents: 150,
    etaLabel: '~3 min',
    defaultVibe: 'clean',
    bestFor: ['One-player focus', 'Recruiting tape', 'Jersey tracking'],
  },
];

export const DEFAULT_MODEL_ID = AI_HIGHLIGHT_MODELS[0].id;

export function getModelById(id: string): AIHighlightModel {
  return AI_HIGHLIGHT_MODELS.find((m) => m.id === id) ?? AI_HIGHLIGHT_MODELS[0];
}
