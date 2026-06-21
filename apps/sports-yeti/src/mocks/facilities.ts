import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react-native';
import {
  CircleDot,
  Dumbbell,
  Mountain,
  Snowflake,
  Trees,
  Volleyball,
  Waves,
} from 'lucide-react-native';

export type FacilitySportKey =
  | 'soccer'
  | 'basketball'
  | 'volleyball'
  | 'tennis'
  | 'baseball'
  | 'hockey';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Facility {
  id: string;
  name: string;
  city: string;
  distanceMiles: number;
  hours: string;
  cover: string;
  sports: FacilitySportKey[];
  Icon: ComponentType<LucideProps>;
  rating: number;
  reviewCount: number;
  hourlyRateCents: number;
  amenities: string[];
  description: string;
  spaces: { id: string; name: string; surface: string; capacity: number }[];
  coords: GeoPoint;
}

export const FACILITIES: Facility[] = [
  {
    id: 'alpine-turf',
    name: 'Alpine Community Turf',
    city: 'Denver, CO',
    distanceMiles: 1.2,
    hours: 'Open today · 6:00 AM – 11:00 PM',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
    sports: ['soccer'],
    Icon: Mountain,
    rating: 4.8,
    reviewCount: 142,
    hourlyRateCents: 9500,
    amenities: ['Lights', 'Bathrooms', 'Parking', 'Locker rooms'],
    description: 'Full-size lit turf with two halves bookable individually. Closed Tue mornings for grooming.',
    spaces: [
      { id: 'alpine-full', name: 'Full Field', surface: 'Turf', capacity: 22 },
      { id: 'alpine-half-a', name: 'Half A', surface: 'Turf', capacity: 14 },
      { id: 'alpine-half-b', name: 'Half B', surface: 'Turf', capacity: 14 },
    ],
    coords: { latitude: 39.7392, longitude: -104.9903 },
  },
  {
    id: 'downtown-rec',
    name: 'Downtown Rec Center',
    city: 'Denver, CO',
    distanceMiles: 3.5,
    hours: 'Open today · 5:30 AM – 10:00 PM',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
    sports: ['basketball', 'volleyball'],
    Icon: Dumbbell,
    rating: 4.6,
    reviewCount: 88,
    hourlyRateCents: 4500,
    amenities: ['Showers', 'Lockers', 'Water', 'Scoreboard'],
    description: 'Indoor double-court gym, hardwood. Volleyball nets on request.',
    spaces: [
      { id: 'rec-court-1', name: 'Court 1', surface: 'Hardwood', capacity: 10 },
      { id: 'rec-court-2', name: 'Court 2', surface: 'Hardwood', capacity: 10 },
    ],
    coords: { latitude: 39.7525, longitude: -105.0007 },
  },
  {
    id: 'sunny-sands',
    name: 'Sunny Sands Park',
    city: 'San Diego, CA',
    distanceMiles: 5.2,
    hours: 'Open today · Sunrise – Sunset',
    cover:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=70',
    sports: ['volleyball'],
    Icon: Waves,
    rating: 4.9,
    reviewCount: 210,
    hourlyRateCents: 0,
    amenities: ['Free', 'Public restrooms', 'Shade'],
    description: 'Public beach courts with first-come-first-served permits. Nets stored on site.',
    spaces: [
      { id: 'sands-court-1', name: 'Court 1 (north)', surface: 'Sand', capacity: 8 },
      { id: 'sands-court-2', name: 'Court 2 (mid)', surface: 'Sand', capacity: 8 },
      { id: 'sands-court-3', name: 'Court 3 (south)', surface: 'Sand', capacity: 8 },
    ],
    coords: { latitude: 32.7693, longitude: -117.2519 },
  },
  {
    id: 'highland-tennis',
    name: 'Highland Tennis Club',
    city: 'Boulder, CO',
    distanceMiles: 2.4,
    hours: 'Open today · 7:00 AM – 9:00 PM',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
    sports: ['tennis'],
    Icon: Trees,
    rating: 4.7,
    reviewCount: 64,
    hourlyRateCents: 2400,
    amenities: ['Lights', 'Pro shop', 'Ball machine'],
    description: 'Six hard courts, two clay. Reservations open 7 days in advance.',
    spaces: [
      { id: 'highland-h1', name: 'Hard Court 1', surface: 'Hard', capacity: 4 },
      { id: 'highland-h2', name: 'Hard Court 2', surface: 'Hard', capacity: 4 },
      { id: 'highland-c1', name: 'Clay Court 1', surface: 'Clay', capacity: 4 },
    ],
    coords: { latitude: 40.018, longitude: -105.2766 },
  },
  {
    id: 'aurora-ice',
    name: 'Aurora Ice',
    city: 'Anchorage, AK',
    distanceMiles: 8.1,
    hours: 'Open today · 6:00 AM – 12:00 AM',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
    sports: ['hockey'],
    Icon: Snowflake,
    rating: 4.8,
    reviewCount: 98,
    hourlyRateCents: 24000,
    amenities: ['Locker rooms', 'Skate sharpening', 'Pro shop'],
    description: 'Twin sheets of ice. NHL regulation. Ice times bookable in 60-min blocks.',
    spaces: [
      { id: 'aurora-rink-a', name: 'Rink A', surface: 'Ice', capacity: 20 },
      { id: 'aurora-rink-b', name: 'Rink B', surface: 'Ice', capacity: 20 },
    ],
    coords: { latitude: 61.2181, longitude: -149.9003 },
  },
  {
    id: 'riverside',
    name: 'Riverside Diamonds',
    city: 'Denver, CO',
    distanceMiles: 4.8,
    hours: 'Open today · 6:00 AM – Dusk',
    cover:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=70',
    sports: ['baseball'],
    Icon: CircleDot,
    rating: 4.5,
    reviewCount: 51,
    hourlyRateCents: 6000,
    amenities: ['Bleachers', 'Pavilion', 'Restrooms'],
    description: 'Three softball diamonds with a pavilion for post-game grilling.',
    spaces: [
      { id: 'riverside-d1', name: 'Diamond 1', surface: 'Dirt', capacity: 18 },
      { id: 'riverside-d2', name: 'Diamond 2', surface: 'Dirt', capacity: 18 },
    ],
    coords: { latitude: 39.7626, longitude: -105.014 },
  },
];

/**
 * Default map center for the Discover radius picker — Denver. The real app
 * will use the device location once granted, but this is the fallback so
 * the map has something to anchor to before permissions are resolved.
 */
export const DEFAULT_MAP_CENTER: GeoPoint = {
  latitude: 39.7392,
  longitude: -104.9903,
};

/**
 * Approximate great-circle distance in miles between two coordinates using
 * the Haversine formula. Sufficient for "show me games within N miles" UX.
 */
export function distanceMilesBetween(a: GeoPoint, b: GeoPoint): number {
  const R = 3958.7613; // earth radius (mi)
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const c =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      sinLon *
      sinLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(c)));
}

export const FACILITY_SPORT_LABEL: Record<FacilitySportKey, string> = {
  soccer: 'Soccer',
  basketball: 'Basketball',
  volleyball: 'Volleyball',
  tennis: 'Tennis',
  baseball: 'Baseball',
  hockey: 'Hockey',
};
