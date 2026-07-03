import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Bell,
  Bookmark,
  CalendarCheck,
  CalendarDays,
  Clapperboard,
  FileText,
  Goal,
  Mail,
  MapPin,
  Settings,
  Snowflake,
  Sun,
  Target,
  Tent,
  Trophy,
  UserCog,
  Users,
  Volleyball,
  Zap,
} from 'lucide-react-native';
import { PLAYER_AVATARS, SARAH_AVATAR } from './avatars';
import { POSITIONS_BY_SPORT, type SportKey } from './teams';

// ----------------------------------------------------------------------------
// Sport metadata — used by the sport picker, the sport tab strip on the
// profile, and the per-sport participation panels. Keeping this here (vs
// teams.ts) because it's profile-shaped (icon, display name) rather than the
// roster-shaped data that lives in `mocks/teams.ts`.
// ----------------------------------------------------------------------------

export interface SportMeta {
  key: SportKey;
  label: string;
  short: string;
  Icon: ComponentType<LucideProps>;
}

export const SPORTS_META: SportMeta[] = [
  { key: 'soccer', label: 'Soccer', short: 'Soccer', Icon: Goal },
  { key: 'basketball', label: 'Basketball', short: 'Hoops', Icon: Zap },
  { key: 'volleyball', label: 'Volleyball', short: 'Volley', Icon: Volleyball },
  { key: 'tennis', label: 'Tennis', short: 'Tennis', Icon: Sun },
  { key: 'baseball', label: 'Baseball', short: 'Baseball', Icon: Target },
  { key: 'hockey', label: 'Hockey', short: 'Hockey', Icon: Snowflake },
];

export const SPORT_META_BY_KEY: Record<SportKey, SportMeta> = SPORTS_META.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<SportKey, SportMeta>,
);

// ----------------------------------------------------------------------------
// Participation counts. The platform does not track in-game performance stats
// (goals, PPG, kills…) — only how much a player participates in each sport:
// games played, teams joined, camps trained at, and league seasons completed.
// One template shared by every sport.
// ----------------------------------------------------------------------------

export interface SportParticipation {
  gamesPlayed: number;
  teamsJoined: number;
  campsTrained: number;
  leagueSeasons: number;
}

export interface ParticipationField {
  id: keyof SportParticipation;
  label: string;
  Icon: ComponentType<LucideProps>;
  /** Render slightly larger / accented (the headline count). */
  primary?: boolean;
}

export const PARTICIPATION_FIELDS: ParticipationField[] = [
  { id: 'gamesPlayed', label: 'Games played', Icon: CalendarCheck, primary: true },
  { id: 'teamsJoined', label: 'Teams joined', Icon: Users },
  { id: 'campsTrained', label: 'Camps trained', Icon: Tent },
  { id: 'leagueSeasons', label: 'League seasons', Icon: Trophy },
];

export const EMPTY_PARTICIPATION: SportParticipation = {
  gamesPlayed: 0,
  teamsJoined: 0,
  campsTrained: 0,
  leagueSeasons: 0,
};

// ----------------------------------------------------------------------------
// Physical + sport-specific attributes. All optional — players opt in to
// sharing measurements. Shared measurements are imperial (US market).
// ----------------------------------------------------------------------------

export interface PlayerPhysicalAttributes {
  heightIn?: number;
  weightLb?: number;
  wingspanIn?: number;
}

/** 66 → `5'6"` */
export function formatFeetInches(totalInches: number): string {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export interface SportAttributeField {
  id: string;
  label: string;
  placeholder: string;
}

/** Optional per-sport attributes rendered as free-text fields in the editor
 *  and as tags on profiles. Values live on `SportPlayerProfile.attributes`. */
export const SPORT_ATTRIBUTE_TEMPLATES: Record<SportKey, SportAttributeField[]> = {
  soccer: [
    { id: 'dominant_foot', label: 'Dominant foot', placeholder: 'Right / Left / Both' },
  ],
  basketball: [
    { id: 'vertical_jump', label: 'Vertical jump', placeholder: 'e.g. 28 in' },
    { id: 'dominant_hand', label: 'Dominant hand', placeholder: 'Right / Left' },
  ],
  volleyball: [
    { id: 'standing_reach', label: 'Standing reach', placeholder: 'e.g. 7\'4"' },
    { id: 'approach_jump', label: 'Approach jump', placeholder: 'e.g. 9\'1"' },
  ],
  tennis: [
    { id: 'plays', label: 'Plays', placeholder: 'Right-handed / Left-handed' },
    { id: 'backhand', label: 'Backhand', placeholder: 'One-handed / Two-handed' },
  ],
  baseball: [
    { id: 'bats', label: 'Bats', placeholder: 'R / L / Switch' },
    { id: 'throws', label: 'Throws', placeholder: 'R / L' },
  ],
  hockey: [
    { id: 'shoots', label: 'Shoots', placeholder: 'Left / Right' },
  ],
};

// ----------------------------------------------------------------------------
// Gender identity — optional, self-declared.
// ----------------------------------------------------------------------------

export interface GenderIdentityOption {
  value: string;
  label: string;
}

export const GENDER_IDENTITY_OPTIONS: GenderIdentityOption[] = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'two_spirit', label: 'Two-Spirit' },
  { value: 'self_described', label: 'Self-described' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function genderIdentityLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return GENDER_IDENTITY_OPTIONS.find((o) => o.value === value)?.label ?? null;
}

// ----------------------------------------------------------------------------
// Experience levels. Three self-declared tiers; "Pro" is NOT a tier — it's a
// verified badge players apply for and platform administrators approve.
// ----------------------------------------------------------------------------

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExperienceLevelMeta {
  key: ExperienceLevel;
  label: string;
  description: string;
}

export const EXPERIENCE_LEVELS: ExperienceLevelMeta[] = [
  {
    key: 'beginner',
    label: 'Beginner',
    description: 'New to organized play — learning rules, drills, and game flow.',
  },
  {
    key: 'intermediate',
    label: 'Intermediate',
    description: 'Rec-league regular or school ball trained up to high school.',
  },
  {
    key: 'advanced',
    label: 'Advanced',
    description: 'College-level training or high-level competitive club play.',
  },
];

export const EXPERIENCE_LEVEL_BY_KEY: Record<ExperienceLevel, ExperienceLevelMeta> =
  EXPERIENCE_LEVELS.reduce(
    (acc, l) => {
      acc[l.key] = l;
      return acc;
    },
    {} as Record<ExperienceLevel, ExperienceLevelMeta>,
  );

/** Pro badge lifecycle: apply → platform admin review → approved. */
export type ProBadgeStatus = 'none' | 'pending' | 'approved';

// ----------------------------------------------------------------------------
// Core profile shapes.
// ----------------------------------------------------------------------------

export interface SportPlayerProfile {
  sportKey: SportKey;
  /** Primary position (canonical, drawn from POSITIONS_BY_SPORT). */
  position: string;
  /** Optional secondary positions — surface as tags. */
  secondaryPositions?: string[];
  /** Years played in this sport. */
  yearsPlaying?: number;
  /** Optional jersey number for this sport. */
  jerseyNumber?: number;
  /** Sport-specific attributes keyed by SPORT_ATTRIBUTE_TEMPLATES field id. */
  attributes?: Record<string, string>;
}

export interface ProfileUser {
  /** Stable ID — matches roster `playerId` so other players can deep-link to
   *  this profile (PlayerProfileScreen). */
  playerId: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  city: string;
  postalCode: string;
  /** Value from GENDER_IDENTITY_OPTIONS, or null when unset. */
  genderIdentity: string | null;
  /** Subscription tier (billing) — unrelated to the Pro player badge. */
  proMember: boolean;
  /** Verified professional-experience badge, admin-approved. */
  proBadge: ProBadgeStatus;
  /** Sports the user plays + their position(s) in each. Drives the sport tab
   *  strip on the profile and the pickers in profile edit.
   *  ALWAYS at least 1 entry; the first entry is treated as primary. */
  sportProfiles: SportPlayerProfile[];
  /** Per-sport participation counts keyed by `SportKey`. */
  participationBySport: Partial<Record<SportKey, SportParticipation>>;
  physical: PlayerPhysicalAttributes;
  experience: ExperienceLevel;
  availability: 'available' | 'looking_for_team' | 'busy';
  availableToSub: boolean;
  certifications: string;
  privateProfile: boolean;
  showStats: boolean;
  showHighlights: boolean;
  showTeams: boolean;
}

export interface ProfileStat {
  id: string;
  value: number;
  label: string;
  Icon: ComponentType<LucideProps>;
  highlight?: boolean;
}

export const PROFILE_USER: ProfileUser = {
  playerId: 'p-sarah',
  name: 'Sarah Jenkins',
  handle: '@jenkins_yeti',
  avatar: SARAH_AVATAR,
  bio: 'Center mid for Avalanche FC. Casual baller. Always up for a Sunday scrimmage.',
  city: 'Denver, CO',
  postalCode: '80205',
  genderIdentity: 'woman',
  proMember: true,
  proBadge: 'none',
  sportProfiles: [
    {
      sportKey: 'soccer',
      position: 'Center Mid',
      secondaryPositions: ['Right Mid'],
      yearsPlaying: 9,
      jerseyNumber: 8,
      attributes: { dominant_foot: 'Right' },
    },
    {
      sportKey: 'volleyball',
      position: 'Setter',
      yearsPlaying: 4,
      attributes: { standing_reach: '7\'2"' },
    },
  ],
  participationBySport: {
    soccer: { gamesPlayed: 42, teamsJoined: 3, campsTrained: 2, leagueSeasons: 5 },
    volleyball: { gamesPlayed: 18, teamsJoined: 1, campsTrained: 1, leagueSeasons: 2 },
  },
  physical: { heightIn: 66, weightLb: 140, wingspanIn: 67 },
  experience: 'intermediate',
  availability: 'available',
  availableToSub: true,
  certifications: 'CPR (2025), USSF Grade 8',
  privateProfile: false,
  showStats: true,
  showHighlights: true,
  showTeams: true,
};

// ----------------------------------------------------------------------------
// Helpers — convenience selectors used across screens.
// ----------------------------------------------------------------------------

export function getSportProfile(
  user: Pick<ProfileUser, 'sportProfiles'>,
  sportKey: SportKey,
): SportPlayerProfile | undefined {
  return user.sportProfiles.find((p) => p.sportKey === sportKey);
}

/** Participation counts rendered via the shared template, in template order.
 *  Returns 0 for sports the player registered for but hasn't played yet. */
export function getParticipationForSport(
  user: Pick<ProfileUser, 'participationBySport'>,
  sportKey: SportKey,
): ProfileStat[] {
  const values = user.participationBySport[sportKey] ?? EMPTY_PARTICIPATION;
  return PARTICIPATION_FIELDS.map((field) => ({
    id: field.id,
    label: field.label.toUpperCase(),
    value: values[field.id] ?? 0,
    Icon: field.Icon,
    highlight: field.primary,
  }));
}

/** Available canonical positions for a sport (search/picker source). */
export function getPositionsForSport(sportKey: SportKey): string[] {
  return POSITIONS_BY_SPORT[sportKey];
}

// ----------------------------------------------------------------------------
// Public player profiles — keyed by `playerId` so that PlayerProfileScreen and
// PlayerDirectory can reference one source of truth.
// ----------------------------------------------------------------------------

export interface PublicPlayerProfile {
  playerId: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  city: string;
  genderIdentity?: string | null;
  sportProfiles: SportPlayerProfile[];
  participationBySport: Partial<Record<SportKey, SportParticipation>>;
  physical: PlayerPhysicalAttributes;
  experience: ExperienceLevel;
  proBadge: ProBadgeStatus;
  /** Governed by the player's own privacy settings. */
  showStats: boolean;
  showHighlights: boolean;
}

export const PUBLIC_PLAYER_PROFILES: Record<string, PublicPlayerProfile> = {
  'p-sarah': {
    playerId: 'p-sarah',
    name: PROFILE_USER.name,
    handle: PROFILE_USER.handle,
    avatar: PROFILE_USER.avatar,
    bio: PROFILE_USER.bio,
    city: PROFILE_USER.city,
    genderIdentity: PROFILE_USER.genderIdentity,
    sportProfiles: PROFILE_USER.sportProfiles,
    participationBySport: PROFILE_USER.participationBySport,
    physical: PROFILE_USER.physical,
    experience: PROFILE_USER.experience,
    proBadge: PROFILE_USER.proBadge,
    showStats: PROFILE_USER.showStats,
    showHighlights: PROFILE_USER.showHighlights,
  },
  'p-marcus': {
    playerId: 'p-marcus',
    name: 'Marcus L.',
    handle: '@marcus_strikes',
    avatar: PLAYER_AVATARS[0]!,
    bio: 'Striker who refuses to come off the front post. Ex-USL two seasons.',
    city: 'Denver, CO',
    sportProfiles: [
      {
        sportKey: 'soccer',
        position: 'Striker',
        yearsPlaying: 12,
        jerseyNumber: 9,
        attributes: { dominant_foot: 'Left' },
      },
    ],
    participationBySport: {
      soccer: { gamesPlayed: 51, teamsJoined: 4, campsTrained: 6, leagueSeasons: 8 },
    },
    physical: { heightIn: 73, weightLb: 178, wingspanIn: 75 },
    experience: 'advanced',
    proBadge: 'approved',
    showStats: true,
    showHighlights: true,
  },
  'p-rio': {
    playerId: 'p-rio',
    name: 'Rio T.',
    handle: '@rio_t',
    avatar: PLAYER_AVATARS[2]!,
    bio: 'Center back. Reads the game three passes ahead.',
    city: 'Denver, CO',
    sportProfiles: [
      {
        sportKey: 'soccer',
        position: 'Center Back',
        secondaryPositions: ['Right Back'],
        yearsPlaying: 7,
      },
    ],
    participationBySport: {
      soccer: { gamesPlayed: 38, teamsJoined: 2, campsTrained: 1, leagueSeasons: 4 },
    },
    physical: { heightIn: 71 },
    experience: 'intermediate',
    proBadge: 'none',
    showStats: true,
    showHighlights: true,
  },
  'p-priya': {
    playerId: 'p-priya',
    name: 'Priya S.',
    handle: '@priya_serves',
    avatar: PLAYER_AVATARS[5]!,
    bio: 'Setter and right mid. Two sports, one warmup.',
    city: 'Boulder, CO',
    genderIdentity: 'woman',
    sportProfiles: [
      {
        sportKey: 'volleyball',
        position: 'Setter',
        yearsPlaying: 11,
        jerseyNumber: 4,
        attributes: { standing_reach: '7\'6"', approach_jump: '9\'0"' },
      },
      { sportKey: 'soccer', position: 'Right Mid', yearsPlaying: 6 },
    ],
    participationBySport: {
      volleyball: { gamesPlayed: 41, teamsJoined: 3, campsTrained: 4, leagueSeasons: 6 },
      soccer: { gamesPlayed: 28, teamsJoined: 1, campsTrained: 0, leagueSeasons: 3 },
    },
    physical: { heightIn: 68, wingspanIn: 70 },
    experience: 'advanced',
    proBadge: 'none',
    showStats: true,
    showHighlights: true,
  },
  'p-leo': {
    playerId: 'p-leo',
    name: 'Leo P.',
    handle: '@leo_p',
    avatar: PLAYER_AVATARS[4]!,
    bio: 'Left wing. Speed first, decisions a close second.',
    city: 'Denver, CO',
    sportProfiles: [
      { sportKey: 'soccer', position: 'Left Wing', yearsPlaying: 5 },
    ],
    participationBySport: {
      soccer: { gamesPlayed: 27, teamsJoined: 2, campsTrained: 1, leagueSeasons: 2 },
    },
    physical: {},
    experience: 'beginner',
    proBadge: 'none',
    showStats: true,
    showHighlights: true,
  },
  'p-ash': {
    playerId: 'p-ash',
    name: 'Ash D.',
    handle: '@ash_d',
    avatar: PLAYER_AVATARS[3]!,
    bio: 'Goalkeeper. Will dive into the next county for a clean sheet.',
    city: 'Denver, CO',
    sportProfiles: [
      {
        sportKey: 'soccer',
        position: 'Goalkeeper',
        yearsPlaying: 14,
        jerseyNumber: 1,
      },
    ],
    participationBySport: {
      soccer: { gamesPlayed: 60, teamsJoined: 5, campsTrained: 8, leagueSeasons: 10 },
    },
    physical: { heightIn: 75, wingspanIn: 79 },
    experience: 'advanced',
    proBadge: 'pending',
    showStats: true,
    showHighlights: false,
  },
  'p-kim': {
    playerId: 'p-kim',
    name: 'Kim H.',
    handle: '@kim_h',
    avatar: PLAYER_AVATARS[5]!,
    bio: 'Coach + right back. Loves an overlap.',
    city: 'Boulder, CO',
    sportProfiles: [
      { sportKey: 'soccer', position: 'Right Back', yearsPlaying: 16 },
    ],
    participationBySport: {
      soccer: { gamesPlayed: 44, teamsJoined: 3, campsTrained: 5, leagueSeasons: 9 },
    },
    physical: {},
    experience: 'advanced',
    proBadge: 'none',
    showStats: true,
    showHighlights: false,
  },
  'p-jamie': {
    playerId: 'p-jamie',
    name: 'Jamie R.',
    handle: '@jamie_r',
    avatar: PLAYER_AVATARS[2]!,
    bio: 'Point guard, captain of Summit Hoops. Pass-first always.',
    city: 'Boulder, CO',
    sportProfiles: [
      {
        sportKey: 'basketball',
        position: 'Point Guard',
        yearsPlaying: 10,
        jerseyNumber: 11,
        attributes: { vertical_jump: '26 in', dominant_hand: 'Right' },
      },
    ],
    participationBySport: {
      basketball: { gamesPlayed: 22, teamsJoined: 2, campsTrained: 2, leagueSeasons: 3 },
    },
    physical: { heightIn: 70, weightLb: 165 },
    experience: 'intermediate',
    proBadge: 'none',
    showStats: true,
    showHighlights: true,
  },
  'p-tara': {
    playerId: 'p-tara',
    name: 'Tara V.',
    handle: '@tara_v',
    avatar: PLAYER_AVATARS[7]!,
    bio: 'Right wing on ice. Reformed defenseman.',
    city: 'Anchorage, AK',
    genderIdentity: 'woman',
    sportProfiles: [
      {
        sportKey: 'hockey',
        position: 'Right Wing',
        secondaryPositions: ['Defenseman'],
        yearsPlaying: 12,
        attributes: { shoots: 'Right' },
      },
    ],
    participationBySport: {
      hockey: { gamesPlayed: 33, teamsJoined: 2, campsTrained: 3, leagueSeasons: 5 },
    },
    physical: { heightIn: 67 },
    experience: 'advanced',
    proBadge: 'none',
    showStats: true,
    showHighlights: true,
  },
  'p-bjorn': {
    playerId: 'p-bjorn',
    name: 'Björn K.',
    handle: '@bjorn_k',
    avatar: PLAYER_AVATARS[1]!,
    bio: 'Captain. Center. Cold as the rink. Former SHL depth forward.',
    city: 'Anchorage, AK',
    sportProfiles: [
      {
        sportKey: 'hockey',
        position: 'Center',
        yearsPlaying: 18,
        attributes: { shoots: 'Left' },
      },
    ],
    participationBySport: {
      hockey: { gamesPlayed: 88, teamsJoined: 6, campsTrained: 10, leagueSeasons: 14 },
    },
    physical: { heightIn: 74, weightLb: 205, wingspanIn: 77 },
    experience: 'advanced',
    proBadge: 'approved',
    showStats: true,
    showHighlights: true,
  },
  'p-eli': {
    playerId: 'p-eli',
    name: 'Eli M.',
    handle: '@eli_m',
    avatar: PLAYER_AVATARS[6]!,
    bio: 'Plays two sports — switches sticks for hockey on weekends.',
    city: 'Anchorage, AK',
    sportProfiles: [
      { sportKey: 'hockey', position: 'Defenseman', yearsPlaying: 9 },
      { sportKey: 'soccer', position: 'Goalkeeper', yearsPlaying: 5 },
    ],
    participationBySport: {
      hockey: { gamesPlayed: 44, teamsJoined: 3, campsTrained: 2, leagueSeasons: 6 },
      soccer: { gamesPlayed: 12, teamsJoined: 1, campsTrained: 0, leagueSeasons: 1 },
    },
    physical: {},
    experience: 'intermediate',
    proBadge: 'none',
    showStats: true,
    showHighlights: false,
  },
  'p-coast': {
    playerId: 'p-coast',
    name: 'Coast Squad',
    handle: '@coast_squad',
    avatar: PLAYER_AVATARS[3]!,
    bio: 'Outside hitter. Sand or hardwood, both feel like home.',
    city: 'San Diego, CA',
    sportProfiles: [
      {
        sportKey: 'volleyball',
        position: 'Outside Hitter',
        yearsPlaying: 13,
        attributes: { standing_reach: '8\'0"', approach_jump: '10\'2"' },
      },
    ],
    participationBySport: {
      volleyball: { gamesPlayed: 52, teamsJoined: 4, campsTrained: 5, leagueSeasons: 8 },
    },
    physical: { heightIn: 76, wingspanIn: 80 },
    experience: 'advanced',
    proBadge: 'none',
    showStats: true,
    showHighlights: true,
  },
};

export function getPublicProfile(
  playerId: string,
): PublicPlayerProfile | undefined {
  return PUBLIC_PLAYER_PROFILES[playerId];
}

// ----------------------------------------------------------------------------
// Following. There are no "friends" — players follow other players to get
// notified of their activity. Follow lists are public: anyone can view who a
// player follows. The current user's live follow set is managed by
// `features/follow-store.ts`, seeded from DEFAULT_FOLLOWING.
// ----------------------------------------------------------------------------

/** Players Sarah follows out of the box. */
export const DEFAULT_FOLLOWING: string[] = ['p-marcus', 'p-priya', 'p-jamie'];

/** Public follow lists for other players (playerId → playerIds they follow). */
export const FOLLOWING_BY_PLAYER: Record<string, string[]> = {
  'p-marcus': ['p-sarah', 'p-rio', 'p-ash', 'p-leo'],
  'p-priya': ['p-sarah', 'p-coast'],
  'p-rio': ['p-marcus', 'p-ash'],
  'p-jamie': ['p-sarah'],
  'p-tara': ['p-bjorn', 'p-eli'],
  'p-bjorn': ['p-tara'],
  'p-eli': ['p-bjorn', 'p-tara'],
  'p-ash': ['p-marcus'],
  'p-leo': ['p-marcus', 'p-sarah'],
  'p-kim': [],
  'p-coast': ['p-priya'],
};

// Routes that the More section can deep-link into.
export type ProfileMoreRoute =
  | 'ProfileEdit'
  | 'Schedule'
  | 'Settings'
  | 'Notifications'
  | 'Waivers'
  | 'MyHighlights'
  | 'BookmarkedHighlights'
  | 'Facilities'
  | 'Messages'
  | 'PlayerDirectory';

export interface MoreLink {
  id: string;
  label: string;
  description: string;
  Icon: ComponentType<LucideProps>;
  route: ProfileMoreRoute;
}

// NOTE: "My Bookings" was intentionally removed — space bookings happen inside
// the game creation flow, so players have no standalone booking management.
export const PROFILE_MORE_LINKS: MoreLink[] = [
  {
    id: 'edit',
    label: 'Edit Profile',
    description: 'Bio, position, photo, certifications.',
    Icon: UserCog,
    route: 'ProfileEdit',
  },
  {
    id: 'schedule',
    label: 'My Schedule',
    description: 'Games, camps, and scrimmages you committed to.',
    Icon: CalendarDays,
    route: 'Schedule',
  },
  {
    id: 'highlights',
    label: 'Highlights Studio',
    description: 'Manage your reels and AI clips.',
    Icon: Clapperboard,
    route: 'MyHighlights',
  },
  {
    id: 'bookmarks',
    label: 'Bookmarked Highlights',
    description: 'Reels you saved to watch later.',
    Icon: Bookmark,
    route: 'BookmarkedHighlights',
  },
  {
    id: 'facilities',
    label: 'Facilities',
    description: 'Discover venues near you.',
    Icon: MapPin,
    route: 'Facilities',
  },
  {
    id: 'directory',
    label: 'Player Directory',
    description: 'Find players to invite to your squad.',
    Icon: Users,
    route: 'PlayerDirectory',
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'Chat with teammates and league members.',
    Icon: Mail,
    route: 'Messages',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Activity, invites, and reminders.',
    Icon: Bell,
    route: 'Notifications',
  },
  {
    id: 'waivers',
    label: 'Waivers & Documents',
    description: 'Sign and review participation waivers.',
    Icon: FileText,
    route: 'Waivers',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Privacy, payments, and account.',
    Icon: Settings,
    route: 'Settings',
  },
];

// Notifications (replaces inline activity feed; ProfileTab still surfaces a preview)
export type NotificationType =
  | 'invite'
  | 'reminder'
  | 'highlight'
  | 'payment'
  | 'mention';

export interface AppNotification {
  id: string;
  type: NotificationType;
  Icon: ComponentType<LucideProps>;
  title: string;
  body: string;
  timestamp: string;
  unread: boolean;
  actions?: { id: string; label: string; primary?: boolean }[];
  // For navigation when the row itself is tapped.
  link?:
    | { kind: 'team'; id: string }
    | { kind: 'game'; id: string }
    | { kind: 'highlight'; id: string }
    | { kind: 'payment'; teamId: string }
    | { kind: 'chat'; chatId: string };
}

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'team-invite-strikers',
    type: 'invite',
    Icon: Users,
    title: 'Team Invite: Alpine Strikers',
    body: "You've been invited to join the upcoming winter league. Accept by Friday.",
    timestamp: '2h ago',
    unread: true,
    actions: [
      { id: 'accept', label: 'Accept', primary: true },
      { id: 'decline', label: 'Decline' },
    ],
    link: { kind: 'team', id: 'alpine-strikers' },
  },
  {
    id: 'payment-due-avalanche',
    type: 'payment',
    Icon: Trophy,
    title: 'Payment due — Avalanche FC',
    body: 'Your share of the Mile High Spring fee is $120. Captain has nudged you.',
    timestamp: '5h ago',
    unread: true,
    actions: [{ id: 'pay', label: 'Pay $120', primary: true }],
    link: { kind: 'payment', teamId: 'avalanche-fc' },
  },
  {
    id: 'game-reminder-yetifc',
    type: 'reminder',
    Icon: Bell,
    title: 'Game Reminder',
    body: 'Match against Yeti FC tomorrow at 18:00. Location: Summit Pitch.',
    timestamp: 'Yesterday',
    unread: false,
    link: { kind: 'game', id: 'friday-night-scrimmage' },
  },
  {
    id: 'new-highlight-april-7',
    type: 'highlight',
    Icon: Clapperboard,
    title: 'Highlight Ready',
    body: 'Your Apr 7 game produced 5 clips. Review and post to feed.',
    timestamp: '3d ago',
    unread: false,
    link: { kind: 'highlight', id: 'proj-april-7' },
  },
  {
    id: 'mention-jamie',
    type: 'mention',
    Icon: Mail,
    title: '@jamie_r mentioned you',
    body: '"@jenkins_yeti can you cover Sunday morning?"',
    timestamp: '4d ago',
    unread: false,
    link: { kind: 'chat', chatId: 'chat-summit-hoops' },
  },
];
