import { User, Player } from '../../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '+1234567890',
    dateOfBirth: '1990-05-15',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    phone: '+1234567891',
    dateOfBirth: '1992-03-20',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: '456 Park Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10022'
    },
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  },
  {
    id: 'user-3',
    email: 'mike.johnson@example.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '+1234567892',
    dateOfBirth: '1988-11-10',
    location: {
      latitude: 40.7282,
      longitude: -73.7949,
      address: '789 Queens Blvd',
      city: 'Queens',
      state: 'NY',
      country: 'USA',
      zipCode: '11373'
    },
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z'
  }
];

export const mockPlayers: Player[] = [
  {
    ...mockUsers[0],
    bio: 'Passionate basketball player with 10+ years experience. Love pickup games and competitive leagues!',
    experienceLevel: 'advanced',
    availabilityStatus: 'available',
    isPrivate: false,
    sportPreferences: ['basketball', 'soccer'],
    pointBalance: 2850,
    achievements: [
      {
        id: 'ach-1',
        name: 'First Game',
        description: 'Played your first game on Sports Yeti',
        icon: '🏀',
        points: 100,
        category: 'games',
        unlockedAt: '2024-01-16T16:00:00Z'
      },
      {
        id: 'ach-2',
        name: 'Team Captain',
        description: 'Created your first team',
        icon: '👑',
        points: 250,
        category: 'achievement',
        unlockedAt: '2024-01-20T12:00:00Z'
      }
    ],
    stats: {
      gamesPlayed: 45,
      gamesWon: 32,
      gamesLost: 13,
      winRate: 0.71,
      totalPoints: 2850,
      averagePointsPerGame: 63,
      favoritePosition: 'Point Guard',
      strengths: ['Ball Handling', 'Leadership', 'Three Point Shooting'],
      areasForImprovement: ['Defense', 'Rebounding']
    }
  },
  {
    ...mockUsers[1],
    bio: 'Soccer enthusiast and weekend warrior. Always looking for a good pickup game!',
    experienceLevel: 'intermediate',
    availabilityStatus: 'available',
    isPrivate: false,
    sportPreferences: ['soccer', 'tennis'],
    pointBalance: 1200,
    achievements: [
      {
        id: 'ach-3',
        name: 'Social Butterfly',
        description: 'Made 10 friends on the platform',
        icon: '🦋',
        points: 150,
        category: 'social',
        unlockedAt: '2024-01-18T14:00:00Z'
      }
    ],
    stats: {
      gamesPlayed: 23,
      gamesWon: 15,
      gamesLost: 8,
      winRate: 0.65,
      totalPoints: 1200,
      averagePointsPerGame: 52,
      favoritePosition: 'Midfielder',
      strengths: ['Passing', 'Vision', 'Endurance'],
      areasForImprovement: ['Finishing', 'Heading']
    }
  },
  {
    ...mockUsers[2],
    bio: 'Professional referee and coach. Love helping grow the sports community!',
    experienceLevel: 'professional',
    availabilityStatus: 'busy',
    isPrivate: false,
    sportPreferences: ['basketball', 'soccer', 'tennis'],
    pointBalance: 5200,
    achievements: [
      {
        id: 'ach-4',
        name: 'Referee Legend',
        description: 'Officiated 100+ games',
        icon: '⚖️',
        points: 500,
        category: 'special',
        unlockedAt: '2024-01-10T20:00:00Z'
      }
    ],
    stats: {
      gamesPlayed: 156,
      gamesWon: 0,
      gamesLost: 0,
      winRate: 0,
      totalPoints: 5200,
      averagePointsPerGame: 33,
      favoritePosition: 'Referee',
      strengths: ['Rule Knowledge', 'Game Management', 'Communication'],
      areasForImprovement: []
    }
  }
];

export const getCurrentPlayer = (): Player => mockPlayers[0];

export const getPlayerById = (id: string): Player | undefined =>
  mockPlayers.find(player => player.id === id);

export const getPlayersBySport = (sport: string): Player[] =>
  mockPlayers.filter(player => player.sportPreferences.includes(sport as any));