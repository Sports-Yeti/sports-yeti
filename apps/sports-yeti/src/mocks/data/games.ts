import { Game, GameParticipant, GameReport } from '../../types';
import { mockPlayers } from './users';
import { mockTeams } from './teams';

export const mockGames: Game[] = [
  {
    id: 'game-1',
    team1Id: 'team-1',
    team2Id: 'team-2',
    facilityId: 'facility-1',
    spaceId: 'space-1',
    refereeId: 'referee-1',
    scheduledAt: '2024-01-25T15:00:00Z',
    duration: 60,
    status: 'scheduled',
    gameType: 'league',
    leagueId: 'league-1',
    divisionId: 'division-1',
    pointWager: 100,
    participants: [
      {
        id: 'participant-1',
        gameId: 'game-1',
        playerId: mockPlayers[0].id,
        teamId: 'team-1',
        attendanceConfirmed: true,
        player: mockPlayers[0]
      },
      {
        id: 'participant-2',
        gameId: 'game-1',
        playerId: 'player-4',
        teamId: 'team-1',
        attendanceConfirmed: true,
        player: {
          id: 'player-4',
          email: 'sarah.wilson@example.com',
          firstName: 'Sarah',
          lastName: 'Wilson',
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
    reports: [],
    chatId: 'chat-1',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'game-2',
    team1Id: 'team-2',
    team2Id: 'team-3',
    facilityId: 'facility-2',
    spaceId: 'space-3',
    scheduledAt: '2024-01-26T14:00:00Z',
    duration: 90,
    status: 'scheduled',
    gameType: 'friendly',
    pointWager: 50,
    participants: [
      {
        id: 'participant-3',
        gameId: 'game-2',
        playerId: mockPlayers[1].id,
        teamId: 'team-2',
        attendanceConfirmed: false,
        player: mockPlayers[1]
      }
    ],
    reports: [],
    chatId: 'chat-2',
    createdAt: '2024-01-21T16:00:00Z'
  },
  {
    id: 'game-3',
    team1Id: 'team-1',
    team2Id: 'team-3',
    facilityId: 'facility-1',
    spaceId: 'space-2',
    scheduledAt: '2024-01-24T19:00:00Z',
    duration: 60,
    status: 'completed',
    gameType: 'mock',
    pointWager: 200,
    participants: [
      {
        id: 'participant-4',
        gameId: 'game-3',
        playerId: mockPlayers[0].id,
        teamId: 'team-1',
        attendanceConfirmed: true,
        qrCheckinTime: '2024-01-24T18:45:00Z',
        player: mockPlayers[0]
      }
    ],
    reports: [
      {
        id: 'report-1',
        gameId: 'game-3',
        captainId: mockPlayers[0].id,
        reportType: 'absence',
        details: 'Opponent team had 2 absent players',
        createdAt: '2024-01-24T20:30:00Z'
      }
    ],
    chatId: 'chat-3',
    createdAt: '2024-01-22T12:00:00Z'
  }
];

export const mockGameReports: GameReport[] = [
  {
    id: 'report-1',
    gameId: 'game-3',
    captainId: mockPlayers[0].id,
    reportType: 'absence',
    details: 'Opponent team had 2 absent players',
    createdAt: '2024-01-24T20:30:00Z'
  },
  {
    id: 'report-2',
    gameId: 'game-1',
    captainId: 'player-4',
    reportType: 'equipment_damage',
    details: 'Basketball net was damaged during warm-up',
    equipmentDamage: 'Net torn on Court 1',
    createdAt: '2024-01-20T14:45:00Z'
  }
];

export const getGameById = (id: string): Game | undefined =>
  mockGames.find(game => game.id === id);

export const getGamesByTeam = (teamId: string): Game[] =>
  mockGames.filter(game => game.team1Id === teamId || game.team2Id === teamId);

export const getGamesByPlayer = (playerId: string): Game[] =>
  mockGames.filter(game =>
    game.participants.some(participant => participant.playerId === playerId)
  );

export const getUpcomingGames = (): Game[] =>
  mockGames.filter(game =>
    new Date(game.scheduledAt) > new Date() && game.status === 'scheduled'
  );

export const getMyUpcomingGames = (): Game[] =>
  getGamesByPlayer(mockPlayers[0].id).filter(game =>
    new Date(game.scheduledAt) > new Date() && game.status === 'scheduled'
  );