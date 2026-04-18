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

export interface ChatMessage {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  body: string;
  timestamp: string;
  isYou?: boolean;
  reactions?: { emoji: string; count: number }[];
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
