import type { SportKey } from './leagues';
import { portraitFor } from './avatars';

/**
 * Live operational status for a bookable space.
 * Mirrors the Stitch "Facilities Portfolio" reference (Available /
 * In Use / Maintenance) and the per-court status pills on the
 * "Facilities Management" hero card.
 */
export type SpaceStatus = 'available' | 'in_use' | 'maintenance';

export const SPACE_STATUS_LABEL: Record<SpaceStatus, string> = {
  available: 'Available',
  in_use: 'In Use',
  maintenance: 'Maintenance',
};

export const SPACE_STATUS_TONE: Record<
  SpaceStatus,
  'success' | 'brand' | 'live'
> = {
  available: 'success',
  in_use: 'brand',
  maintenance: 'live',
};

export interface FacilitySpace {
  id: string;
  facilityId: string;
  name: string;
  surface: string;
  capacity: number;
  hourlyRateCents: number;
  isIndoor: boolean;
  sportKeys: SportKey[];
  status: SpaceStatus;
  /** Human-friendly status detail ("Booked: Glaciers Practice"). */
  statusDetail?: string;
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
  /** "Primary Hub" / "Regional Hub" — surfaced on the portfolio card. */
  hubLabel?: string;
  /** % of bookable hours occupied today (0–100). */
  utilizationToday: number;
  /** Facility manager / venue admin avatars (used in the corner stack). */
  managerAvatars: string[];
  /** Extra "+N" count when there are more managers than avatars shown. */
  managerOverflow: number;
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
    hubLabel: 'Primary Hub',
    utilizationToday: 82,
    managerAvatars: [portraitFor(2), portraitFor(7), portraitFor(11)],
    managerOverflow: 0,
    spaces: [
      {
        id: 'space-yeti-field-a',
        facilityId: 'facility-yeti-center',
        name: 'Field A (Full)',
        surface: 'Turf · Full Field',
        capacity: 22,
        hourlyRateCents: 18000,
        isIndoor: false,
        sportKeys: ['soccer'],
        status: 'in_use',
        statusDetail: 'Booked: Avalanche FC scrimmage',
      },
      {
        id: 'space-yeti-field-b',
        facilityId: 'facility-yeti-center',
        name: 'Field B (Half)',
        surface: 'Turf · Half Field',
        capacity: 14,
        hourlyRateCents: 9500,
        isIndoor: false,
        sportKeys: ['soccer'],
        status: 'available',
        statusDetail: 'Open until 11 PM',
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
    hubLabel: 'Regional Hub',
    utilizationToday: 64,
    managerAvatars: [portraitFor(4), portraitFor(9)],
    managerOverflow: 1,
    spaces: [
      {
        id: 'space-summit-court-1',
        facilityId: 'facility-summit-rec',
        name: 'Main Court 1',
        surface: 'Hardwood · Full Court',
        capacity: 10,
        hourlyRateCents: 4500,
        isIndoor: true,
        sportKeys: ['basketball', 'volleyball'],
        status: 'available',
      },
      {
        id: 'space-summit-court-2',
        facilityId: 'facility-summit-rec',
        name: 'Court 2',
        surface: 'Hardwood · Full Court',
        capacity: 10,
        hourlyRateCents: 4500,
        isIndoor: true,
        sportKeys: ['basketball', 'volleyball'],
        status: 'in_use',
        statusDetail: 'Summit Hoops practice',
      },
      {
        id: 'space-summit-studio-a',
        facilityId: 'facility-summit-rec',
        name: 'Studio A',
        surface: 'Dance / Yoga',
        capacity: 12,
        hourlyRateCents: 3500,
        isIndoor: true,
        sportKeys: ['basketball'],
        status: 'maintenance',
        statusDetail: 'HVAC repair until Apr 22',
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
    hubLabel: 'Northern Hub',
    utilizationToday: 71,
    managerAvatars: [portraitFor(13), portraitFor(18)],
    managerOverflow: 0,
    spaces: [
      {
        id: 'space-aurora-rink-a',
        facilityId: 'facility-aurora-ice',
        name: 'Rink A',
        surface: 'Ice · Full Sheet',
        capacity: 20,
        hourlyRateCents: 32000,
        isIndoor: true,
        sportKeys: ['hockey'],
        status: 'in_use',
        statusDetail: 'Glacier Knights practice',
      },
      {
        id: 'space-aurora-rink-b',
        facilityId: 'facility-aurora-ice',
        name: 'Rink B',
        surface: 'Ice · Full Sheet',
        capacity: 20,
        hourlyRateCents: 32000,
        isIndoor: true,
        sportKeys: ['hockey'],
        status: 'available',
        statusDetail: 'Open until midnight',
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
    hubLabel: 'Coastal Hub',
    utilizationToday: 38,
    managerAvatars: [portraitFor(21)],
    managerOverflow: 0,
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
        status: 'available',
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
        status: 'in_use',
        statusDetail: 'Coastal Cruisers open play',
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
    hubLabel: 'Front Range Hub',
    utilizationToday: 55,
    managerAvatars: [portraitFor(15), portraitFor(23)],
    managerOverflow: 0,
    spaces: [
      {
        id: 'space-highland-h1',
        facilityId: 'facility-highland-tennis',
        name: 'Hard Court 1',
        surface: 'Hard · Outdoor',
        capacity: 4,
        hourlyRateCents: 2400,
        isIndoor: false,
        sportKeys: ['tennis'],
        status: 'available',
      },
      {
        id: 'space-highland-c1',
        facilityId: 'facility-highland-tennis',
        name: 'Clay Court 1',
        surface: 'Clay · Outdoor',
        capacity: 4,
        hourlyRateCents: 3200,
        isIndoor: false,
        sportKeys: ['tennis'],
        status: 'maintenance',
        statusDetail: 'Resurfacing through Apr 25',
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
