import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Dumbbell,
  Volleyball,
  Trophy,
  CircleDot,
  Target,
  Tent,
} from 'lucide-react-native';
import { PLAYER_AVATARS, SARAH_AVATAR } from './avatars';
import { FACILITIES, type GeoPoint } from './facilities';

export type SportKey =
  | 'allSports'
  | 'soccer'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'baseball';

export interface SportFilter {
  key: SportKey;
  label: string;
  Icon: ComponentType<LucideProps>;
}

export const SPORT_FILTERS: SportFilter[] = [
  { key: 'allSports', label: 'All Sports', Icon: Trophy },
  { key: 'soccer', label: 'Soccer', Icon: CircleDot },
  { key: 'basketball', label: 'Basketball', Icon: Dumbbell },
  { key: 'volleyball', label: 'Volleyball', Icon: Volleyball },
  { key: 'tennis', label: 'Tennis', Icon: Target },
  { key: 'baseball', label: 'Baseball', Icon: Tent },
];

export type GameStatusEyebrow =
  | 'LIVE NOW'
  | 'TONIGHT'
  | 'TOMORROW'
  | 'THIS WEEKEND'
  | 'NEXT WEEK';

export type GameTimeBucket = 'live' | 'today' | 'tomorrow' | 'weekend' | 'later';
export type GameSkillLevel = 'all' | 'beginner' | 'intermediate' | 'advanced';

/**
 * Lifecycle of a discoverable game. `open` games still have spots and are
 * accepting joiners. `closed` games are either full, cancelled, or already
 * finished — surfaced for context but not joinable.
 */
export type GameOpenStatus = 'open' | 'closed';

/** Per-roster-spot commitment + payment lifecycle. */
export type GamePaymentStatus = 'paid' | 'committed' | 'pending';

export interface GameAttendee {
  id: string;
  name: string;
  avatar: string;
  status: GamePaymentStatus;
}

/** Display labels for each sport. `allSports` is a filter, not a sport. */
export const SPORT_LABEL: Record<Exclude<SportKey, 'allSports'>, string> = {
  soccer: 'Soccer',
  basketball: 'Basketball',
  volleyball: 'Volleyball',
  tennis: 'Tennis',
  baseball: 'Baseball',
};

export function sportLabel(sport: SportKey): string | null {
  if (sport === 'allSports') return null;
  return SPORT_LABEL[sport];
}

export const PAYMENT_STATUS_LABEL: Record<GamePaymentStatus, string> = {
  paid: 'Paid',
  committed: 'Committed',
  pending: 'Pending',
};

export const OPEN_STATUS_LABEL: Record<GameOpenStatus, string> = {
  open: 'Open',
  closed: 'Closed',
};

/** Status filter for the Discover screen. Default is `open`. */
export type OpenStatusFilter = GameOpenStatus | 'all';

export const OPEN_STATUS_FILTERS: { key: OpenStatusFilter; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
];

export interface DiscoverGame {
  id: string;
  title: string;
  status: GameStatusEyebrow;
  isLive: boolean;
  featured: boolean;
  sport: SportKey;
  Icon: ComponentType<LucideProps>;
  price: 'Free' | string;
  priceCents: number;
  distance: string;
  distanceMiles: number;
  time: string;
  startsAt: string; // ISO date string
  durationMinutes: number;
  location: string;
  venueId: string;
  spotsLeft: number;
  spotsTotal: number;
  spotsLeftTone?: 'brand' | 'warning';
  attendees: string[];
  attendeeTotal: number;
  /** Detailed roster with commitment + payment status for the host view. */
  roster: GameAttendee[];
  skillLevel: GameSkillLevel;
  timeBucket: GameTimeBucket;
  dayId: string; // matches WEEK_DAYS id
  hostId: string;
  description: string;
  openStatus: GameOpenStatus;
  /** Live "watching this game" count for social proof. */
  watcherCount: number;
}

/**
 * Build a small mock roster of `total` players. The first `paid` are paid,
 * the next `committed` have RSVP'd but not paid, and the rest are pending
 * invites. Names are deterministic so screenshots stay stable.
 */
function buildRoster(
  prefix: string,
  total: number,
  paid: number,
  committed: number,
): GameAttendee[] {
  const NAMES = [
    'Marcus L.',
    'Rio T.',
    'Jamie R.',
    'Coast Squad',
    'Leo P.',
    'Priya S.',
    'Ada M.',
    'Theo K.',
    'Ines B.',
    'Sam V.',
    'Kai N.',
    'June O.',
  ];
  const list: GameAttendee[] = [];
  for (let i = 0; i < total; i += 1) {
    const status: GamePaymentStatus =
      i < paid ? 'paid' : i < paid + committed ? 'committed' : 'pending';
    list.push({
      id: `${prefix}-p${i}`,
      name: NAMES[i % NAMES.length]!,
      avatar: PLAYER_AVATARS[i % PLAYER_AVATARS.length]!,
      status,
    });
  }
  return list;
}

export const DISCOVER_GAMES: DiscoverGame[] = [
  {
    id: 'friday-night-scrimmage',
    title: 'Friday Night Scrimmage',
    status: 'LIVE NOW',
    isLive: true,
    featured: true,
    sport: 'soccer',
    Icon: CircleDot,
    price: 'Free',
    priceCents: 0,
    distance: '1.2 mi',
    distanceMiles: 1.2,
    time: '7:00 PM - 9:00 PM',
    startsAt: '2026-04-17T19:00:00-06:00',
    durationMinutes: 120,
    location: 'Alpine Community Turf',
    venueId: 'alpine-turf',
    spotsLeft: 4,
    spotsTotal: 16,
    spotsLeftTone: 'brand',
    attendees: PLAYER_AVATARS.slice(0, 3),
    attendeeTotal: 12,
    roster: buildRoster('friday-night-scrimmage', 12, 8, 3),
    skillLevel: 'intermediate',
    timeBucket: 'live',
    dayId: 'fri',
    hostId: 'host-marcus',
    description:
      'Casual co-ed 8v8 on the turf. We rotate every 12 minutes to keep things moving. Bring light + dark shirts.',
    openStatus: 'open',
    watcherCount: 24,
  },
  {
    id: 'open-gym-5v5',
    title: 'Open Gym 5v5',
    status: 'TOMORROW',
    isLive: false,
    featured: false,
    sport: 'basketball',
    Icon: Dumbbell,
    price: '$5',
    priceCents: 500,
    distance: '3.5 mi',
    distanceMiles: 3.5,
    time: '9:00 AM - 12:00 PM',
    startsAt: '2026-04-18T09:00:00-06:00',
    durationMinutes: 180,
    location: 'Downtown Rec Center',
    venueId: 'downtown-rec',
    spotsLeft: 10,
    spotsTotal: 20,
    spotsLeftTone: 'brand',
    attendees: PLAYER_AVATARS.slice(2, 5),
    attendeeTotal: 10,
    roster: buildRoster('open-gym-5v5', 10, 6, 2),
    skillLevel: 'all',
    timeBucket: 'tomorrow',
    dayId: 'sat',
    hostId: 'host-jamie',
    description:
      'Run-the-court pickup hoops. First team to 11, win-by-2. Refs provided. Fee covers gym rental and water.',
    openStatus: 'open',
    watcherCount: 11,
  },
  {
    id: 'beach-volley-coed',
    title: 'Beach Volley Co-ed',
    status: 'THIS WEEKEND',
    isLive: false,
    featured: false,
    sport: 'volleyball',
    Icon: Volleyball,
    price: 'Free',
    priceCents: 0,
    distance: '5.2 mi',
    distanceMiles: 5.2,
    time: 'Sat, 2:00 PM',
    startsAt: '2026-04-18T14:00:00-06:00',
    durationMinutes: 120,
    location: 'Sunny Sands Park',
    venueId: 'sunny-sands',
    spotsLeft: 2,
    spotsTotal: 12,
    spotsLeftTone: 'warning',
    attendees: PLAYER_AVATARS.slice(5, 6),
    attendeeTotal: 10,
    roster: buildRoster('beach-volley-coed', 10, 4, 4),
    skillLevel: 'beginner',
    timeBucket: 'weekend',
    dayId: 'sat',
    hostId: 'host-coast',
    description:
      "Sand, sun, and friendly comp. We'll split into 4-person teams and rotate every game. BYO water.",
    openStatus: 'open',
    watcherCount: 7,
  },
  {
    id: 'tuesday-tennis-doubles',
    title: 'Tuesday Tennis Doubles',
    status: 'NEXT WEEK',
    isLive: false,
    featured: false,
    sport: 'tennis',
    Icon: Target,
    price: '$8',
    priceCents: 800,
    distance: '2.4 mi',
    distanceMiles: 2.4,
    time: 'Tue, 6:00 PM',
    startsAt: '2026-04-21T18:00:00-06:00',
    durationMinutes: 90,
    location: 'Highland Tennis Club',
    venueId: 'highland-tennis',
    spotsLeft: 4,
    spotsTotal: 8,
    spotsLeftTone: 'brand',
    attendees: PLAYER_AVATARS.slice(1, 4),
    attendeeTotal: 4,
    roster: buildRoster('tuesday-tennis-doubles', 4, 3, 1),
    skillLevel: 'intermediate',
    timeBucket: 'later',
    dayId: 'tue',
    hostId: 'host-priya',
    description:
      'Doubles round-robin. We swap partners after every set so you play with everyone. Bring your own racquet.',
    openStatus: 'open',
    watcherCount: 5,
  },
  {
    id: 'sunday-softball-league',
    title: 'Sunday Softball Pickup',
    status: 'THIS WEEKEND',
    isLive: false,
    featured: false,
    sport: 'baseball',
    Icon: Tent,
    price: 'Free',
    priceCents: 0,
    distance: '4.8 mi',
    distanceMiles: 4.8,
    time: 'Sun, 10:00 AM',
    startsAt: '2026-04-19T10:00:00-06:00',
    durationMinutes: 150,
    location: 'Riverside Diamonds',
    venueId: 'riverside',
    spotsLeft: 6,
    spotsTotal: 18,
    spotsLeftTone: 'brand',
    attendees: PLAYER_AVATARS.slice(0, 4),
    attendeeTotal: 12,
    roster: buildRoster('sunday-softball-league', 12, 7, 3),
    skillLevel: 'all',
    timeBucket: 'weekend',
    dayId: 'sun',
    hostId: 'host-jamie',
    description:
      'Slow-pitch softball, all skill levels welcome. Gloves and bats provided. Ends with grilling at the pavilion.',
    openStatus: 'open',
    watcherCount: 9,
  },
  {
    id: 'mile-high-hoops-final',
    title: 'Mile High Hoops Final',
    status: 'TONIGHT',
    isLive: false,
    featured: false,
    sport: 'basketball',
    Icon: Dumbbell,
    price: '$10',
    priceCents: 1000,
    distance: '2.1 mi',
    distanceMiles: 2.1,
    time: '8:30 PM',
    startsAt: '2026-04-17T20:30:00-06:00',
    durationMinutes: 90,
    location: 'Downtown Rec Center',
    venueId: 'downtown-rec',
    spotsLeft: 0,
    spotsTotal: 10,
    spotsLeftTone: 'warning',
    attendees: PLAYER_AVATARS.slice(0, 4),
    attendeeTotal: 10,
    roster: buildRoster('mile-high-hoops-final', 10, 10, 0),
    skillLevel: 'advanced',
    timeBucket: 'today',
    dayId: 'fri',
    hostId: 'host-jamie',
    description:
      'Championship night for the spring tournament — full roster, refs assigned, spectators welcome.',
    openStatus: 'closed',
    watcherCount: 38,
  },
];

export interface GameRule {
  id: string;
  label: string;
  detail: string;
}

export interface GameHost {
  id: string;
  name: string;
  avatar: string;
  hosted: number;
  rating: number;
}

export const GAME_HOSTS: Record<string, GameHost> = {
  'host-marcus': {
    id: 'host-marcus',
    name: 'Marcus L.',
    avatar: PLAYER_AVATARS[0]!,
    hosted: 28,
    rating: 4.9,
  },
  'host-jamie': {
    id: 'host-jamie',
    name: 'Jamie R.',
    avatar: PLAYER_AVATARS[2]!,
    hosted: 14,
    rating: 4.7,
  },
  'host-coast': {
    id: 'host-coast',
    name: 'Coast Squad',
    avatar: PLAYER_AVATARS[3]!,
    hosted: 9,
    rating: 4.8,
  },
  'host-priya': {
    id: 'host-priya',
    name: 'Priya S.',
    avatar: PLAYER_AVATARS[5]!,
    hosted: 22,
    rating: 4.9,
  },
};

export const SARAH_HOST: GameHost = {
  id: 'host-sarah',
  name: 'You',
  avatar: SARAH_AVATAR,
  hosted: 4,
  rating: 5.0,
};

export const COMMON_GAME_RULES: GameRule[] = [
  {
    id: 'rotation',
    label: 'Rotations',
    detail: 'Subs every 10 minutes to keep all players moving.',
  },
  {
    id: 'inclusive',
    label: 'Inclusive play',
    detail: 'No-jerks policy. Calls are honored without arguing.',
  },
  {
    id: 'gear',
    label: 'Bring',
    detail: 'Light + dark shirt, water bottle, your own cleats/shoes.',
  },
];

export const SKILL_LABELS: Record<GameSkillLevel, string> = {
  all: 'All levels',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const TIME_BUCKET_FILTERS: { key: GameTimeBucket | 'any'; label: string }[] = [
  { key: 'any', label: 'Any time' },
  { key: 'live', label: 'Now' },
  { key: 'today', label: 'Tonight' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend', label: 'This weekend' },
  { key: 'later', label: 'Next week' },
];

export const DISTANCE_FILTERS: { key: number; label: string }[] = [
  { key: 5, label: '5 mi' },
  { key: 10, label: '10 mi' },
  { key: 25, label: '25 mi' },
  { key: 100, label: 'Any' },
];

/** Selectable sport keys, excluding the synthetic `allSports` filter chip. */
export type ConcreteSportKey = Exclude<SportKey, 'allSports'>;
export const ALL_SPORT_KEYS: ConcreteSportKey[] = [
  'soccer',
  'basketball',
  'volleyball',
  'tennis',
  'baseball',
];

/**
 * Catalogue of sports the player can search & multi-select from. Each entry
 * `bucket`s back to one of the canonical {@link ConcreteSportKey} values
 * (or `null` when no playable fixtures exist yet) so that picking an entry
 * still filters the live `DISCOVER_GAMES` list correctly. The catalogue is
 * intentionally large to stand in for the eventual back-end registry of
 * hundreds of sports.
 */
export interface SportCatalogEntry {
  key: string;
  label: string;
  Icon: ComponentType<LucideProps>;
  bucket: ConcreteSportKey | null;
  /** Optional searchable keywords (e.g. "footy", "futbol"). */
  aliases?: string[];
}

export const SPORT_CATALOG: SportCatalogEntry[] = [
  // Team ball — soccer family
  { key: 'soccer', label: 'Soccer', Icon: CircleDot, bucket: 'soccer', aliases: ['football', 'futbol', 'footy'] },
  { key: 'futsal', label: 'Futsal', Icon: CircleDot, bucket: 'soccer', aliases: ['indoor soccer'] },
  { key: 'beach-soccer', label: 'Beach Soccer', Icon: CircleDot, bucket: 'soccer' },
  { key: 'flag-football', label: 'Flag Football', Icon: Trophy, bucket: null },
  { key: 'touch-rugby', label: 'Touch Rugby', Icon: Trophy, bucket: null },
  { key: 'rugby-7s', label: 'Rugby 7s', Icon: Trophy, bucket: null, aliases: ['sevens'] },
  { key: 'rugby-union', label: 'Rugby Union', Icon: Trophy, bucket: null },
  { key: 'aussie-rules', label: 'Aussie Rules', Icon: Trophy, bucket: null, aliases: ['afl'] },
  { key: 'gaelic-football', label: 'Gaelic Football', Icon: Trophy, bucket: null },

  // Court — basketball family
  { key: 'basketball', label: 'Basketball', Icon: Dumbbell, bucket: 'basketball', aliases: ['hoops', '5v5'] },
  { key: 'basketball-3x3', label: '3x3 Basketball', Icon: Dumbbell, bucket: 'basketball', aliases: ['3on3'] },
  { key: 'wheelchair-basketball', label: 'Wheelchair Basketball', Icon: Dumbbell, bucket: 'basketball' },
  { key: 'netball', label: 'Netball', Icon: Dumbbell, bucket: null },
  { key: 'korfball', label: 'Korfball', Icon: Dumbbell, bucket: null },
  { key: 'handball', label: 'Handball', Icon: Dumbbell, bucket: null },

  // Court — racket family
  { key: 'tennis', label: 'Tennis', Icon: Target, bucket: 'tennis', aliases: ['singles', 'doubles'] },
  { key: 'doubles-tennis', label: 'Doubles Tennis', Icon: Target, bucket: 'tennis' },
  { key: 'pickleball', label: 'Pickleball', Icon: Target, bucket: null, aliases: ['pickle'] },
  { key: 'paddle-tennis', label: 'Paddle Tennis', Icon: Target, bucket: null, aliases: ['padel'] },
  { key: 'badminton', label: 'Badminton', Icon: Target, bucket: null, aliases: ['birdie'] },
  { key: 'squash', label: 'Squash', Icon: Target, bucket: null },
  { key: 'racquetball', label: 'Racquetball', Icon: Target, bucket: null },
  { key: 'table-tennis', label: 'Table Tennis', Icon: Target, bucket: null, aliases: ['ping pong'] },

  // Net — volleyball family
  { key: 'volleyball', label: 'Volleyball', Icon: Volleyball, bucket: 'volleyball', aliases: ['indoor vb'] },
  { key: 'beach-volleyball', label: 'Beach Volleyball', Icon: Volleyball, bucket: 'volleyball', aliases: ['sand'] },
  { key: 'sitting-volleyball', label: 'Sitting Volleyball', Icon: Volleyball, bucket: 'volleyball' },
  { key: 'sepak-takraw', label: 'Sepak Takraw', Icon: Volleyball, bucket: null, aliases: ['kick volleyball'] },

  // Bat & ball
  { key: 'baseball', label: 'Baseball', Icon: Tent, bucket: 'baseball', aliases: ['hardball'] },
  { key: 'softball', label: 'Softball', Icon: Tent, bucket: 'baseball', aliases: ['slow pitch', 'fast pitch'] },
  { key: 'kickball', label: 'Kickball', Icon: Tent, bucket: null },
  { key: 'wiffleball', label: 'Wiffleball', Icon: Tent, bucket: null },
  { key: 'cricket', label: 'Cricket', Icon: Tent, bucket: null, aliases: ['t20', 'odi'] },

  // Ice / hard
  { key: 'ice-hockey', label: 'Ice Hockey', Icon: Trophy, bucket: null },
  { key: 'roller-hockey', label: 'Roller Hockey', Icon: Trophy, bucket: null },
  { key: 'field-hockey', label: 'Field Hockey', Icon: Trophy, bucket: null },
  { key: 'lacrosse', label: 'Lacrosse', Icon: Trophy, bucket: null, aliases: ['lax'] },
  { key: 'ultimate', label: 'Ultimate Frisbee', Icon: Trophy, bucket: null, aliases: ['ultimate', 'disc'] },
  { key: 'disc-golf', label: 'Disc Golf', Icon: Target, bucket: null },

  // Combat / mat
  { key: 'bjj', label: 'Brazilian Jiu-Jitsu', Icon: Dumbbell, bucket: null, aliases: ['jiu jitsu', 'gi', 'no-gi'] },
  { key: 'boxing', label: 'Boxing Sparring', Icon: Dumbbell, bucket: null },
  { key: 'mma', label: 'MMA Sparring', Icon: Dumbbell, bucket: null },
  { key: 'judo', label: 'Judo', Icon: Dumbbell, bucket: null },

  // Endurance / outdoor
  { key: 'running-club', label: 'Running Club', Icon: Trophy, bucket: null, aliases: ['run club', '5k'] },
  { key: 'cycling', label: 'Cycling', Icon: Trophy, bucket: null, aliases: ['bike', 'gravel', 'road'] },
  { key: 'climbing', label: 'Climbing Session', Icon: Trophy, bucket: null, aliases: ['bouldering', 'lead'] },
  { key: 'yoga', label: 'Yoga Flow', Icon: Trophy, bucket: null },
];

/** Build a quick-search index from the catalog. */
function buildSearchIndex(entry: SportCatalogEntry): string {
  const parts = [entry.label, entry.key, ...(entry.aliases ?? [])];
  return parts.join(' ').toLowerCase();
}

export function searchSportCatalog(query: string): SportCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return SPORT_CATALOG;
  return SPORT_CATALOG.filter((e) => buildSearchIndex(e).includes(q));
}

export function sportCatalogEntry(key: string): SportCatalogEntry | undefined {
  return SPORT_CATALOG.find((e) => e.key === key);
}

/**
 * Resolve a game's geo coordinates via its facility. Returns `null` if the
 * facility (or coords) cannot be found.
 */
export function gameCoords(game: DiscoverGame): GeoPoint | null {
  const facility = FACILITIES.find((f) => f.id === game.venueId);
  return facility?.coords ?? null;
}
