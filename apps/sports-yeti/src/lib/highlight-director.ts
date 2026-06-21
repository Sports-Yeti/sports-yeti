// The "AI director" — a lightweight, rule-based conversation engine that turns
// free-text direction (and tappable suggestions) into a structured highlight
// brief. It's deliberately deterministic and dependency-free so the prototype
// feels like talking to the model without needing a live LLM. Swapping in a
// real model later means replacing `interpretDirection` with an API call that
// returns the same { brief, reply } shape.

import {
  VIBE_LABEL,
  type AIHighlightModel,
  type HighlightVibe,
} from '../mocks/ai-highlight-models';

export type ClipLength = 'short' | 'standard' | 'long';

export interface HighlightBrief {
  /** Human-readable focus tags the AI will prioritize. */
  focus: string[];
  vibe: HighlightVibe;
  clipLength: ClipLength;
  /** Target number of clips (3–15). */
  maxClips: number;
  /** Jersey number to track, or null for whole-team. */
  jerseyNumber: string | null;
}

export interface DirectorMessage {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

export interface InterpretResult {
  brief: HighlightBrief;
  reply: string;
  /** True when at least one piece of direction was extracted. */
  understood: boolean;
}

export const CLIP_LENGTH_LABEL: Record<ClipLength, string> = {
  short: '8–12s clips',
  standard: '15–20s clips',
  long: '25–35s clips',
};

/** Tappable starter prompts shown above the composer. */
export const FOCUS_SUGGESTIONS: string[] = [
  'Goals & assists',
  'Saves & blocks',
  'Defensive plays',
  'Skills & dribbles',
  'Celebrations',
  'Funny moments',
];

interface FocusRule {
  label: string;
  patterns: RegExp[];
}

const FOCUS_RULES: FocusRule[] = [
  { label: 'Goals & assists', patterns: [/goal/i, /\bscore/i, /assist/i, /finish/i] },
  { label: 'Saves & blocks', patterns: [/save/i, /block/i, /keeper/i, /goalie/i] },
  {
    label: 'Defensive plays',
    patterns: [/defen[sc]/i, /tackle/i, /steal/i, /interception/i, /clearance/i],
  },
  {
    label: 'Skills & dribbles',
    patterns: [/skill/i, /dribbl/i, /juke/i, /nutmeg/i, /crossover/i],
  },
  { label: 'Celebrations', patterns: [/celebrat/i, /reaction/i, /\bbench\b/i] },
  { label: 'Funny moments', patterns: [/funny/i, /blooper/i, /\bfail/i, /laugh/i] },
  { label: 'Dunks & threes', patterns: [/dunk/i, /three/i, /3-?point/i, /buzzer/i] },
  { label: 'Aces & spikes', patterns: [/\bace\b/i, /spike/i, /\bserve/i, /rally/i] },
];

const VIBE_RULES: { vibe: HighlightVibe; patterns: RegExp[] }[] = [
  {
    vibe: 'cinematic',
    patterns: [/cinema/i, /\bfilm\b/i, /slow-?mo/i, /slow motion/i, /epic/i, /dramatic/i, /movie/i],
  },
  { vibe: 'hype', patterns: [/hype/i, /energy/i, /music/i, /\bbeat/i, /pump/i, /loud/i] },
  { vibe: 'tactical', patterns: [/tactic/i, /analy/i, /coach/i, /breakdown/i, /build-?up/i] },
  { vibe: 'clean', patterns: [/clean/i, /simple/i, /minimal/i, /no music/i] },
];

const ACKS = ['Love it.', 'On it.', 'Got it.', 'Say less.'];

export function createInitialBrief(model: AIHighlightModel): HighlightBrief {
  return {
    focus: [],
    vibe: model.defaultVibe,
    clipLength: 'standard',
    maxClips: 8,
    jerseyNumber: null,
  };
}

export function greetingFor(model: AIHighlightModel): string {
  return `Hey — I'm ${model.name}. Tell me what this highlight should feel like: the plays to chase, a jersey number to follow, the vibe. Or tap a suggestion below to start.`;
}

export function summarizeBrief(brief: HighlightBrief): string {
  const parts: string[] = [
    brief.focus.length ? brief.focus.join(', ') : 'Best overall moments',
    `${VIBE_LABEL[brief.vibe]} vibe`,
    CLIP_LENGTH_LABEL[brief.clipLength],
    `up to ${brief.maxClips} clips`,
  ];
  return parts.join(' · ');
}

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function nudge(brief: HighlightBrief): string {
  return brief.focus.length === 0
    ? 'What kind of plays matter most?'
    : "Add anything else, or hit Generate when you're ready.";
}

export function interpretDirection(
  text: string,
  current: HighlightBrief,
): InterpretResult {
  const next: HighlightBrief = { ...current, focus: [...current.focus] };
  const learned: string[] = [];

  for (const rule of FOCUS_RULES) {
    const hit = rule.patterns.some((p) => p.test(text));
    if (hit && !next.focus.includes(rule.label)) {
      next.focus.push(rule.label);
      learned.push(rule.label.toLowerCase());
    }
  }

  for (const rule of VIBE_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      if (next.vibe !== rule.vibe) {
        next.vibe = rule.vibe;
        learned.push(`go ${VIBE_LABEL[rule.vibe].toLowerCase()}`);
      }
      break;
    }
  }

  const jersey = text.match(/(?:#|jersey|number|no\.?)\s*(\d{1,2})\b/i);
  if (jersey) {
    next.jerseyNumber = jersey[1];
    const label = `Following #${jersey[1]}`;
    if (!next.focus.includes(label)) next.focus.push(label);
    learned.push(`follow #${jersey[1]}`);
  }

  if (/\b(short|quick|tiktok|reel|snappy|punchy)\b/i.test(text)) {
    if (next.clipLength !== 'short') learned.push('keep clips short');
    next.clipLength = 'short';
  } else if (/\b(long|longer|full|extended)\b/i.test(text)) {
    if (next.clipLength !== 'long') learned.push('run longer clips');
    next.clipLength = 'long';
  }

  const count = text.match(/(\d{1,2})\s*(?:clips?|moments?|plays?|highlights?)/i);
  if (count) {
    const n = Math.max(3, Math.min(15, parseInt(count[1], 10)));
    next.maxClips = n;
    learned.push(`aim for about ${n} clips`);
  }

  const understood = learned.length > 0;
  const ack = ACKS[learned.length % ACKS.length];
  const reply = understood
    ? `${ack} I'll ${joinList(learned)}. ${nudge(next)}`
    : `I want to nail this one — try naming the plays ("goals and big saves"), a vibe ("make it cinematic"), or a jersey number to follow. ${nudge(next)}`;

  return { brief: next, reply, understood };
}
