import { PLAYER_AVATARS, SARAH_AVATAR } from './avatars';

export type ChatKind = 'team' | 'direct' | 'event';

export interface ChatPreview {
  id: string;
  kind: ChatKind;
  title: string;
  subtitle?: string;
  avatar: string;
  lastMessage: string;
  lastSenderName: string;
  lastTimestamp: string;
  unreadCount: number;
  online?: boolean;
  muted?: boolean;
}

export const CHATS: ChatPreview[] = [
  {
    id: 'chat-avalanche-fc',
    kind: 'team',
    title: 'Avalanche FC',
    subtitle: '6 members',
    avatar: PLAYER_AVATARS[0]!,
    lastMessage: "Marcus L.: Anyone want to grab post-game beers Sunday?",
    lastSenderName: 'Marcus L.',
    lastTimestamp: '2m ago',
    unreadCount: 3,
    online: true,
  },
  {
    id: 'chat-summit-hoops',
    kind: 'team',
    title: 'Summit Hoops',
    subtitle: '4 members',
    avatar: PLAYER_AVATARS[2]!,
    lastMessage: 'Jamie R.: @jenkins_yeti can you cover Sunday morning?',
    lastSenderName: 'Jamie R.',
    lastTimestamp: '4d ago',
    unreadCount: 1,
  },
  {
    id: 'chat-mile-high-warriors',
    kind: 'team',
    title: 'Mile High Warriors',
    subtitle: 'Captain · 6 members',
    avatar: PLAYER_AVATARS[0]!,
    lastMessage: 'You: I shared the Mile High Summer League — vote in the poll 👇',
    lastSenderName: 'Sarah Jenkins',
    lastTimestamp: '2d ago',
    unreadCount: 0,
  },
  {
    id: 'chat-coastal-cruisers',
    kind: 'team',
    title: 'Coastal Cruisers',
    subtitle: 'Captain · 3 members',
    avatar: PLAYER_AVATARS[3]!,
    lastMessage: 'Coast Squad: Surf was glassy — see y\'all Sunday.',
    lastSenderName: 'Coast Squad',
    lastTimestamp: '1d ago',
    unreadCount: 0,
  },
  {
    id: 'chat-marcus-dm',
    kind: 'direct',
    title: 'Marcus L.',
    subtitle: '@marcus_strikes',
    avatar: PLAYER_AVATARS[0]!,
    lastMessage: 'You: nice goal yesterday',
    lastSenderName: 'You',
    lastTimestamp: 'Yesterday',
    unreadCount: 0,
    online: true,
  },
  {
    id: 'chat-friday-night',
    kind: 'event',
    title: 'Friday Night Scrimmage',
    subtitle: 'Event chat · 12 going',
    avatar:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=240&q=80',
    lastMessage: 'Coast Squad: Carpool from 7-Eleven, leaving 6:30',
    lastSenderName: 'Coast Squad',
    lastTimestamp: '1h ago',
    unreadCount: 2,
  },
];

export type ChatCardKind = 'league_share' | 'commit_poll';

export interface LeagueShareCard {
  kind: 'league_share';
  leagueId: string;
  leagueName: string;
  sport: string;
  city: string;
  startDate: string;
  registrationCloses: string;
  feeCents: number;
  maxTeams: number;
  registeredTeams: number;
}

export interface CommitPollCard {
  kind: 'commit_poll';
  pollId: string;
  leagueId: string;
  leagueName: string;
  question: string;
  closesAt?: string;
}

export type ChatCard = LeagueShareCard | CommitPollCard;

export interface ChatMessage {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  body: string;
  timestamp: string;
  isYou?: boolean;
  reactions?: { emoji: string; count: number }[];
  /** Optional rich card attached to the message — rendered below the bubble. */
  card?: ChatCard;
}

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'chat-avalanche-fc': [
    {
      id: 'm-1',
      authorName: 'Marcus L.',
      authorHandle: '@marcus_strikes',
      authorAvatar: PLAYER_AVATARS[0]!,
      body: 'Reminder — match against Glacier on Sunday at 10. Be there by 9:30 to warm up.',
      timestamp: 'Wed · 4:12 PM',
    },
    {
      id: 'm-2',
      authorName: 'Rio T.',
      authorHandle: '@rio_t',
      authorAvatar: PLAYER_AVATARS[2]!,
      body: 'Got it. Bringing the cones.',
      timestamp: 'Wed · 4:18 PM',
      reactions: [{ emoji: '👍', count: 3 }],
    },
    {
      id: 'm-3',
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body: "I'll be there. Anyone want to ride together from downtown?",
      timestamp: 'Wed · 4:35 PM',
      isYou: true,
    },
    {
      id: 'm-4',
      authorName: 'Marcus L.',
      authorHandle: '@marcus_strikes',
      authorAvatar: PLAYER_AVATARS[0]!,
      body: 'Anyone want to grab post-game beers Sunday?',
      timestamp: 'Today · 9:20 AM',
    },
  ],
  'chat-summit-hoops': [
    {
      id: 'sh-m-1',
      authorName: 'Jamie R.',
      authorHandle: '@jamie_r',
      authorAvatar: PLAYER_AVATARS[2]!,
      body: '@jenkins_yeti can you cover Sunday morning? Short by one.',
      timestamp: '4d ago',
    },
    {
      id: 'sh-m-2',
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body: "I can! Sub me in if you need.",
      timestamp: '3d ago',
      isYou: true,
    },
  ],
  'chat-mile-high-warriors': [
    {
      id: 'mhw-c-1',
      authorName: 'Marcus L.',
      authorHandle: '@marcus_strikes',
      authorAvatar: PLAYER_AVATARS[0]!,
      body: 'Skipper — what league are we registering for this summer?',
      timestamp: 'Mon · 8:14 PM',
    },
    {
      id: 'mhw-c-2',
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body: "Mile High Summer looks great — co-ed 7v7, Sundays. Take a look:",
      timestamp: '2d ago',
      isYou: true,
      card: {
        kind: 'league_share',
        leagueId: 'mile-high-summer',
        leagueName: 'Mile High Summer League',
        sport: 'Co-ed 7v7 Soccer',
        city: 'Denver, CO',
        startDate: 'Starts May 15',
        registrationCloses: 'Closes Apr 30',
        feeCents: 192000,
        maxTeams: 12,
        registeredTeams: 8,
      },
    },
    {
      id: 'mhw-c-3',
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body: 'Vote so I know if I should submit our registration:',
      timestamp: '2d ago',
      isYou: true,
      card: {
        kind: 'commit_poll',
        pollId: 'poll-mhw-mile-high',
        leagueId: 'mile-high-summer',
        leagueName: 'Mile High Summer League',
        question: 'Can you commit to 8 Sunday matches starting May 15?',
        closesAt: 'Closes Apr 28',
      },
    },
    {
      id: 'mhw-c-4',
      authorName: 'Priya S.',
      authorHandle: '@priya_serves',
      authorAvatar: PLAYER_AVATARS[5]!,
      body: 'Maybe — I have two work trips booked. I\'ll know by Friday.',
      timestamp: '1d ago',
      reactions: [{ emoji: '👀', count: 2 }],
    },
  ],
  'chat-coastal-cruisers': [
    {
      id: 'cc-c-1',
      authorName: 'Coast Squad',
      authorHandle: '@coast_squad',
      authorAvatar: PLAYER_AVATARS[3]!,
      body: 'Surf was glassy — see y\'all Sunday.',
      timestamp: '1d ago',
    },
    {
      id: 'cc-c-2',
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body: 'Bringing the cooler — anyone want a tag-in for Coastal Volley Open?',
      timestamp: '20h ago',
      isYou: true,
    },
  ],
  'chat-marcus-dm': [
    {
      id: 'dm-1',
      authorName: 'Marcus L.',
      authorHandle: '@marcus_strikes',
      authorAvatar: PLAYER_AVATARS[0]!,
      body: 'Yo — saw your highlight from last week. Nice tackle.',
      timestamp: 'Yesterday · 7:14 PM',
    },
    {
      id: 'dm-2',
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body: 'Thanks! Your bicycle kick is unreal — I shared it with the team.',
      timestamp: 'Yesterday · 7:30 PM',
      isYou: true,
    },
    {
      id: 'dm-3',
      authorName: 'Sarah Jenkins',
      authorHandle: '@jenkins_yeti',
      authorAvatar: SARAH_AVATAR,
      body: 'nice goal yesterday',
      timestamp: 'Yesterday · 9:55 PM',
      isYou: true,
    },
  ],
  'chat-friday-night': [
    {
      id: 'fn-1',
      authorName: 'Coast Squad',
      authorHandle: '@coast_squad',
      authorAvatar: PLAYER_AVATARS[3]!,
      body: 'Carpool from 7-Eleven, leaving 6:30',
      timestamp: '1h ago',
      reactions: [{ emoji: '🚗', count: 4 }],
    },
  ],
};
