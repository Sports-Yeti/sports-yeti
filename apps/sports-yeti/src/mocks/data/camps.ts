import { Camp, CampSession, CampRegistration, CampTrainer, Sport } from '../../types';

// Mock trainers
export const mockTrainers: CampTrainer[] = [
  {
    id: 'trainer-1',
    userId: 'user-trainer-1',
    certifications: ['USSF B License', 'NASM CPT'],
    experienceLevel: 'professional',
    hourlyRate: 75,
    rating: 4.8,
    reviewCount: 45,
    approved: true,
    specialties: ['Ball Handling', 'Shooting', 'Defense'],
    bio: 'Former college basketball player with 10 years of coaching experience',
    firstName: 'Mike',
    lastName: 'Johnson',
    avatar: 'https://i.pravatar.cc/150?u=trainer1',
  },
  {
    id: 'trainer-2',
    userId: 'user-trainer-2',
    certifications: ['USA Basketball Gold License'],
    experienceLevel: 'advanced',
    hourlyRate: 60,
    rating: 4.9,
    reviewCount: 67,
    approved: true,
    specialties: ['Youth Development', 'Fundamentals', 'Team Play'],
    bio: 'Specialized in youth basketball development and fundamentals',
    firstName: 'Sarah',
    lastName: 'Williams',
    avatar: 'https://i.pravatar.cc/150?u=trainer2',
  },
  {
    id: 'trainer-3',
    userId: 'user-trainer-3',
    certifications: ['ACE CPT', 'CSCS'],
    experienceLevel: 'advanced',
    hourlyRate: 65,
    rating: 4.7,
    reviewCount: 32,
    approved: true,
    specialties: ['Strength Training', 'Conditioning', 'Injury Prevention'],
    bio: 'Sports performance specialist focusing on athletic development',
    firstName: 'David',
    lastName: 'Martinez',
    avatar: 'https://i.pravatar.cc/150?u=trainer3',
  },
];

// Mock camps
export const mockCamps: Camp[] = [
  {
    id: 'camp-1',
    leagueId: 'league-1',
    name: 'Youth Basketball Skills Camp',
    description: 'Intensive 2-week program focused on fundamental basketball skills for ages 10-14. Covers shooting, dribbling, passing, and defensive techniques.',
    startDate: '2025-06-15',
    endDate: '2025-06-28',
    registrationFee: 299,
    maxParticipants: 30,
    currentParticipants: 18,
    sport: 'basketball' as Sport,
    skillLevel: 'beginner',
    ageGroup: '10-14',
    location: {
      address: '123 Sports Complex Dr',
      city: 'Downtown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437,
      },
    },
    scheduleDescription: 'Monday-Friday, 9:00 AM - 12:00 PM',
    trainers: ['trainer-1', 'trainer-2'],
    photos: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=800',
    ],
    requirements: [
      'Own basketball shoes',
      'Water bottle',
      'Athletic wear',
    ],
    benefits: [
      'Professional coaching',
      'Small group instruction',
      'Certificate of completion',
      '100 bonus points upon completion',
    ],
    status: 'open',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'camp-2',
    leagueId: 'league-1',
    name: 'Advanced Shooting Clinic',
    description: 'Elite shooting development program for experienced players. Focus on form, consistency, and game-speed shooting drills.',
    startDate: '2025-07-05',
    endDate: '2025-07-19',
    registrationFee: 399,
    maxParticipants: 20,
    currentParticipants: 12,
    sport: 'basketball' as Sport,
    skillLevel: 'advanced',
    ageGroup: '15-18',
    location: {
      address: '456 Arena Blvd',
      city: 'Uptown',
      state: 'CA',
      zipCode: '90211',
      country: 'USA',
      coordinates: {
        latitude: 34.0622,
        longitude: -118.2537,
      },
    },
    scheduleDescription: 'Monday-Friday, 2:00 PM - 5:00 PM',
    trainers: ['trainer-1'],
    photos: [
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=800',
    ],
    requirements: [
      'Minimum 2 years playing experience',
      'Own basketball',
      'Athletic wear',
      'Notebook for drills',
    ],
    benefits: [
      '1-on-1 form analysis',
      'Video breakdown sessions',
      'Custom workout plan',
      '150 bonus points upon completion',
    ],
    status: 'open',
    createdAt: '2025-01-20T00:00:00.000Z',
    updatedAt: '2025-01-20T00:00:00.000Z',
  },
  {
    id: 'camp-3',
    leagueId: 'league-1',
    name: 'Strength & Conditioning Camp',
    description: 'Build athletic foundation with professional strength training and conditioning program designed specifically for basketball players.',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    registrationFee: 499,
    maxParticipants: 25,
    currentParticipants: 8,
    sport: 'basketball' as Sport,
    skillLevel: 'intermediate',
    ageGroup: '14-18',
    location: {
      address: '789 Fitness Way',
      city: 'Midtown',
      state: 'CA',
      zipCode: '90212',
      country: 'USA',
      coordinates: {
        latitude: 34.0722,
        longitude: -118.2637,
      },
    },
    scheduleDescription: 'Mon/Wed/Fri, 6:00 AM - 8:00 AM',
    trainers: ['trainer-3'],
    photos: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    ],
    requirements: [
      'Medical clearance',
      'Athletic shoes',
      'Workout clothes',
      'Pre-camp fitness assessment',
    ],
    benefits: [
      'Personalized training plan',
      'Nutrition guidance',
      'Progress tracking',
      'Injury prevention education',
      '200 bonus points upon completion',
    ],
    status: 'open',
    createdAt: '2025-01-25T00:00:00.000Z',
    updatedAt: '2025-01-25T00:00:00.000Z',
  },
  {
    id: 'camp-4',
    leagueId: 'league-1',
    name: 'Point Guard Development Program',
    description: 'Specialized training for point guards focusing on court vision, decision-making, and leadership skills.',
    startDate: '2025-05-20',
    endDate: '2025-05-25',
    registrationFee: 249,
    maxParticipants: 15,
    currentParticipants: 15,
    sport: 'basketball' as Sport,
    skillLevel: 'intermediate',
    ageGroup: '12-16',
    location: {
      address: '123 Sports Complex Dr',
      city: 'Downtown',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      coordinates: {
        latitude: 34.0522,
        longitude: -118.2437,
      },
    },
    scheduleDescription: 'Saturday-Sunday, 10:00 AM - 3:00 PM',
    trainers: ['trainer-2'],
    photos: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    requirements: [
      'Playing experience as point guard',
      'Basketball shoes',
      'Water bottle',
    ],
    benefits: [
      'Film study sessions',
      'Leadership workshops',
      'Game situation drills',
      '100 bonus points upon completion',
    ],
    status: 'full',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
];

// Mock camp sessions
export const mockCampSessions: Record<string, CampSession[]> = {
  'camp-1': [
    {
      id: 'session-1-1',
      campId: 'camp-1',
      facilityId: 'facility-1',
      trainerId: 'trainer-1',
      startTime: '2025-06-15T09:00:00.000Z',
      endTime: '2025-06-15T12:00:00.000Z',
      maxParticipants: 30,
      title: 'Week 1 - Fundamentals',
      description: 'Introduction to camp and fundamental skills assessment',
    },
    {
      id: 'session-1-2',
      campId: 'camp-1',
      facilityId: 'facility-1',
      trainerId: 'trainer-2',
      startTime: '2025-06-16T09:00:00.000Z',
      endTime: '2025-06-16T12:00:00.000Z',
      maxParticipants: 30,
      title: 'Week 1 - Shooting Form',
      description: 'Proper shooting mechanics and form development',
    },
  ],
  'camp-2': [
    {
      id: 'session-2-1',
      campId: 'camp-2',
      facilityId: 'facility-1',
      trainerId: 'trainer-1',
      startTime: '2025-07-05T14:00:00.000Z',
      endTime: '2025-07-05T17:00:00.000Z',
      maxParticipants: 20,
      title: 'Day 1 - Form Analysis',
      description: 'Individual shooting form evaluation and correction',
    },
  ],
};

// Mock registrations for current user
export const mockCampRegistrations: CampRegistration[] = [
  {
    id: 'reg-1',
    campId: 'camp-1',
    playerId: 'player-1',
    paymentStatus: 'paid',
    attendanceStatus: 'registered',
    registeredAt: '2025-01-18T00:00:00.000Z',
    amountPaid: 299,
    transactionId: 'txn-camp-001',
  },
];

// Helper functions
export function getAllCamps(): Camp[] {
  return mockCamps;
}

export function getOpenCamps(): Camp[] {
  return mockCamps.filter(camp => camp.status === 'open');
}

export function getCampById(id: string): Camp | undefined {
  return mockCamps.find(camp => camp.id === id);
}

export function getCampsBySport(sport: Sport): Camp[] {
  return mockCamps.filter(camp => camp.sport === sport);
}

export function getCampsBySkillLevel(skillLevel: string): Camp[] {
  return mockCamps.filter(camp => camp.skillLevel === skillLevel);
}

export function getMyCampRegistrations(): CampRegistration[] {
  return mockCampRegistrations;
}

export function getMyCamps(): Camp[] {
  const myRegistrationIds = mockCampRegistrations.map(reg => reg.campId);
  return mockCamps.filter(camp => myRegistrationIds.includes(camp.id));
}

export function getCampSessions(campId: string): CampSession[] {
  return mockCampSessions[campId] || [];
}

export function getTrainerById(id: string): CampTrainer | undefined {
  return mockTrainers.find(trainer => trainer.id === id);
}

export function getCampTrainers(campId: string): CampTrainer[] {
  const camp = getCampById(campId);
  if (!camp) return [];
  
  return camp.trainers
    .map(trainerId => getTrainerById(trainerId))
    .filter((trainer): trainer is CampTrainer => trainer !== undefined);
}

export function isRegisteredForCamp(campId: string): boolean {
  return mockCampRegistrations.some(reg => reg.campId === campId);
}

export function getAvailableSpots(campId: string): number {
  const camp = getCampById(campId);
  if (!camp) return 0;
  return camp.maxParticipants - camp.currentParticipants;
}

