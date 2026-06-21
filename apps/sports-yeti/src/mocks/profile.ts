import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  Activity,
  Bell,
  Bookmark,
  CalendarCheck,
  CalendarDays,
  Clapperboard,
  Crosshair,
  Dumbbell,
  FileText,
  Goal,
  HandMetal,
  Mail,
  MapPin,
  Repeat,
  Settings,
  Shield,
  Snowflake,
  Star,
  Sun,
  Target,
  TrendingUp,
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
// profile, and the per-sport stats panels. Keeping this here (vs teams.ts)
// because it's profile-shaped (icon, color, display name) rather than the
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
// Per-sport stat schema. Each sport defines an ordered list of stat fields so
// we can render consistent cards on both the user's own profile and on a
// public PlayerProfile. The first entry (`primary: true`) is the headline stat
// the player is "known for" in that sport.
// ----------------------------------------------------------------------------

export interface SportStatField {
  id: string;
  label: string;
  Icon: ComponentType<LucideProps>;
  /** Render slightly larger / accented (max 1 per sport). */
  primary?: boolean;
}

export const SPORT_STAT_TEMPLATES: Record<SportKey, SportStatField[]> = {
  soccer: [
    { id: 'goals', label: 'Goals', Icon: Trophy, primary: true },
    { id: 'assists', label: 'Assists', Icon: HandMetal },
    { id: 'games', label: 'Games', Icon: CalendarCheck },
    { id: 'mvp', label: 'MVPs', Icon: Star },
  ],
  basketball: [
    { id: 'ppg', label: 'PPG', Icon: TrendingUp, primary: true },
    { id: 'rpg', label: 'RPG', Icon: Repeat },
    { id: 'apg', label: 'APG', Icon: HandMetal },
    { id: 'games', label: 'Games', Icon: CalendarCheck },
  ],
  volleyball: [
    { id: 'kills', label: 'Kills', Icon: Zap, primary: true },
    { id: 'aces', label: 'Aces', Icon: Target },
    { id: 'blocks', label: 'Blocks', Icon: Shield },
    { id: 'games', label: 'Sets', Icon: CalendarCheck },
  ],
  tennis: [
    { id: 'wins', label: 'Wins', Icon: Trophy, primary: true },
    { id: 'losses', label: 'Losses', Icon: Activity },
    { id: 'aces', label: 'Aces', Icon: Target },
    { id: 'games', label: 'Matches', Icon: CalendarCheck },
  ],
  baseball: [
    { id: 'hits', label: 'Hits', Icon: Target, primary: true },
    { id: 'rbi', label: 'RBI', Icon: TrendingUp },
    { id: 'hr', label: 'HR', Icon: Trophy },
    { id: 'games', label: 'Games', Icon: CalendarCheck },
  ],
  hockey: [
    { id: 'goals', label: 'Goals', Icon: Crosshair, primary: true },
    { id: 'assists', label: 'Assists', Icon: HandMetal },
    { id: 'pim', label: 'PIM', Icon: Dumbbell },
    { id: 'games', label: 'Games', Icon: CalendarCheck },
  ],
};

/** Per-sport stat values keyed by `SportStatField.id`. */
export type SportStats = Record<string, number>;

export interface SportPlayerProfile {
  sportKey: SportKey;
  /** Primary position (canonical, drawn from POSITIONS_BY_SPORT). */
  position: string;
  /** Optional secondary positions — surface as comma-separated tags. */
  secondaryPositions?: string[];
  /** Years played in this sport. */
  yearsPlaying?: number;
  /** Optional jersey number for this sport. */
  jerseyNumber?: number;
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
  proMember: boolean;
  /** Sports the user plays + their position in each. Drives the sport tab
   *  strip on the profile and the position selector in profile edit.
   *  ALWAYS at least 1 entry; the first entry is treated as primary. */
  sportProfiles: SportPlayerProfile[];
  /** Per-sport stats keyed by `SportKey`. May be empty for a sport that the
   *  player has registered for but not yet played a game in. */
  statsBySport: Partial<Record<SportKey, SportStats>>;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'pro';
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

export interface ProfileFriend {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  position: string;
}

export const PROFILE_USER: ProfileUser = {
  playerId: 'p-sarah',
  name: 'Sarah Jenkins',
  handle: '@jenkins_yeti',
  avatar: SARAH_AVATAR,
  bio: 'Center mid for Avalanche FC. Casual baller. Always up for a Sunday scrimmage.',
  city: 'Denver, CO',
  proMember: true,
  sportProfiles: [
    {
      sportKey: 'soccer',
      position: 'Center Mid',
      secondaryPositions: ['Right Mid'],
      yearsPlaying: 9,
      jerseyNumber: 8,
    },
    {
      sportKey: 'volleyball',
      position: 'Setter',
      yearsPlaying: 4,
    },
  ],
  statsBySport: {
    soccer: { goals: 87, assists: 31, games: 42, mvp: 12 },
    volleyball: { kills: 64, aces: 22, blocks: 9, games: 18 },
  },
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

export function getPrimarySport(user: Pick<ProfileUser, 'sportProfiles'>):
  | SportPlayerProfile
  | undefined {
  return user.sportProfiles[0];
}

export function getSportProfile(
  user: Pick<ProfileUser, 'sportProfiles'>,
  sportKey: SportKey,
): SportPlayerProfile | undefined {
  return user.sportProfiles.find((p) => p.sportKey === sportKey);
}

/** Stats rendered using the sport template, in template order. Returns 0 for
 *  fields that aren't present in `statsBySport[sportKey]`. */
export function getStatsForSport(
  user: Pick<ProfileUser, 'statsBySport'>,
  sportKey: SportKey,
): ProfileStat[] {
  const template = SPORT_STAT_TEMPLATES[sportKey];
  const values = user.statsBySport[sportKey] ?? {};
  return template.map((field) => ({
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
// PlayerDirectory can reference one source of truth. We synthesize a basic
// public profile for every player referenced from the directory + roster mocks.
// ----------------------------------------------------------------------------

export interface PublicPlayerProfile {
  playerId: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  city: string;
  sportProfiles: SportPlayerProfile[];
  statsBySport: Partial<Record<SportKey, SportStats>>;
  /** Default privacy: respects current user's `showStats` toggle when this is
   *  the user themselves; for others, governed by their own settings. */
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
    sportProfiles: PROFILE_USER.sportProfiles,
    statsBySport: PROFILE_USER.statsBySport,
    showStats: PROFILE_USER.showStats,
    showHighlights: PROFILE_USER.showHighlights,
  },
  'p-marcus': {
    playerId: 'p-marcus',
    name: 'Marcus L.',
    handle: '@marcus_strikes',
    avatar: PLAYER_AVATARS[0]!,
    bio: 'Striker who refuses to come off the front post.',
    city: 'Denver, CO',
    sportProfiles: [
      { sportKey: 'soccer', position: 'Striker', yearsPlaying: 12, jerseyNumber: 9 },
    ],
    statsBySport: {
      soccer: { goals: 134, assists: 22, games: 51, mvp: 18 },
    },
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
      { sportKey: 'soccer', position: 'Center Back', secondaryPositions: ['Right Back'], yearsPlaying: 7 },
    ],
    statsBySport: {
      soccer: { goals: 4, assists: 11, games: 38, mvp: 5 },
    },
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
    sportProfiles: [
      { sportKey: 'volleyball', position: 'Setter', yearsPlaying: 11, jerseyNumber: 4 },
      { sportKey: 'soccer', position: 'Right Mid', yearsPlaying: 6 },
    ],
    statsBySport: {
      volleyball: { kills: 142, aces: 38, blocks: 27, games: 41 },
      soccer: { goals: 17, assists: 20, games: 28, mvp: 4 },
    },
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
    statsBySport: {
      soccer: { goals: 24, assists: 16, games: 27, mvp: 3 },
    },
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
      { sportKey: 'soccer', position: 'Goalkeeper', yearsPlaying: 14, jerseyNumber: 1 },
    ],
    statsBySport: {
      soccer: { goals: 0, assists: 1, games: 60, mvp: 22 },
    },
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
    statsBySport: {
      soccer: { goals: 6, assists: 9, games: 44, mvp: 8 },
    },
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
      { sportKey: 'basketball', position: 'Point Guard', yearsPlaying: 10, jerseyNumber: 11 },
    ],
    statsBySport: {
      basketball: { ppg: 14, rpg: 4, apg: 9, games: 22 },
    },
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
    sportProfiles: [
      { sportKey: 'hockey', position: 'Right Wing', secondaryPositions: ['Defenseman'], yearsPlaying: 12 },
    ],
    statsBySport: {
      hockey: { goals: 28, assists: 41, pim: 18, games: 33 },
    },
    showStats: true,
    showHighlights: true,
  },
  'p-bjorn': {
    playerId: 'p-bjorn',
    name: 'Björn K.',
    handle: '@bjorn_k',
    avatar: PLAYER_AVATARS[1]!,
    bio: 'Captain. Center. Cold as the rink.',
    city: 'Anchorage, AK',
    sportProfiles: [
      { sportKey: 'hockey', position: 'Center', yearsPlaying: 18 },
    ],
    statsBySport: {
      hockey: { goals: 64, assists: 78, pim: 42, games: 88 },
    },
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
    statsBySport: {
      hockey: { goals: 11, assists: 33, pim: 24, games: 44 },
      soccer: { goals: 0, assists: 0, games: 12, mvp: 2 },
    },
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
      { sportKey: 'volleyball', position: 'Outside Hitter', yearsPlaying: 13 },
    ],
    statsBySport: {
      volleyball: { kills: 211, aces: 47, blocks: 18, games: 52 },
    },
    showStats: true,
    showHighlights: true,
  },
};

export function getPublicProfile(
  playerId: string,
): PublicPlayerProfile | undefined {
  return PUBLIC_PLAYER_PROFILES[playerId];
}

export const PROFILE_FRIENDS: ProfileFriend[] = PLAYER_AVATARS.slice(0, 6).map(
  (avatar, idx) => ({
    id: `friend-${idx}`,
    name: ['Marcus L.', 'Rio T.', 'Jamie R.', 'Coast Squad', 'Leo P.', 'Priya S.'][idx]!,
    handle: ['@marcus_strikes', '@rio_t', '@jamie_r', '@coast_squad', '@leo_p', '@priya_serves'][idx]!,
    avatar,
    position: ['Striker', 'Center Back', 'Point Guard', 'Setter', 'Left Wing', 'Setter'][idx]!,
  }),
);

export const PROFILE_MUTUAL_COUNT = 14;

// Routes that the More section can deep-link into.
export type ProfileMoreRoute =
  | 'ProfileEdit'
  | 'Schedule'
  | 'Settings'
  | 'Notifications'
  | 'Waivers'
  | 'MyHighlights'
  | 'BookmarkedHighlights'
  | 'Bookings'
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
    id: 'bookings',
    label: 'My Bookings',
    description: 'Court and field reservations.',
    Icon: CalendarCheck,
    route: 'Bookings',
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
