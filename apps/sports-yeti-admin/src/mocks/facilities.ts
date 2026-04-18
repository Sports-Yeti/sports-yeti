import type { SportKey } from './leagues';

export interface FacilitySpace {
  id: string;
  facilityId: string;
  name: string;
  surface: string;
  capacity: number;
  hourlyRateCents: number;
  isIndoor: boolean;
  sportKeys: SportKey[];
}

export interface Facility {
  id: string;
  name: string;
  city: string;
  address: string;
  cover: string;
  sports: SportKey[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  hoursLabel: string;
  isActive: boolean;
  spaces: FacilitySpace[];
}

export const FACILITIES: Facility[] = [
  {
    id: 'facility-yeti-center',
    name: 'Yeti Center',
    city: 'Denver, CO',
    address: '1840 Mile High Loop, Denver, CO',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
    sports: ['soccer'],
    amenities: ['Lights', 'Locker rooms', 'Bathrooms', 'Parking'],
    rating: 4.8,
    reviewCount: 142,
    hoursLabel: 'Open today · 6:00 AM – 11:00 PM',
    isActive: true,
    spaces: [
      {
        id: 'space-yeti-field-a',
        facilityId: 'facility-yeti-center',
        name: 'Field A (Full)',
        surface: 'Turf',
        capacity: 22,
        hourlyRateCents: 18000,
        isIndoor: false,
        sportKeys: ['soccer'],
      },
      {
        id: 'space-yeti-field-b',
        facilityId: 'facility-yeti-center',
        name: 'Field B (Half)',
        surface: 'Turf',
        capacity: 14,
        hourlyRateCents: 9500,
        isIndoor: false,
        sportKeys: ['soccer'],
      },
    ],
  },
  {
    id: 'facility-summit-rec',
    name: 'Summit Rec Center',
    city: 'Boulder, CO',
    address: '320 Mountain Vista Dr, Boulder, CO',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
    sports: ['basketball', 'volleyball'],
    amenities: ['Showers', 'Lockers', 'Scoreboard'],
    rating: 4.6,
    reviewCount: 88,
    hoursLabel: 'Open today · 5:30 AM – 10:00 PM',
    isActive: true,
    spaces: [
      {
        id: 'space-summit-court-1',
        facilityId: 'facility-summit-rec',
        name: 'Court 1',
        surface: 'Hardwood',
        capacity: 10,
        hourlyRateCents: 4500,
        isIndoor: true,
        sportKeys: ['basketball', 'volleyball'],
      },
      {
        id: 'space-summit-court-2',
        facilityId: 'facility-summit-rec',
        name: 'Court 2',
        surface: 'Hardwood',
        capacity: 10,
        hourlyRateCents: 4500,
        isIndoor: true,
        sportKeys: ['basketball', 'volleyball'],
      },
    ],
  },
  {
    id: 'facility-aurora-ice',
    name: 'Aurora Ice',
    city: 'Anchorage, AK',
    address: '410 Glacier Way, Anchorage, AK',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
    sports: ['hockey'],
    amenities: ['Locker rooms', 'Skate sharpening', 'Pro shop'],
    rating: 4.8,
    reviewCount: 98,
    hoursLabel: 'Open today · 6:00 AM – 12:00 AM',
    isActive: true,
    spaces: [
      {
        id: 'space-aurora-rink-a',
        facilityId: 'facility-aurora-ice',
        name: 'Rink A',
        surface: 'Ice',
        capacity: 20,
        hourlyRateCents: 32000,
        isIndoor: true,
        sportKeys: ['hockey'],
      },
      {
        id: 'space-aurora-rink-b',
        facilityId: 'facility-aurora-ice',
        name: 'Rink B',
        surface: 'Ice',
        capacity: 20,
        hourlyRateCents: 32000,
        isIndoor: true,
        sportKeys: ['hockey'],
      },
    ],
  },
  {
    id: 'facility-mission-beach',
    name: 'Mission Beach Courts',
    city: 'San Diego, CA',
    address: 'Belmont Park Promenade, San Diego, CA',
    cover:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=70',
    sports: ['volleyball'],
    amenities: ['Free parking', 'Showers', 'Restrooms'],
    rating: 4.9,
    reviewCount: 210,
    hoursLabel: 'Open today · Sunrise – Sunset',
    isActive: true,
    spaces: [
      {
        id: 'space-mission-court-1',
        facilityId: 'facility-mission-beach',
        name: 'Court 1 (north)',
        surface: 'Sand',
        capacity: 8,
        hourlyRateCents: 0,
        isIndoor: false,
        sportKeys: ['volleyball'],
      },
      {
        id: 'space-mission-court-2',
        facilityId: 'facility-mission-beach',
        name: 'Court 2 (south)',
        surface: 'Sand',
        capacity: 8,
        hourlyRateCents: 0,
        isIndoor: false,
        sportKeys: ['volleyball'],
      },
    ],
  },
  {
    id: 'facility-highland-tennis',
    name: 'Highland Tennis Club',
    city: 'Boulder, CO',
    address: '210 Highland Ridge, Boulder, CO',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
    sports: ['tennis'],
    amenities: ['Lights', 'Pro shop', 'Ball machine'],
    rating: 4.7,
    reviewCount: 64,
    hoursLabel: 'Open today · 7:00 AM – 9:00 PM',
    isActive: true,
    spaces: [
      {
        id: 'space-highland-h1',
        facilityId: 'facility-highland-tennis',
        name: 'Hard Court 1',
        surface: 'Hard',
        capacity: 4,
        hourlyRateCents: 2400,
        isIndoor: false,
        sportKeys: ['tennis'],
      },
      {
        id: 'space-highland-c1',
        facilityId: 'facility-highland-tennis',
        name: 'Clay Court 1',
        surface: 'Clay',
        capacity: 4,
        hourlyRateCents: 3200,
        isIndoor: false,
        sportKeys: ['tennis'],
      },
    ],
  },
];

export function facilityById(id: string): Facility | undefined {
  return FACILITIES.find((f) => f.id === id);
}

export function spaceById(id: string): FacilitySpace | undefined {
  for (const f of FACILITIES) {
    const s = f.spaces.find((sp) => sp.id === id);
    if (s) return s;
  }
  return undefined;
}
