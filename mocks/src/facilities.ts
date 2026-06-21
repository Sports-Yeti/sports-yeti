import type { Facility, FacilityOwnership } from './types';
import { DEMO_ORG_ID } from './organizations';
import { DEMO_USER_ID } from './users';

export const FACILITIES: Facility[] = [
  {
    id: 'facility-yeti-center',
    ownerOrgId: DEMO_ORG_ID,
    name: 'Yeti Center',
    description:
      'The org’s flagship indoor + outdoor multi-sport complex.',
    address: '1200 Tundra Way',
    city: 'Denver',
    state: 'CO',
    zip: '80211',
    lat: 39.7651,
    lng: -105.0091,
    imageUrls: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200',
      'https://images.unsplash.com/photo-1505666287802-931582b5e4e3?w=1200',
    ],
    amenities: ['Locker rooms', 'Parking', 'Cafe', 'Pro shop'],
    createdAtIso: '2024-09-20T16:00:00Z',
  },
  {
    id: 'facility-summit-rec',
    ownerOrgId: DEMO_ORG_ID,
    name: 'Summit Rec Center',
    description: 'Two hardwood courts and a turf field for indoor soccer.',
    address: '845 Summit Ridge Rd',
    city: 'Denver',
    state: 'CO',
    zip: '80205',
    lat: 39.7522,
    lng: -104.9819,
    imageUrls: ['https://images.unsplash.com/photo-1546608235-3310a2494cdf?w=1200'],
    amenities: ['Parking', 'Concessions'],
    createdAtIso: '2024-11-01T16:00:00Z',
  },
  {
    id: 'facility-frp-courts',
    ownerOrgId: 'org-front-range-sports',
    name: 'Front Range Pickleball Park',
    description: '8 outdoor pickleball courts with night lighting.',
    address: '440 Mountain View Blvd',
    city: 'Boulder',
    state: 'CO',
    zip: '80302',
    lat: 40.0199,
    lng: -105.2603,
    imageUrls: ['https://images.unsplash.com/photo-1606588260160-0c9d7a16cb02?w=1200'],
    amenities: ['Lights', 'Parking'],
    createdAtIso: '2025-01-20T16:00:00Z',
  },
];

export const FACILITY_OWNERSHIPS: FacilityOwnership[] = [
  {
    id: 'fo-yeti-center',
    facilityId: 'facility-yeti-center',
    ownerOrgId: DEMO_ORG_ID,
    managerUserIds: [DEMO_USER_ID, 'user-jordan-rivera'],
  },
  {
    id: 'fo-summit-rec',
    facilityId: 'facility-summit-rec',
    ownerOrgId: DEMO_ORG_ID,
    managerUserIds: [DEMO_USER_ID],
  },
  {
    id: 'fo-frp-courts',
    facilityId: 'facility-frp-courts',
    ownerOrgId: 'org-front-range-sports',
    managerUserIds: ['user-priya-mehta'],
  },
];

export function facilityById(id: string): Facility | undefined {
  return FACILITIES.find((f) => f.id === id);
}

export function facilitiesByOrg(orgId: string): Facility[] {
  return FACILITIES.filter((f) => f.ownerOrgId === orgId);
}

export function ownershipForFacility(facilityId: string): FacilityOwnership | undefined {
  return FACILITY_OWNERSHIPS.find((o) => o.facilityId === facilityId);
}

export function facilitiesManagedBy(userId: string): Facility[] {
  const ownedFacilityIds = FACILITY_OWNERSHIPS.filter((o) =>
    o.managerUserIds.includes(userId),
  ).map((o) => o.facilityId);
  return FACILITIES.filter((f) => ownedFacilityIds.includes(f.id));
}
