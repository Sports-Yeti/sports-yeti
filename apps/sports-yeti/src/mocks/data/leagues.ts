import { League, Division, Season } from '../../types';

export const mockSeasons: Season[] = [
  {
    id: 'season-1',
    name: 'Winter 2024',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    isActive: true
  },
  {
    id: 'season-2',
    name: 'Spring 2024',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    isActive: false
  }
];

export const mockDivisions: Division[] = [
  {
    id: 'division-1',
    leagueId: 'league-1',
    name: 'Division A',
    maxTeams: 8,
    registrationFee: 500,
    rules: ['Standard basketball rules', 'No zone defense', '24-second shot clock'],
    teams: [],
    skillLevel: 'competitive',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'division-2',
    leagueId: 'league-1',
    name: 'Division B',
    maxTeams: 10,
    registrationFee: 300,
    rules: ['Recreational rules', 'No shot clock', 'Man-to-man defense only'],
    teams: [],
    skillLevel: 'recreational',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const mockLeagues: League[] = [
  {
    id: 'league-1',
    name: 'Manhattan Basketball League',
    description: 'Premier basketball league in Manhattan with multiple divisions',
    adminId: 'admin-1',
    sportType: 'basketball',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Central Park',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10024'
    },
    divisions: mockDivisions,
    season: mockSeasons[0],
    registrationFee: 400,
    maxTeams: 20,
    rules: [
      'All players must be registered',
      'Games are 4 quarters of 10 minutes each',
      'Standard NCAA rules apply',
      'No fighting or unsportsmanlike conduct'
    ],
    amenities: [
      'Indoor courts',
      'Equipment rental',
      'Referee services',
      'Scoreboards',
      'Seating for spectators'
    ],
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'league-2',
    name: 'Brooklyn Soccer League',
    description: 'Community soccer league serving Brooklyn neighborhoods',
    adminId: 'admin-2',
    sportType: 'soccer',
    location: {
      latitude: 40.6782,
      longitude: -73.9442,
      address: 'Prospect Park',
      city: 'Brooklyn',
      state: 'NY',
      country: 'USA',
      zipCode: '11215'
    },
    divisions: [],
    season: mockSeasons[0],
    registrationFee: 250,
    maxTeams: 16,
    rules: [
      'FIFA rules apply',
      'Games are 45 minutes per half',
      'Substitutions allowed',
      'No slide tackling in recreational divisions'
    ],
    amenities: [
      'Outdoor fields',
      'Equipment rental',
      'Parking',
      'Restrooms'
    ],
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'league-3',
    name: 'Queens Tennis Association',
    description: 'Competitive and recreational tennis for all skill levels',
    adminId: 'admin-3',
    sportType: 'tennis',
    location: {
      latitude: 40.7282,
      longitude: -73.7949,
      address: 'Flushing Meadows',
      city: 'Queens',
      state: 'NY',
      country: 'USA',
      zipCode: '11368'
    },
    divisions: [],
    season: mockSeasons[0],
    registrationFee: 200,
    maxTeams: 32,
    rules: [
      'USTA rules apply',
      'Best of 3 sets',
      'Tiebreakers at 6-6',
      'Proper tennis etiquette required'
    ],
    amenities: [
      'Indoor and outdoor courts',
      'Equipment rental',
      'Pro shop',
      'Lessons available'
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const getLeagueById = (id: string): League | undefined =>
  mockLeagues.find(league => league.id === id);

export const getLeaguesBySport = (sport: string): League[] =>
  mockLeagues.filter(league => league.sportType === sport);

export const getActiveLeagues = (): League[] =>
  mockLeagues.filter(league => league.season.isActive);