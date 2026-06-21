import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  CircleDot,
  Dumbbell,
  Target,
  Tent,
  Volleyball,
} from 'lucide-react-native';
import { PLAYER_AVATARS } from './avatars';
import {
  type ConcreteSportKey,
  type GameOpenStatus,
  type GameSkillLevel,
} from './games';
import { CITY_COORDS } from './teams';
import type { GeoPoint } from './facilities';

/** The organization / academy running a camp. Mirrors a league's org block. */
export interface CampOrganization {
  name: string;
  tagline: string;
  foundedYear: number;
  campsRun: number;
  rating: number;
  verified?: boolean;
}

/** One day / block within a camp's program. */
export interface CampSession {
  id: string;
  label: string;
  date: string;
  time: string;
  focus: string;
}

export interface CampRegistrant {
  id: string;
  name: string;
  avatar: string;
}

/**
 * A discoverable, registerable training camp / clinic. Distinct from
 * `ScheduledCamp` (a camp already on your calendar) — this is the browse +
 * register surface shown on Discover.
 */
export interface DiscoverCamp {
  id: string;
  title: string;
  sport: ConcreteSportKey;
  Icon: ComponentType<LucideProps>;
  organizer: string;
  organizerAvatar: string;
  organizerBio: string;
  organization: CampOrganization;
  city: string;
  venueName: string;
  address: string;
  /** ISO start/end so the date-range filter can compare real dates. */
  startsAt: string;
  endsAt: string;
  /** Human label, e.g. "Jun 8–12 · Mornings". */
  dateLabel: string;
  sessionsLabel: string;
  ageGroup: string;
  skillLevel: GameSkillLevel;
  feeCents: number;
  capacity: number;
  registered: number;
  spotsTone: 'brand' | 'warning';
  status: GameOpenStatus;
  cover: string;
  description: string;
  schedule: CampSession[];
  registrants: CampRegistrant[];
}

const REGISTRANT_NAMES = [
  'Marcus L.',
  'Rio T.',
  'Jamie R.',
  'Leo P.',
  'Priya S.',
  'Ada M.',
  'Theo K.',
  'Ines B.',
  'Sam V.',
  'Kai N.',
  'June O.',
  'Nico H.',
];

function buildRegistrants(prefix: string, count: number): CampRegistrant[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-r${i}`,
    name: REGISTRANT_NAMES[i % REGISTRANT_NAMES.length]!,
    avatar: PLAYER_AVATARS[i % PLAYER_AVATARS.length]!,
  }));
}

export const DISCOVER_CAMPS: DiscoverCamp[] = [
  {
    id: 'summit-striker-academy',
    title: 'Summit Striker Academy',
    sport: 'soccer',
    Icon: CircleDot,
    organizer: 'Coach Priya S.',
    organizerAvatar: PLAYER_AVATARS[5]!,
    organizerBio: 'Former NCAA D1 forward, USSF B-license. 9 years coaching youth strikers.',
    organization: {
      name: 'Summit Soccer Academy',
      tagline: 'Position-specific training for competitive youth players.',
      foundedYear: 2015,
      campsRun: 38,
      rating: 4.9,
      verified: true,
    },
    city: 'Denver, CO',
    venueName: 'Alpine Community Turf',
    address: '1200 Alpine Way, Denver, CO 80205',
    startsAt: '2026-06-08T09:00:00-06:00',
    endsAt: '2026-06-12T12:00:00-06:00',
    dateLabel: 'Jun 8–12 · Mornings',
    sessionsLabel: '5 sessions · 3h each',
    ageGroup: 'U14–U18',
    skillLevel: 'intermediate',
    feeCents: 24000,
    capacity: 24,
    registered: 17,
    spotsTone: 'brand',
    status: 'open',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
    description:
      'Finishing, first touch, and movement off the ball. Small-group reps with video review each afternoon.',
    schedule: [
      { id: 's1', label: 'Day 1', date: 'Mon, Jun 8', time: '9:00–12:00', focus: 'First touch & ball mastery' },
      { id: 's2', label: 'Day 2', date: 'Tue, Jun 9', time: '9:00–12:00', focus: 'Finishing & shooting angles' },
      { id: 's3', label: 'Day 3', date: 'Wed, Jun 10', time: '9:00–12:00', focus: 'Movement off the ball' },
      { id: 's4', label: 'Day 4', date: 'Thu, Jun 11', time: '9:00–12:00', focus: '1v1s & combination play' },
      { id: 's5', label: 'Day 5', date: 'Fri, Jun 12', time: '9:00–12:00', focus: 'Small-sided tournament' },
    ],
    registrants: buildRegistrants('summit-striker-academy', 17),
  },
  {
    id: 'downtown-hoops-clinic',
    title: 'Downtown Hoops Skills Clinic',
    sport: 'basketball',
    Icon: Dumbbell,
    organizer: 'Jamie R.',
    organizerAvatar: PLAYER_AVATARS[2]!,
    organizerBio: 'Pro-am guard and certified trainer. Runs weekly skills sessions downtown.',
    organization: {
      name: 'Downtown Rec Hoops',
      tagline: 'Run-first basketball development for all levels.',
      foundedYear: 2019,
      campsRun: 21,
      rating: 4.6,
    },
    city: 'Denver, CO',
    venueName: 'Downtown Rec Center',
    address: '88 Curtis St, Denver, CO 80202',
    startsAt: '2026-05-30T08:00:00-06:00',
    endsAt: '2026-05-31T13:00:00-06:00',
    dateLabel: 'May 30–31 · Weekend',
    sessionsLabel: '2-day intensive',
    ageGroup: 'All ages',
    skillLevel: 'all',
    feeCents: 9000,
    capacity: 20,
    registered: 19,
    spotsTone: 'warning',
    status: 'open',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
    description:
      'Ball-handling, shooting mechanics, and pick-and-roll reads. Open run scrimmages to close each day.',
    schedule: [
      { id: 's1', label: 'Day 1', date: 'Sat, May 30', time: '8:00–13:00', focus: 'Handles & shooting form' },
      { id: 's2', label: 'Day 2', date: 'Sun, May 31', time: '8:00–13:00', focus: 'Pick-and-roll reads & open run' },
    ],
    registrants: buildRegistrants('downtown-hoops-clinic', 19),
  },
  {
    id: 'coastal-volley-camp',
    title: 'Coastal Beach Volley Camp',
    sport: 'volleyball',
    Icon: Volleyball,
    organizer: 'Coast Squad',
    organizerAvatar: PLAYER_AVATARS[3]!,
    organizerBio: 'AVP-tour alumni coaching beach fundamentals up and down the coast.',
    organization: {
      name: 'Coastal Volley Collective',
      tagline: 'Sand volleyball clinics led by former pros.',
      foundedYear: 2017,
      campsRun: 44,
      rating: 4.9,
      verified: true,
    },
    city: 'San Diego, CA',
    venueName: 'Sunny Sands Park',
    address: '3500 Ocean Front Walk, San Diego, CA 92109',
    startsAt: '2026-06-20T09:00:00-07:00',
    endsAt: '2026-06-21T15:00:00-07:00',
    dateLabel: 'Jun 20–21 · Weekend',
    sessionsLabel: '2 days on the sand',
    ageGroup: '16+',
    skillLevel: 'beginner',
    feeCents: 13500,
    capacity: 16,
    registered: 6,
    spotsTone: 'brand',
    status: 'open',
    cover:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=70',
    description:
      'Learn beach fundamentals — passing in the wind, peeling, and shot selection — with former pros.',
    schedule: [
      { id: 's1', label: 'Day 1', date: 'Sat, Jun 20', time: '9:00–15:00', focus: 'Passing, setting & serve-receive' },
      { id: 's2', label: 'Day 2', date: 'Sun, Jun 21', time: '9:00–15:00', focus: 'Shot selection & king-of-the-court' },
    ],
    registrants: buildRegistrants('coastal-volley-camp', 6),
  },
  {
    id: 'highland-tennis-week',
    title: 'Highland Tennis Performance Week',
    sport: 'tennis',
    Icon: Target,
    organizer: 'Highland Tennis Club',
    organizerAvatar: PLAYER_AVATARS[1]!,
    organizerBio: 'USPTA-certified staff running performance intensives for ranked adults.',
    organization: {
      name: 'Highland Tennis Club',
      tagline: 'Member-owned club with a competitive adult program.',
      foundedYear: 2004,
      campsRun: 62,
      rating: 4.7,
      verified: true,
    },
    city: 'Boulder, CO',
    venueName: 'Highland Tennis Club',
    address: '700 Highland Ave, Boulder, CO 80302',
    startsAt: '2026-07-13T07:00:00-06:00',
    endsAt: '2026-07-17T11:00:00-06:00',
    dateLabel: 'Jul 13–17 · Early AM',
    sessionsLabel: '5 sessions · pro-supervised',
    ageGroup: 'Adults',
    skillLevel: 'advanced',
    feeCents: 32000,
    capacity: 12,
    registered: 12,
    spotsTone: 'warning',
    status: 'closed',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
    description:
      'Match-play tactics, serve biomechanics, and recovery. Filled for this session — join the waitlist.',
    schedule: [
      { id: 's1', label: 'Day 1', date: 'Mon, Jul 13', time: '7:00–11:00', focus: 'Serve biomechanics' },
      { id: 's2', label: 'Day 2', date: 'Tue, Jul 14', time: '7:00–11:00', focus: 'Return & baseline patterns' },
      { id: 's3', label: 'Day 3', date: 'Wed, Jul 15', time: '7:00–11:00', focus: 'Net play & transition' },
      { id: 's4', label: 'Day 4', date: 'Thu, Jul 16', time: '7:00–11:00', focus: 'Match-play tactics' },
      { id: 's5', label: 'Day 5', date: 'Fri, Jul 17', time: '7:00–11:00', focus: 'Live sets & recovery' },
    ],
    registrants: buildRegistrants('highland-tennis-week', 12),
  },
  {
    id: 'riverside-softball-camp',
    title: 'Riverside Softball Fundamentals',
    sport: 'baseball',
    Icon: Tent,
    organizer: 'Marcus L.',
    organizerAvatar: PLAYER_AVATARS[0]!,
    organizerBio: 'Volunteer coach and league organizer running family-friendly clinics.',
    organization: {
      name: 'Riverside Youth Sports',
      tagline: 'Community-run clinics with a focus on fun and fundamentals.',
      foundedYear: 2010,
      campsRun: 15,
      rating: 4.5,
    },
    city: 'Denver, CO',
    venueName: 'Riverside Diamonds',
    address: '2200 N Riverside Dr, Denver, CO 80216',
    startsAt: '2026-06-27T09:00:00-06:00',
    endsAt: '2026-06-28T14:00:00-06:00',
    dateLabel: 'Jun 27–28 · Weekend',
    sessionsLabel: '2-day fundamentals',
    ageGroup: 'U12–U16',
    skillLevel: 'beginner',
    feeCents: 7500,
    capacity: 30,
    registered: 11,
    spotsTone: 'brand',
    status: 'open',
    cover:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=70',
    description:
      'Fielding, baserunning, and slap-hitting basics. Ends with a parents-vs-players scrimmage and BBQ.',
    schedule: [
      { id: 's1', label: 'Day 1', date: 'Sat, Jun 27', time: '9:00–14:00', focus: 'Fielding & throwing mechanics' },
      { id: 's2', label: 'Day 2', date: 'Sun, Jun 28', time: '9:00–14:00', focus: 'Hitting, baserunning & scrimmage' },
    ],
    registrants: buildRegistrants('riverside-softball-camp', 11),
  },
];

/** Resolve a camp's coordinates from its city for distance filtering. */
export function campCoords(camp: DiscoverCamp): GeoPoint | null {
  return CITY_COORDS[camp.city] ?? null;
}

export function campById(id: string): DiscoverCamp | undefined {
  return DISCOVER_CAMPS.find((c) => c.id === id);
}
