import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  CalendarClock,
  Flame,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react-native';
import { PLAYER_AVATARS } from './avatars';
import type { SportKey } from './teams';

// ----------------------------------------------------------------------------
// News feed mock data. Powers the consumer-facing News tab. Three content
// streams, all sport-tagged so the feed can be personalized to the sports a
// user plays:
//   1. SPORTS_NEWS    — editorial stories from sport "wires".
//   2. LEAGUE_PROMOS  — league marketing for upcoming seasons / events.
//   3. MVP_POSTS      — league spotlights on a recent game's standout, with
//                       either a highlight video or a stats poster.
// IDs for `leagueId` map to LEAGUE_DETAILS, `playerId` to PUBLIC_PLAYER_PROFILES,
// and `highlightId` to HIGHLIGHT_REELS so cards can deep-link into real screens.
// ----------------------------------------------------------------------------

/** Build a consistent Unsplash URL so every news image has the same crop. */
function img(id: string): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1000&q=80`;
}

// ---------- Editorial sports news ----------

export type NewsCategory =
  | 'recap'
  | 'transfer'
  | 'community'
  | 'rules'
  | 'gear'
  | 'feature';

export const NEWS_CATEGORY_LABEL: Record<NewsCategory, string> = {
  recap: 'Recap',
  transfer: 'Roster Move',
  community: 'Community',
  rules: 'Rules',
  gear: 'Gear',
  feature: 'Feature',
};

export interface SportsNewsItem {
  id: string;
  sportKey: SportKey;
  category: NewsCategory;
  headline: string;
  summary: string;
  /** Full article copy, one entry per paragraph (rendered on the detail page). */
  body: string[];
  /** Topical hashtags shown on the article detail page. */
  tags: string[];
  /** Publication / wire name shown in the byline. */
  source: string;
  imageUrl: string;
  /** Pre-baked relative label (matches NOTIFICATIONS convention). */
  timeAgo: string;
  readMinutes: number;
}

/** Content streams a reader can filter the feed down to. */
export type NewsContentType = 'story' | 'mvp' | 'promo';

export const NEWS_CONTENT_TYPE_LABEL: Record<NewsContentType, string> = {
  story: 'Stories',
  mvp: 'MVP moments',
  promo: 'League promos',
};

export const SPORTS_NEWS: SportsNewsItem[] = [
  {
    id: 'news-soccer-tactics',
    sportKey: 'soccer',
    category: 'feature',
    headline: 'Why 7v7 leagues are quietly becoming the best soccer in the city',
    summary:
      'Smaller sides, more touches, and a faster game. Coaches explain why the rec scene is where the most fun development is happening this summer.',
    body: [
      'Walk past any turf field on a summer evening and you will find the same thing: small-sided games, end to end, with nearly every player involved in nearly every possession. The 7v7 format has quietly become the most-played version of the game in the city.',
      'Coaches argue that compressing the full game into tighter spaces sharpens the parts of soccer that matter most in rec play — first touch, quick decisions, and constant communication. "You cannot hide on a 7v7 pitch," one Mile High coach told us. "Every player is two passes from the ball at all times."',
      'For players returning after years away, the format is also more forgiving on the body: shorter sprints, more frequent subs, and a game that rewards smarts over raw fitness.',
    ],
    tags: ['7v7', 'development', 'summer'],
    source: 'The Touchline',
    imageUrl: img('1551958219-acbc608c6377'),
    timeAgo: '5h ago',
    readMinutes: 4,
  },
  {
    id: 'news-soccer-recap',
    sportKey: 'soccer',
    category: 'recap',
    headline: 'Glacier Knights stay perfect after late winner over Cherry Creek',
    summary:
      'A stoppage-time strike keeps the reigning champions unbeaten and tightens the race at the top of the Mile High table.',
    body: [
      'Cherry Creek United looked the better side for an hour, pressing high and forcing turnovers in the Glacier Knights half. But a scramble in the box fell to the Knights captain in the 88th minute, and the league leaders escaped with all three points.',
      'The win keeps Glacier Knights unbeaten on the season and extends their lead at the top of the Mile High table. Cherry Creek, meanwhile, drop to third after a result that will sting given how the match unfolded.',
      'The two sides could meet again in the playoff bracket, and on this evidence, that would be a tie worth the price of admission.',
    ],
    tags: ['recap', 'glacier-knights', 'mile-high'],
    source: 'Yeti Wire',
    imageUrl: img('1431324155629-1a6deb1dec8d'),
    timeAgo: '1d ago',
    readMinutes: 3,
  },
  {
    id: 'news-volley-rules',
    sportKey: 'volleyball',
    category: 'rules',
    headline: 'New let-serve rule lands for beach 4v4 — here is what changes',
    summary:
      'Officials roll out the updated scoring guidance ahead of the Coastal Open. Most players will not notice, but servers should.',
    body: [
      'Starting this season, a serve that clips the net and lands in is fully live — no replays, no exceptions. Officials say the change speeds up matches and removes one of the most common points of dispute in rec play.',
      'For most players the update will be invisible. Servers, though, may want to rethink aggressive net-skimming serves: what used to be a free redo is now a live ball that opponents are coached to pounce on.',
    ],
    tags: ['rules', 'beach', 'coastal-open'],
    source: 'Net Report',
    imageUrl: img('1612872087720-bb876e2e67d1'),
    timeAgo: '2d ago',
    readMinutes: 2,
  },
  {
    id: 'news-volley-community',
    sportKey: 'volleyball',
    category: 'community',
    headline: 'Sunset clinics return: free Tuesday volleyball coaching for all levels',
    summary:
      'Local clubs partner to keep the courts busy through the off-season with drop-in sessions and beginner-friendly drills.',
    body: [
      'The Sunset clinics are back, and this year they are free for anyone with a pair of court shoes. Local clubs have partnered to keep the courts busy through the off-season, and the early sign-up numbers suggest demand is high.',
      'Sessions run every Tuesday evening, with separate stations for first-timers and returning players. Organizers say the goal is simple: lower the barrier to getting on a court and let the sport do the rest.',
    ],
    tags: ['community', 'clinic', 'free'],
    source: 'Net Report',
    imageUrl: img('1592656094267-764a45160876'),
    timeAgo: '4d ago',
    readMinutes: 2,
  },
  {
    id: 'news-hoops-transfer',
    sportKey: 'basketball',
    category: 'transfer',
    headline: 'Summit Hoops add a sharpshooter ahead of Rocky Rec tip-off',
    summary:
      'The pickup gives Jamie R. a genuine catch-and-shoot threat and reshapes one of the title favorites in the rec division.',
    body: [
      'Summit Hoops have added a knockdown shooter just in time for the Rocky Rec tip-off, a move that reshapes one of the division favorites before a ball has even been thrown up.',
      'Jamie R., already among the league leaders in assists, now has a genuine catch-and-shoot threat to find on the perimeter. Defenses that sagged off Summit last season will have to make a choice — and that choice tends to open up everything else.',
    ],
    tags: ['roster-move', 'summit-hoops', 'rocky-rec'],
    source: 'Hardwood Weekly',
    imageUrl: img('1546519638-68e109498ffc'),
    timeAgo: '5d ago',
    readMinutes: 3,
  },
  {
    id: 'news-hockey-feature',
    sportKey: 'hockey',
    category: 'feature',
    headline: 'Inside Aurora Fall D2: the most competitive rec ice in the north',
    summary:
      'Twelve teams, real officials, and locker-room banter that rivals the pros. We profile the league everyone wants into.',
    body: [
      'Twelve teams, certified officials, and a level of organization that punches well above the word "rec." Aurora Fall D2 has built a reputation as the most competitive ice in the north, and it now runs a waitlist most seasons.',
      'We spent a week around the rink to understand the draw. The answer was less about the hockey and more about the culture: tight scheduling, real stakes in the standings, and a locker-room banter that keeps players coming back long after their competitive days "ended."',
    ],
    tags: ['feature', 'aurora-fall', 'd2'],
    source: 'Blue Line',
    imageUrl: img('1580748141549-71748dbe0bdc'),
    timeAgo: '6d ago',
    readMinutes: 5,
  },
  {
    id: 'news-tennis-gear',
    sportKey: 'tennis',
    category: 'gear',
    headline: 'Stringing for spin: a simple guide for league doubles players',
    summary:
      'Tension, gauge, and pattern — three small choices that change how your shots behave on humid summer nights.',
    body: [
      'Three small choices — tension, gauge, and string pattern — quietly shape how every ball comes off your racquet. For league doubles players, getting them right is the cheapest performance upgrade available.',
      'Most rec players over-tension, chasing control they do not need and losing the easy depth and spin a slightly looser string bed provides. On humid summer nights, when the ball sits up and balls fly, a few pounds of tension can be the difference between a put-away and a sailed volley.',
    ],
    tags: ['gear', 'stringing', 'doubles'],
    source: 'Baseline',
    imageUrl: img('1554068865-24cecd4e34b8'),
    timeAgo: '1w ago',
    readMinutes: 4,
  },
  {
    id: 'news-baseball-recap',
    sportKey: 'baseball',
    category: 'recap',
    headline: 'Walk-off in the rain caps a wild opening weekend',
    summary:
      'Bases loaded, full count, and a single up the middle. The new season could not have asked for a better first chapter.',
    body: [
      'Bases loaded, full count, rain coming down sideways. The kind of moment that decides whether a season starts with a story or a shrug.',
      'A single up the middle settled it, and the dugout emptied into the puddles. It was the kind of finish that makes the long drive to the diamond worth it — and a reminder of why opening weekend is everyone\u2019s favorite.',
    ],
    tags: ['recap', 'walk-off', 'opening-weekend'],
    source: 'Sandlot',
    imageUrl: img('1508344928928-7165b67de128'),
    timeAgo: '1w ago',
    readMinutes: 2,
  },
];

// ---------- League promotions ----------

export interface LeaguePromo {
  id: string;
  /** Resolves to a LeagueDetails route. */
  leagueId: string;
  sportKey: SportKey;
  /** Short uppercase eyebrow, e.g. "REGISTRATION OPEN". */
  kicker: string;
  title: string;
  blurb: string;
  imageUrl: string;
  ctaLabel: string;
  /** A single punchy detail: deadline, start date, or early-bird offer. */
  highlight: string;
  Icon: ComponentType<LucideProps>;
  tone: 'brand' | 'warning';
}

export const LEAGUE_PROMOS: LeaguePromo[] = [
  {
    id: 'promo-mile-high-summer',
    leagueId: 'mile-high-summer',
    sportKey: 'soccer',
    kicker: 'Registration open',
    title: 'Mile High Summer League',
    blurb:
      'Eight weeks of Sunday-morning 7v7 at the Yeti Center, capped by a playoff weekend. Certified refs, match balls, nine games guaranteed.',
    imageUrl: img('1574629810360-7efbbe195018'),
    ctaLabel: 'View league',
    highlight: 'Closes Apr 30 · 4 spots left',
    Icon: Trophy,
    tone: 'brand',
  },
  {
    id: 'promo-coastal-volley',
    leagueId: 'coastal-volley',
    sportKey: 'volleyball',
    kicker: 'Early-bird pricing',
    title: 'Coastal Volley Open',
    blurb:
      'Six Sundays of beach 4v4. Nets, balls, and shade tents provided — just bring sunscreen and a serve.',
    imageUrl: img('1612872087720-bb876e2e67d1'),
    ctaLabel: 'View league',
    highlight: 'Save $40 before May 1',
    Icon: Sparkles,
    tone: 'brand',
  },
  {
    id: 'promo-aurora-fall',
    leagueId: 'aurora-fall',
    sportKey: 'hockey',
    kicker: 'Filling fast',
    title: 'Aurora Fall Hockey D2',
    blurb:
      'Twelve-game regular season plus best-of-three playoffs. Officials and locker rooms included.',
    imageUrl: img('1580748141549-71748dbe0bdc'),
    ctaLabel: 'View league',
    highlight: 'Only 1 team spot remaining',
    Icon: Flame,
    tone: 'warning',
  },
  {
    id: 'promo-rocky-rec-hoops',
    leagueId: 'rocky-rec-hoops',
    sportKey: 'basketball',
    kicker: 'New season',
    title: 'Rocky Rec Hoops',
    blurb:
      'Ten-week co-ed 5v5 at Summit Rec Center. Tuesday and Thursday nights under the lights.',
    imageUrl: img('1577471488278-16eec37ffcc7'),
    ctaLabel: 'View league',
    highlight: 'Starts Jul 8 · Closes Jun 20',
    Icon: Megaphone,
    tone: 'brand',
  },
];

// ---------- MVP / player-of-the-game spotlights ----------

export interface MvpStat {
  label: string;
  value: string;
}

export type MvpMedia =
  | {
      kind: 'video';
      /** Resolves to a HighlightDetail route. */
      highlightId: string;
      poster: string;
      durationLabel: string;
    }
  | { kind: 'poster'; imageUrl: string };

export interface MvpPost {
  id: string;
  sportKey: SportKey;
  /** Resolves to a LeagueDetails route when present. */
  leagueId?: string;
  leagueName: string;
  /** Resolves to a PlayerProfile route when present. */
  playerId?: string;
  playerName: string;
  playerAvatar: string;
  teamName: string;
  /** Final line / matchup, e.g. "Avalanche FC 3 – 2 Glacier Knights". */
  gameLabel: string;
  /** Award label, e.g. "Match MVP" or "Player of the Week". */
  award: string;
  blurb: string;
  stats: MvpStat[];
  media: MvpMedia;
  /** Pre-baked relative label (matches NOTIFICATIONS convention). */
  timeAgo: string;
}

export const MVP_POSTS: MvpPost[] = [
  {
    id: 'mvp-marcus-bicycle',
    sportKey: 'soccer',
    leagueId: 'mile-high-summer',
    leagueName: 'Mile High Summer League',
    playerId: 'p-marcus',
    playerName: 'Marcus L.',
    playerAvatar: PLAYER_AVATARS[0]!,
    teamName: 'City FC Academy',
    gameLabel: 'City FC 3 – 2 Highland Strikers',
    award: 'Match MVP',
    blurb:
      'A 90th-minute bicycle kick to win it. The kind of finish that ends up on every feed in the league.',
    stats: [
      { label: 'Goals', value: '2' },
      { label: 'Assists', value: '1' },
      { label: 'Shots', value: '6' },
    ],
    media: {
      kind: 'video',
      highlightId: 'marcus-strikes-bicycle',
      poster: img('1551958219-acbc608c6377'),
      durationLabel: '0:15',
    },
    timeAgo: '3h ago',
  },
  {
    id: 'mvp-coast-ace',
    sportKey: 'volleyball',
    leagueId: 'coastal-volley',
    leagueName: 'Coastal Volley Open',
    playerId: 'p-coast',
    playerName: 'Coast Squad',
    playerAvatar: PLAYER_AVATARS[3]!,
    teamName: 'Sunny Sands VBC',
    gameLabel: 'Sunny Sands def. Pier Pressure 2 – 1',
    award: 'Player of the Week',
    blurb:
      'Closed the match with an ace down the line. Six straight points to seal a comeback set.',
    stats: [
      { label: 'Kills', value: '14' },
      { label: 'Aces', value: '5' },
      { label: 'Digs', value: '11' },
    ],
    media: {
      kind: 'video',
      highlightId: 'beach-volley-ace',
      poster: img('1517649763962-0c623066013b'),
      durationLabel: '1:00',
    },
    timeAgo: '2d ago',
  },
  {
    id: 'mvp-avalanche-poster',
    sportKey: 'soccer',
    leagueId: 'mile-high-summer',
    leagueName: 'Mile High Summer League',
    playerId: 'p-rio',
    playerName: 'Rio T.',
    playerAvatar: PLAYER_AVATARS[2]!,
    teamName: 'Avalanche FC',
    gameLabel: 'Avalanche FC 2 – 0 Sloan Lake SC',
    award: 'Defender of the Week',
    blurb:
      'A clean sheet anchored by Rio reading the game three passes ahead all afternoon.',
    stats: [
      { label: 'Tackles', value: '9' },
      { label: 'Interceptions', value: '6' },
      { label: 'Clearances', value: '12' },
    ],
    media: {
      kind: 'poster',
      imageUrl: img('1517466787929-bc90951d0974'),
    },
    timeAgo: '3d ago',
  },
  {
    id: 'mvp-bjorn-poster',
    sportKey: 'hockey',
    leagueId: 'aurora-fall',
    leagueName: 'Aurora Fall Hockey D2',
    playerId: 'p-bjorn',
    playerName: 'Björn K.',
    playerAvatar: PLAYER_AVATARS[1]!,
    teamName: 'Tundra Wolves',
    gameLabel: 'Tundra Wolves 4 – 3 Frost Giants (OT)',
    award: 'Match MVP',
    blurb:
      'Captained the overtime comeback with two goals in the third and the game-winner in OT.',
    stats: [
      { label: 'Goals', value: '3' },
      { label: 'Assists', value: '1' },
      { label: 'Shots', value: '8' },
    ],
    media: {
      kind: 'poster',
      imageUrl: img('1580748141549-71748dbe0bdc'),
    },
    timeAgo: '5d ago',
  },
  {
    id: 'mvp-jamie-poster',
    sportKey: 'basketball',
    leagueId: 'rocky-rec-hoops',
    leagueName: 'Rocky Rec Hoops',
    playerId: 'p-jamie',
    playerName: 'Jamie R.',
    playerAvatar: PLAYER_AVATARS[2]!,
    teamName: 'Summit Hoops',
    gameLabel: 'Summit Hoops 78 – 71 Boulder Blitz',
    award: 'Player of the Week',
    blurb:
      'A pass-first masterclass: nine dimes and a fourth-quarter takeover to close it out.',
    stats: [
      { label: 'Points', value: '21' },
      { label: 'Assists', value: '9' },
      { label: 'Steals', value: '4' },
    ],
    media: {
      kind: 'poster',
      imageUrl: img('1577471488278-16eec37ffcc7'),
    },
    timeAgo: '1w ago',
  },
];

// ----------------------------------------------------------------------------
// Comments — community discussion seeded per article. The live timeline is
// owned by the news-comments store (which seeds from this map and appends new
// comments), mirroring how saved-highlights seeds from REEL_COMMENTS.
// ----------------------------------------------------------------------------

export interface NewsComment {
  id: string;
  authorName: string;
  authorHandle: string;
  avatar: string;
  body: string;
  timeAgo: string;
  likes: number;
}

export const NEWS_COMMENT_SEED: Record<string, NewsComment[]> = {
  'news-soccer-tactics': [
    {
      id: 'nc-tactics-1',
      authorName: 'Marcus L.',
      authorHandle: '@marcus_strikes',
      avatar: PLAYER_AVATARS[0]!,
      body: '100%. I get more touches in one 7v7 night than a whole 11v11 weekend.',
      timeAgo: '3h ago',
      likes: 12,
    },
    {
      id: 'nc-tactics-2',
      authorName: 'Kim H.',
      authorHandle: '@kim_h',
      avatar: PLAYER_AVATARS[5]!,
      body: 'As a coach this is exactly where I see the fastest improvement in new players.',
      timeAgo: '2h ago',
      likes: 8,
    },
    {
      id: 'nc-tactics-3',
      authorName: 'Rio T.',
      authorHandle: '@rio_t',
      avatar: PLAYER_AVATARS[2]!,
      body: 'Smaller pitch punishes lazy positioning. Love it.',
      timeAgo: '1h ago',
      likes: 5,
    },
  ],
  'news-soccer-recap': [
    {
      id: 'nc-recap-1',
      authorName: 'Priya S.',
      authorHandle: '@priya_serves',
      avatar: PLAYER_AVATARS[5]!,
      body: 'That 88th minute though. Heartbreak for Creek.',
      timeAgo: '20h ago',
      likes: 9,
    },
    {
      id: 'nc-recap-2',
      authorName: 'Leo P.',
      authorHandle: '@leo_p',
      avatar: PLAYER_AVATARS[4]!,
      body: 'Knights just refuse to lose this year. Scary good.',
      timeAgo: '18h ago',
      likes: 4,
    },
  ],
  'news-volley-rules': [
    {
      id: 'nc-rules-1',
      authorName: 'Coast Squad',
      authorHandle: '@coast_squad',
      avatar: PLAYER_AVATARS[3]!,
      body: 'Finally. The replays were killing the momentum of every rally.',
      timeAgo: '1d ago',
      likes: 7,
    },
  ],
};

// ----------------------------------------------------------------------------
// Selectors — filter each stream to a set of sports. An empty set means
// "no preference" and returns everything (most-recent first).
// ----------------------------------------------------------------------------

function bySport<T extends { sportKey: SportKey }>(
  items: T[],
  sports: SportKey[],
): T[] {
  if (sports.length === 0) return items;
  const set = new Set(sports);
  return items.filter((i) => set.has(i.sportKey));
}

// Each source array is authored newest-first, so filtering preserves order.
export function sportsNewsForSports(sports: SportKey[]): SportsNewsItem[] {
  return bySport(SPORTS_NEWS, sports);
}

export function leaguePromosForSports(sports: SportKey[]): LeaguePromo[] {
  return bySport(LEAGUE_PROMOS, sports);
}

export function mvpPostsForSports(sports: SportKey[]): MvpPost[] {
  return bySport(MVP_POSTS, sports);
}

export function getSportsNewsItem(id: string): SportsNewsItem | undefined {
  return SPORTS_NEWS.find((n) => n.id === id);
}

/** Icon for the tab / empty states. */
export const NEWS_TAB_ICON = Newspaper;
export const NEWS_VERIFIED_ICON = ShieldCheck;
export const NEWS_SCHEDULE_ICON = CalendarClock;
