export type CampStatus = 'draft' | 'open' | 'closed' | 'completed' | 'cancelled';

export interface Camp {
  id: string;
  name: string;
  sportLabel: string;
  city: string;
  status: CampStatus;
  startIso: string;
  endIso: string;
  feeCents: number;
  registered: number;
  capacity: number;
  ageGroup: string;
  description: string;
  cover: string;
}

export const CAMPS: Camp[] = [
  {
    id: 'camp-summer-soccer',
    name: 'Mile High Summer Soccer Camp',
    sportLabel: 'Soccer · Skills Clinic',
    city: 'Denver, CO',
    status: 'open',
    startIso: '2026-06-15',
    endIso: '2026-06-19',
    feeCents: 28500,
    registered: 22,
    capacity: 32,
    ageGroup: 'U10 – U14',
    description:
      'Five-day skills + scrimmage camp coached by current Avalanche FC players.',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
  },
  {
    id: 'camp-aurora-hockey',
    name: 'Aurora Goalie Intensive',
    sportLabel: 'Hockey · Goalie Specialty',
    city: 'Anchorage, AK',
    status: 'open',
    startIso: '2026-08-12',
    endIso: '2026-08-16',
    feeCents: 64000,
    registered: 8,
    capacity: 12,
    ageGroup: 'U16 – Adult',
    description:
      'Position-specific clinic with two-time pro goalie Tara V. Limited spots.',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
  },
  {
    id: 'camp-mission-volley',
    name: 'Mission Beach Volley Bootcamp',
    sportLabel: 'Volleyball · Beach',
    city: 'San Diego, CA',
    status: 'draft',
    startIso: '2026-07-08',
    endIso: '2026-07-10',
    feeCents: 18000,
    registered: 0,
    capacity: 24,
    ageGroup: 'Open',
    description:
      'Three-day beach bootcamp covering serve, dig, and rotation patterns.',
    cover:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=70',
  },
  {
    id: 'camp-summit-hoops',
    name: 'Summit Hoops Holiday Camp',
    sportLabel: 'Basketball · Skills',
    city: 'Boulder, CO',
    status: 'closed',
    startIso: '2025-12-26',
    endIso: '2025-12-30',
    feeCents: 22000,
    registered: 30,
    capacity: 30,
    ageGroup: 'U12 – U16',
    description: 'Sold out. Returning Dec 2026.',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
  },
];

export function campById(id: string): Camp | undefined {
  return CAMPS.find((c) => c.id === id);
}

export const STATUS_LABEL: Record<CampStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  closed: 'Sold out',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
