export interface HighlightReel {
  id: string;
  username: string;
  team: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  poster: string;
  avatar: string;
}

export const HIGHLIGHT_REELS: HighlightReel[] = [
  {
    id: 'marcus-strikes-bicycle',
    username: '@marcus_strikes',
    team: 'CITY FC ACADEMY',
    caption:
      'Unbelievable finish in the 90th minute! The crowd went absolutely wild. Hard work pays off.',
    likes: 12400,
    comments: 342,
    shares: 96,
    poster:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',
    avatar: 'https://i.pravatar.cc/120?img=58',
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
    avatar: 'https://i.pravatar.cc/120?img=22',
  },
  {
    id: 'beach-volley-ace',
    username: '@coast_squad',
    team: 'SUNNY SANDS VBC',
    caption:
      'Match point ace down the line. Sand, sun and a clutch serve to close it out.',
    likes: 5200,
    comments: 121,
    shares: 33,
    poster:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    avatar: 'https://i.pravatar.cc/120?img=33',
  },
];
