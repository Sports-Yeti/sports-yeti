import { portraitFor } from './avatars';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type PersonKind = 'player' | 'referee' | 'coach' | 'parent';

export interface Person {
  id: string;
  kind: PersonKind;
  name: string;
  handle: string;
  email: string;
  phone: string;
  city: string;
  avatar: string;
  experience: ExperienceLevel;
  position?: string;
  joinedIso: string;
  // Per-kind extras
  teams?: { id: string; name: string }[];
  refereeRating?: number;
  hourlyRateCents?: number;
  certifications?: string[];
  waiverStatus: 'signed' | 'expired' | 'unsigned';
  isAvailableToSub?: boolean;
  pendingPaymentCents?: number;
}

const SOCCER_POS = ['Striker', 'Goalkeeper', 'Center Back', 'Right Back', 'Center Mid', 'Left Wing'];
const BBALL_POS = ['Point Guard', 'Shooting Guard', 'Forward', 'Center'];

const FIRSTS = [
  'Marcus', 'Sarah', 'Rio', 'Ash', 'Leo', 'Kim', 'Björn', 'Eli', 'Tara', 'Jamie',
  'Priya', 'Coast', 'Quinn', 'Maya', 'Theo', 'Aisha', 'Niko', 'Emma', 'Diego', 'Iris',
  'Ravi', 'Lena', 'Mateo', 'Sage', 'Hugo', 'Nia', 'Otto', 'Vivi', 'Levi', 'Zara',
];
const LASTS = [
  'L.', 'Jenkins', 'T.', 'D.', 'P.', 'H.', 'K.', 'M.', 'V.', 'R.',
  'S.', 'Squad', 'O.', 'A.', 'N.', 'B.', 'C.', 'F.', 'G.', 'I.',
  'W.', 'X.', 'Y.', 'Z.', 'J.', 'E.', 'U.', 'Q.', 'CH.', 'TH.',
];
const CITIES = [
  'Denver, CO', 'Boulder, CO', 'Anchorage, AK', 'San Diego, CA',
  'Aurora, CO', 'Fort Collins, CO', 'Golden, CO',
];

function build(
  index: number,
  kind: PersonKind,
  overrides: Partial<Person> = {},
): Person {
  const id = `p-${kind}-${index}`;
  const first = FIRSTS[index % FIRSTS.length]!;
  const last = LASTS[index % LASTS.length]!;
  const name = `${first} ${last}`;
  const handle = `@${first.toLowerCase().replace(/[^a-z]/g, '')}_${last.toLowerCase().replace(/[^a-z0-9]/g, '')}`.slice(0, 22);
  const xp: ExperienceLevel = (
    ['beginner', 'intermediate', 'advanced', 'pro'] as const
  )[index % 4]!;
  const position =
    kind === 'player'
      ? (index % 2 === 0 ? SOCCER_POS : BBALL_POS)[index % 6]
      : undefined;
  return {
    id,
    kind,
    name,
    handle,
    email: `${handle.slice(1)}@example.com`,
    phone: `+1 555 555 ${String(1000 + index).slice(1, 5)}`,
    city: CITIES[index % CITIES.length]!,
    avatar: portraitFor(index),
    experience: xp,
    position,
    joinedIso: new Date(2024, (index * 3) % 12, (index % 27) + 1).toISOString(),
    waiverStatus:
      index % 7 === 0 ? 'unsigned' : index % 11 === 0 ? 'expired' : 'signed',
    isAvailableToSub: kind === 'player' ? index % 3 === 0 : undefined,
    pendingPaymentCents: kind === 'player' && index % 8 === 0 ? 12000 : undefined,
    ...overrides,
  };
}

export const PEOPLE: Person[] = [
  ...Array.from({ length: 38 }, (_, i) =>
    build(i + 1, 'player', {
      teams:
        i % 4 === 0
          ? [{ id: 'team-avalanche-fc', name: 'Avalanche FC' }]
          : i % 4 === 1
          ? [{ id: 'team-glacier-knights', name: 'Glacier Knights' }]
          : i % 4 === 2
          ? [{ id: 'team-summit-hoops', name: 'Summit Hoops' }]
          : i % 8 === 3
          ? [{ id: 'team-coastal-cruisers', name: 'Coastal Cruisers' }]
          : undefined,
    }),
  ),
  ...Array.from({ length: 8 }, (_, i) =>
    build(i + 50, 'referee', {
      refereeRating: 4.4 + (i % 6) * 0.1,
      hourlyRateCents: 4500 + (i % 4) * 500,
      certifications:
        i % 2 === 0
          ? ['USSF Grade 8', 'CPR (2025)']
          : ['NHL Officiating Level 2'],
    }),
  ),
  ...Array.from({ length: 4 }, (_, i) =>
    build(i + 70, 'coach', {
      certifications: ['NSCAA D-License'],
    }),
  ),
  ...Array.from({ length: 3 }, (_, i) => build(i + 80, 'parent')),
];

export function personById(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

export function peopleByKind(kind: PersonKind): Person[] {
  return PEOPLE.filter((p) => p.kind === kind);
}

export const EXPERIENCE_LABEL: Record<ExperienceLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  pro: 'Pro',
};

export const KIND_LABEL: Record<PersonKind, string> = {
  player: 'Player',
  referee: 'Referee',
  coach: 'Coach',
  parent: 'Parent',
};
