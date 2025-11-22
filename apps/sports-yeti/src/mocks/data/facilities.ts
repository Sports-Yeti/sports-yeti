import { Facility, Space, Equipment } from '../../types';

export const mockEquipment: Equipment[] = [
  {
    id: 'equipment-1',
    facilityId: 'facility-1',
    name: 'Basketball',
    type: 'ball',
    condition: 'excellent',
    pointCost: 10,
    cashCost: 5,
    available: true,
    photos: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=200&fit=crop']
  },
  {
    id: 'equipment-2',
    facilityId: 'facility-1',
    name: 'Basketball Net',
    type: 'net',
    condition: 'good',
    pointCost: 5,
    cashCost: 2,
    available: true,
    photos: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop']
  },
  {
    id: 'equipment-3',
    facilityId: 'facility-2',
    name: 'Soccer Ball',
    type: 'ball',
    condition: 'excellent',
    pointCost: 8,
    cashCost: 4,
    available: true,
    photos: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop']
  }
];

export const mockSpaces: Space[] = [
  {
    id: 'space-1',
    facilityId: 'facility-1',
    name: 'Court 1',
    sportType: 'basketball',
    capacity: 10,
    amenities: ['Scoreboard', 'Bleachers', 'Water fountain'],
    pointCost: 100,
    cashCost: 50,
    photos: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    ],
    availability: [
      {
        date: '2024-01-25',
        availableSlots: [
          { startTime: '10:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '12:00', available: false, bookingId: 'booking-1' },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: true }
        ]
      }
    ]
  },
  {
    id: 'space-2',
    facilityId: 'facility-1',
    name: 'Court 2',
    sportType: 'basketball',
    capacity: 10,
    amenities: ['Scoreboard', 'Bleachers'],
    pointCost: 100,
    cashCost: 50,
    photos: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop'
    ],
    availability: [
      {
        date: '2024-01-25',
        availableSlots: [
          { startTime: '10:00', endTime: '11:00', available: false, bookingId: 'booking-2' },
          { startTime: '11:00', endTime: '12:00', available: true },
          { startTime: '14:00', endTime: '15:00', available: true },
          { startTime: '15:00', endTime: '16:00', available: false, bookingId: 'booking-3' }
        ]
      }
    ]
  },
  {
    id: 'space-3',
    facilityId: 'facility-2',
    name: 'Field A',
    sportType: 'soccer',
    capacity: 22,
    amenities: ['Goals', 'Corner flags', 'Benches'],
    pointCost: 150,
    cashCost: 75,
    photos: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'
    ],
    availability: [
      {
        date: '2024-01-25',
        availableSlots: [
          { startTime: '09:00', endTime: '11:00', available: true },
          { startTime: '11:00', endTime: '13:00', available: true },
          { startTime: '14:00', endTime: '16:00', available: false, bookingId: 'booking-4' },
          { startTime: '16:00', endTime: '18:00', available: true }
        ]
      }
    ]
  }
];

export const mockFacilities: Facility[] = [
  {
    id: 'facility-1',
    leagueId: 'league-1',
    name: 'Manhattan Sports Center',
    address: '123 West 42nd Street, New York, NY 10036',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: '123 West 42nd Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10036'
    },
    contactInfo: {
      phone: '+1 (212) 555-0123',
      email: 'info@manhattansportscenter.com',
      website: 'https://manhattansportscenter.com'
    },
    operatingHours: [
      { dayOfWeek: 'monday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { dayOfWeek: 'tuesday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { dayOfWeek: 'wednesday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { dayOfWeek: 'thursday', openTime: '06:00', closeTime: '23:00', isOpen: true },
      { dayOfWeek: 'friday', openTime: '06:00', closeTime: '24:00', isOpen: true },
      { dayOfWeek: 'saturday', openTime: '07:00', closeTime: '24:00', isOpen: true },
      { dayOfWeek: 'sunday', openTime: '08:00', closeTime: '22:00', isOpen: true }
    ],
    spaces: mockSpaces.filter(space => space.facilityId === 'facility-1'),
    equipment: mockEquipment.filter(eq => eq.facilityId === 'facility-1'),
    amenities: [
      'Indoor courts',
      'Air conditioning',
      'Equipment rental',
      'Pro shop',
      'Showers',
      'Parking',
      'WiFi',
      'Cafe'
    ],
    liabilityInfo: 'All participants must sign waiver. Facility not responsible for injuries.',
    photos: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    ],
    rating: 4.5,
    reviewCount: 127,
    createdAt: '2023-11-01T00:00:00Z'
  },
  {
    id: 'facility-2',
    leagueId: 'league-2',
    name: 'Brooklyn Athletic Fields',
    address: '456 Prospect Park West, Brooklyn, NY 11215',
    location: {
      latitude: 40.6782,
      longitude: -73.9442,
      address: '456 Prospect Park West',
      city: 'Brooklyn',
      state: 'NY',
      country: 'USA',
      zipCode: '11215'
    },
    contactInfo: {
      phone: '+1 (718) 555-0456',
      email: 'contact@brooklynfields.com'
    },
    operatingHours: [
      { dayOfWeek: 'monday', openTime: '08:00', closeTime: '20:00', isOpen: true },
      { dayOfWeek: 'tuesday', openTime: '08:00', closeTime: '20:00', isOpen: true },
      { dayOfWeek: 'wednesday', openTime: '08:00', closeTime: '20:00', isOpen: true },
      { dayOfWeek: 'thursday', openTime: '08:00', closeTime: '20:00', isOpen: true },
      { dayOfWeek: 'friday', openTime: '08:00', closeTime: '21:00', isOpen: true },
      { dayOfWeek: 'saturday', openTime: '07:00', closeTime: '21:00', isOpen: true },
      { dayOfWeek: 'sunday', openTime: '08:00', closeTime: '20:00', isOpen: true }
    ],
    spaces: mockSpaces.filter(space => space.facilityId === 'facility-2'),
    equipment: mockEquipment.filter(eq => eq.facilityId === 'facility-2'),
    amenities: [
      'Outdoor fields',
      'Equipment rental',
      'Parking',
      'Restrooms',
      'Picnic areas'
    ],
    liabilityInfo: 'Outdoor facility. Weather conditions may affect play. Standard liability waiver required.',
    photos: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'
    ],
    rating: 4.2,
    reviewCount: 89,
    createdAt: '2023-11-15T00:00:00Z'
  }
];

export const getFacilityById = (id: string): Facility | undefined =>
  mockFacilities.find(facility => facility.id === id);

export const getFacilitiesBySport = (sport: string): Facility[] =>
  mockFacilities.filter(facility =>
    facility.spaces.some(space => space.sportType === sport)
  );

export const getSpacesByFacility = (facilityId: string): Space[] =>
  mockSpaces.filter(space => space.facilityId === facilityId);