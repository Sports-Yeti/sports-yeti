export interface HighlightReel {
  id: string;
  username: string;
  team: string;
  /** Public profile deep-link + follow target (when the poster is a player). */
  playerId?: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  poster: string;
  videoUrl: string;
  avatar: string;
  durationSeconds: number;
}

// Sample MP4 sources (Google's open test bucket — stable, HTTPS, mobile-friendly).
export const HIGHLIGHT_REELS: HighlightReel[] = [
  {
    id: 'marcus-strikes-bicycle',
    username: '@marcus_strikes',
    team: 'CITY FC ACADEMY',
    playerId: 'p-marcus',
    caption:
      'Unbelievable finish in the 90th minute! The crowd went absolutely wild. Hard work pays off.',
    likes: 12400,
    comments: 342,
    shares: 96,
    poster:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    avatar: 'https://i.pravatar.cc/120?img=58',
    durationSeconds: 15,
  },
  {
    id: 'avalanche-buzzer-beater',
    username: '@avalanche_fc',
    team: 'AVALANCHE FC',
    caption:
      'Buzzer beater from half court to seal the win. Pure chaos on the bench afterward.',
    likes: 8210,
    comments: 198,
    shares: 54,
    poster:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    avatar: 'https://i.pravatar.cc/120?img=22',
    durationSeconds: 15,
  },
  {
    id: 'beach-volley-ace',
    username: '@coast_squad',
    team: 'SUNNY SANDS VBC',
    playerId: 'p-coast',
    caption:
      'Match point ace down the line. Sand, sun and a clutch serve to close it out.',
    likes: 5200,
    comments: 121,
    shares: 33,
    poster:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    videoUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    avatar: 'https://i.pravatar.cc/120?img=33',
    durationSeconds: 60,
  },
];

export interface ReelComment {
  id: string;
  username: string;
  avatar: string;
  body: string;
  timestamp: string;
  likes: number;
}

export const REEL_COMMENTS: Record<string, ReelComment[]> = {
  'marcus-strikes-bicycle': [
    {
      id: 'c-1',
      username: '@coach_t',
      avatar: 'https://i.pravatar.cc/120?img=12',
      body: 'That bicycle kick — clinic. Pin this!',
      timestamp: '2h ago',
      likes: 64,
    },
    {
      id: 'c-2',
      username: '@avalanche_fc',
      avatar: 'https://i.pravatar.cc/120?img=22',
      body: 'Need a striker like this. DM us.',
      timestamp: '1h ago',
      likes: 33,
    },
    {
      id: 'c-3',
      username: '@jenkins_yeti',
      avatar: 'https://i.pravatar.cc/300?img=49',
      body: 'Goosebumps. Was right behind the goal!',
      timestamp: '30m ago',
      likes: 12,
    },
  ],
  'avalanche-buzzer-beater': [
    {
      id: 'c-4',
      username: '@summit_hoops',
      avatar: 'https://i.pravatar.cc/120?img=33',
      body: 'Cold blooded.',
      timestamp: '4h ago',
      likes: 41,
    },
  ],
  'beach-volley-ace': [
    {
      id: 'c-5',
      username: '@coastal_cruisers',
      avatar: 'https://i.pravatar.cc/120?img=47',
      body: 'See you Sunday — rematch?',
      timestamp: '1d ago',
      likes: 8,
    },
  ],
};

export type HighlightProjectStatus =
  | 'pending_payment'
  | 'processing'
  | 'completed'
  | 'failed';

export interface HighlightClip {
  id: string;
  title: string;
  description: string;
  startSeconds: number;
  endSeconds: number;
  excitementScore: number; // 1-5
  thumbnail: string;
  clipUrl: string;
}

export interface HighlightProject {
  id: string;
  title: string;
  status: HighlightProjectStatus;
  createdAt: string; // ISO
  sourceVideoSeconds: number;
  thumbnail: string;
  clipsCount: number;
  errorMessage?: string;
  postedToFeed?: boolean;
  aiSummary?: string;
  clips?: HighlightClip[];
}

export const HIGHLIGHT_PROJECTS: HighlightProject[] = [
  {
    id: 'proj-april-7',
    title: 'Avalanche vs. Knights — Apr 7',
    status: 'completed',
    createdAt: '2026-04-07T20:30:00Z',
    sourceVideoSeconds: 5400,
    thumbnail:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=70',
    clipsCount: 5,
    aiSummary:
      'Five high-energy moments selected: a goal, two saves, a counter-attack, and a celebration.',
    postedToFeed: true,
    clips: [
      {
        id: 'clip-1',
        title: 'Bicycle Kick Goal',
        description: 'Marcus L. finishes a counter-attack with a bicycle kick in the 88th.',
        startSeconds: 5240,
        endSeconds: 5258,
        excitementScore: 5,
        thumbnail:
          'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=70',
        clipUrl: 'https://example.com/clips/avalanche-1.mp4',
      },
      {
        id: 'clip-2',
        title: 'Diving Save',
        description: 'Ash D. tips a curling free kick over the bar.',
        startSeconds: 3120,
        endSeconds: 3134,
        excitementScore: 4,
        thumbnail:
          'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=70',
        clipUrl: 'https://example.com/clips/avalanche-2.mp4',
      },
      {
        id: 'clip-3',
        title: 'Counter-attack Sequence',
        description: '4-pass counter from goalkeeper to top of the box.',
        startSeconds: 4200,
        endSeconds: 4222,
        excitementScore: 4,
        thumbnail:
          'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=70',
        clipUrl: 'https://example.com/clips/avalanche-3.mp4',
      },
    ],
  },
  {
    id: 'proj-april-14',
    title: 'Glacier Knights vs. Tundra — Apr 14',
    status: 'processing',
    createdAt: '2026-04-14T22:10:00Z',
    sourceVideoSeconds: 4200,
    thumbnail:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=70',
    clipsCount: 0,
  },
  {
    id: 'proj-april-1-failed',
    title: 'Pickup at Summit Rec — Apr 1',
    status: 'failed',
    createdAt: '2026-04-01T19:00:00Z',
    sourceVideoSeconds: 1800,
    thumbnail:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=70',
    clipsCount: 0,
    errorMessage: 'Video resolution below 720p — try a higher-quality recording.',
  },
];

export const HIGHLIGHT_PRICE_CENTS = 199;
