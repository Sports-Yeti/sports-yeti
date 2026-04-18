export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  facilityId: string;
  facilityName: string;
  spaceName: string;
  city: string;
  startsAt: string; // ISO
  endsAt: string;
  prettyTime: string;
  prettyDate: string;
  status: BookingStatus;
  totalCents: number;
  paidCents: number;
  partySize: number;
  hostName: string;
  hostHandle: string;
  cover: string;
  sport: 'Soccer' | 'Basketball' | 'Volleyball' | 'Tennis' | 'Baseball' | 'Hockey';
  notes?: string;
  qrCode?: string;
}

export const BOOKINGS: Booking[] = [
  {
    id: 'bk-alpine-fri',
    facilityId: 'alpine-turf',
    facilityName: 'Alpine Community Turf',
    spaceName: 'Half A · Turf',
    city: 'Denver, CO',
    startsAt: '2026-04-17T19:00:00-06:00',
    endsAt: '2026-04-17T21:00:00-06:00',
    prettyDate: 'Fri · Apr 17',
    prettyTime: '7:00 – 9:00 PM',
    status: 'confirmed',
    totalCents: 19000,
    paidCents: 19000,
    partySize: 14,
    hostName: 'You',
    hostHandle: '@jenkins_yeti',
    cover:
      'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=70',
    sport: 'Soccer',
    notes: 'Bring light + dark pinnies. Code 4422 for the side gate.',
    qrCode: 'sportsyeti://checkin/bk-alpine-fri',
  },
  {
    id: 'bk-rec-sat',
    facilityId: 'downtown-rec',
    facilityName: 'Downtown Rec Center',
    spaceName: 'Court 1',
    city: 'Denver, CO',
    startsAt: '2026-04-18T09:00:00-06:00',
    endsAt: '2026-04-18T12:00:00-06:00',
    prettyDate: 'Sat · Apr 18',
    prettyTime: '9:00 AM – 12:00 PM',
    status: 'pending',
    totalCents: 13500,
    paidCents: 0,
    partySize: 10,
    hostName: 'Jamie R.',
    hostHandle: '@jamie_r',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
    sport: 'Basketball',
  },
  {
    id: 'bk-aurora-past',
    facilityId: 'aurora-ice',
    facilityName: 'Aurora Ice',
    spaceName: 'Rink A',
    city: 'Anchorage, AK',
    startsAt: '2026-04-12T20:00:00-08:00',
    endsAt: '2026-04-12T21:30:00-08:00',
    prettyDate: 'Sat · Apr 12',
    prettyTime: '8:00 – 9:30 PM',
    status: 'completed',
    totalCents: 36000,
    paidCents: 36000,
    partySize: 18,
    hostName: 'Björn K.',
    hostHandle: '@bjorn_k',
    cover:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=70',
    sport: 'Hockey',
  },
];
