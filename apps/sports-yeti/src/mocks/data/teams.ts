import { Team, TeamMember } from '../../types';
import { mockPlayers } from './users';

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Downtown Ballers',
    captainId: mockPlayers[0].id,
    leagueId: 'league-1',
    divisionId: 'division-1',
    description: 'Competitive basketball team looking for serious players',
    avatar: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&h=150&fit=crop',
    members: [
      {
        id: 'member-1',
        playerId: mockPlayers[0].id,
        role: 'captain',
        joinedAt: '2024-01-15T10:00:00Z',
        paymentStatus: 'completed',
        waiverSigned: true,
        player: mockPlayers[0]
      },
      {
        id: 'member-2',
        playerId: 'player-4',
        role: 'player',
        joinedAt: '2024-01-16T14:00:00Z',
        paymentStatus: 'completed',
        waiverSigned: true,
        player: {
          id: 'player-4',
          email: 'sarah.wilson@example.com',
          firstName: 'Sarah',
          lastName: 'Wilson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          experienceLevel: 'intermediate',
          availabilityStatus: 'available',
          isPrivate: false,
          sportPreferences: ['basketball'],
          pointBalance: 850,
          achievements: [],
          stats: {
            gamesPlayed: 18,
            gamesWon: 12,
            gamesLost: 6,
            winRate: 0.67,
            totalPoints: 850,
            averagePointsPerGame: 47,
            favoritePosition: 'Shooting Guard',
            strengths: ['Shooting', 'Defense'],
            areasForImprovement: ['Ball Handling']
          },
          createdAt: '2024-01-14T08:00:00Z',
          updatedAt: '2024-01-14T08:00:00Z'
        } as any
      }
    ],
    maxMembers: 12,
    sport: 'basketball',
    skillLevel: 'competitive',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'team-2',
    name: 'Queens United',
    captainId: 'player-5',
    leagueId: 'league-1',
    divisionId: 'division-2',
    description: 'Recreational soccer team for all skill levels',
    avatar: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=150&h=150&fit=crop',
    members: [
      {
        id: 'member-3',
        playerId: mockPlayers[1].id,
        role: 'player',
        joinedAt: '2024-01-17T16:00:00Z',
        paymentStatus: 'completed',
        waiverSigned: true,
        player: mockPlayers[1]
      }
    ],
    maxMembers: 18,
    sport: 'soccer',
    skillLevel: 'recreational',
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-16T14:00:00Z'
  },
  {
    id: 'team-3',
    name: 'Brooklyn Nets',
    captainId: mockPlayers[2].id,
    description: 'Semi-professional basketball team',
    members: [
      {
        id: 'member-4',
        playerId: mockPlayers[2].id,
        role: 'captain',
        joinedAt: '2024-01-10T12:00:00Z',
        paymentStatus: 'completed',
        waiverSigned: true,
        player: mockPlayers[2]
      }
    ],
    maxMembers: 15,
    sport: 'basketball',
    skillLevel: 'semi-professional',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z'
  }
];

export const getTeamById = (id: string): Team | undefined =>
  mockTeams.find(team => team.id === id);

export const getTeamsBySport = (sport: string): Team[] =>
  mockTeams.filter(team => team.sport === sport);

export const getTeamsByLeague = (leagueId: string): Team[] =>
  mockTeams.filter(team => team.leagueId === leagueId);

export const getMyTeams = (): Team[] =>
  mockTeams.filter(team =>
    team.members.some(member => member.playerId === mockPlayers[0].id)
  );