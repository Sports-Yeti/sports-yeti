/**
 * Sport registry — single source of truth for the sport-agnostic plumbing.
 *
 * Every sport-aware UI surface (icon, label, default roster sizes, scoring
 * orientation) reads from this registry. NEVER hard-code a sport label or
 * icon in a screen.
 */

import type { SportKey } from './types';

export interface SportDescriptor {
  key: SportKey;
  /** Display label, title-case. */
  label: string;
  /** Short tagline (used in pickers and option chips). */
  shortLabel: string;
  /**
   * Lucide icon name as a string. The UI layer maps this to the actual
   * lucide-react-native component. Strings here keep the mocks package
   * free of UI dependencies.
   */
  icon:
    | 'Volleyball'
    | 'CircleDot'
    | 'Goal'
    | 'Trophy'
    | 'Tent'
    | 'Activity'
    | 'Star';
  /** Standard roster sizes (override at the team or division level). */
  defaultRosterMin: number;
  defaultRosterMax: number;
  /** Whether scoring is "more is better" (most sports) vs golf-style. */
  scoringOrientation: 'higher_wins' | 'lower_wins';
  /** Base game length in minutes (used to default scheduling forms). */
  defaultGameMinutes: number;
}

export const SPORTS: Record<SportKey, SportDescriptor> = {
  soccer: {
    key: 'soccer',
    label: 'Soccer',
    shortLabel: 'Soccer',
    icon: 'Goal',
    defaultRosterMin: 11,
    defaultRosterMax: 22,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 90,
  },
  basketball: {
    key: 'basketball',
    label: 'Basketball',
    shortLabel: 'Hoops',
    icon: 'CircleDot',
    defaultRosterMin: 5,
    defaultRosterMax: 15,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 48,
  },
  volleyball: {
    key: 'volleyball',
    label: 'Volleyball',
    shortLabel: 'Volley',
    icon: 'Volleyball',
    defaultRosterMin: 6,
    defaultRosterMax: 12,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 60,
  },
  tennis: {
    key: 'tennis',
    label: 'Tennis',
    shortLabel: 'Tennis',
    icon: 'CircleDot',
    defaultRosterMin: 1,
    defaultRosterMax: 4,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 90,
  },
  baseball: {
    key: 'baseball',
    label: 'Baseball',
    shortLabel: 'Baseball',
    icon: 'CircleDot',
    defaultRosterMin: 9,
    defaultRosterMax: 25,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 120,
  },
  softball: {
    key: 'softball',
    label: 'Softball',
    shortLabel: 'Softball',
    icon: 'CircleDot',
    defaultRosterMin: 9,
    defaultRosterMax: 20,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 75,
  },
  hockey: {
    key: 'hockey',
    label: 'Hockey',
    shortLabel: 'Hockey',
    icon: 'Activity',
    defaultRosterMin: 6,
    defaultRosterMax: 23,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 60,
  },
  pickleball: {
    key: 'pickleball',
    label: 'Pickleball',
    shortLabel: 'Pickle',
    icon: 'CircleDot',
    defaultRosterMin: 1,
    defaultRosterMax: 4,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 60,
  },
  flag_football: {
    key: 'flag_football',
    label: 'Flag Football',
    shortLabel: 'Flag',
    icon: 'Trophy',
    defaultRosterMin: 7,
    defaultRosterMax: 14,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 60,
  },
  lacrosse: {
    key: 'lacrosse',
    label: 'Lacrosse',
    shortLabel: 'Lax',
    icon: 'Goal',
    defaultRosterMin: 10,
    defaultRosterMax: 23,
    scoringOrientation: 'higher_wins',
    defaultGameMinutes: 60,
  },
};

export const SPORT_KEYS: SportKey[] = Object.keys(SPORTS) as SportKey[];

export const SPORT_OPTIONS: { value: SportKey; label: string }[] =
  SPORT_KEYS.map((key) => ({ value: key, label: SPORTS[key].label }));

export function sportDescriptor(key: SportKey): SportDescriptor {
  return SPORTS[key];
}

export function sportLabel(key: SportKey): string {
  return SPORTS[key].label;
}
