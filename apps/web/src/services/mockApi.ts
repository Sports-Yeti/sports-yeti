import {
  League,
  Team,
  Trainer,
  Camp,
  Referee,
  GameAssignment,
  Game,
  GameReport,
  DashboardStats,
  Activity,
  TeamApplication,
  Player,
  PlayerGameStats,
} from '../types';

// Mock Referees
export const mockReferees: Referee[] = [
  {
    id: 'referee-1',
    name: 'John Referee',
    email: 'john.referee@example.com',
    phone: '+1-555-0101',
    sports: ['basketball', 'soccer'],
    certifications: ['FIBA Licensed', 'USSF Grade 7'],
    rating: 4.8,
    totalGames: 156,
    avatar: 'https://i.pravatar.cc/150?u=referee1',
  },
  {
    id: 'referee-2',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@example.com',
    phone: '+1-555-0102',
    sports: ['soccer', 'tennis'],
    certifications: ['USSF Grade 6', 'ITF Certified'],
    rating: 4.9,
    totalGames: 203,
    avatar: 'https://i.pravatar.cc/150?u=referee2',
  },
  {
    id: 'referee-3',
    name: 'Mike Thompson',
    email: 'mike.thompson@example.com',
    phone: '+1-555-0103',
    sports: ['basketball'],
    certifications: ['NCAA Certified', 'NFHS Licensed'],
    rating: 4.7,
    totalGames: 98,
    avatar: 'https://i.pravatar.cc/150?u=referee3',
  },
];

// Mock Game Assignments
export const mockGameAssignments: GameAssignment[] = [
  {
    id: 'assignment-1',
    gameId: 'game-1',
    refereeId: 'referee-1',
    sport: 'basketball',
    location: 'Central Park Courts',
    dateTime: '2025-12-01T18:00:00Z',
    status: 'confirmed',
    compensation: 75,
  },
  {
    id: 'assignment-2',
    gameId: 'game-2',
    refereeId: 'referee-1',
    sport: 'soccer',
    location: 'Prospect Park Field 3',
    dateTime: '2025-12-03T15:00:00Z',
    status: 'pending',
    compensation: 60,
  },
  {
    id: 'assignment-3',
    gameId: 'game-3',
    refereeId: 'referee-2',
    sport: 'soccer',
    location: 'Brooklyn Soccer Complex',
    dateTime: '2025-11-28T14:00:00Z',
    status: 'completed',
    compensation: 60,
  },
  {
    id: 'assignment-4',
    gameId: 'game-4',
    refereeId: 'referee-3',
    sport: 'basketball',
    location: 'Manhattan Basketball Arena',
    dateTime: '2025-12-05T19:30:00Z',
    status: 'pending',
    compensation: 80,
  },
];

// Mock Leagues (simplified for web)
export const mockLeagues: League[] = [
  {
    id: 'league-1',
    name: 'Manhattan Basketball League',
    sport: 'basketball',
    location: 'Manhattan, NY',
    status: 'active',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    description: 'Premier basketball league in Manhattan with multiple divisions',
    maxTeams: 20,
    registeredTeams: 18,
    rules: 'Standard NBA rules apply. Games are 4 quarters of 10 minutes each.',
  },
  {
    id: 'league-2',
    name: 'Brooklyn Soccer League',
    sport: 'soccer',
    location: 'Brooklyn, NY',
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2025-04-15',
    description: 'Community soccer league serving Brooklyn neighborhoods',
    maxTeams: 16,
    registeredTeams: 14,
    rules: 'FIFA rules apply. Games are 45 minutes per half.',
  },
  {
    id: 'league-3',
    name: 'Queens Tennis Association',
    sport: 'tennis',
    location: 'Queens, NY',
    status: 'upcoming',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    description: 'Competitive and recreational tennis for all skill levels',
    maxTeams: 32,
    registeredTeams: 8,
    rules: 'USTA rules apply. Best of 3 sets.',
  },
];

// Mock Teams
export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Manhattan Ballers',
    leagueId: 'league-1',
    captainId: 'player-1',
    members: [
      { 
        id: 'player-1', 
        name: 'John Doe', 
        position: 'Point Guard', 
        jerseyNumber: 23,
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        avatar: 'https://i.pravatar.cc/150?u=player1',
        joinedDate: '2024-01-15'
      },
      { 
        id: 'player-2', 
        name: 'Jane Smith', 
        position: 'Shooting Guard', 
        jerseyNumber: 11,
        email: 'jane.smith@example.com',
        phone: '+1-555-0102',
        avatar: 'https://i.pravatar.cc/150?u=player2',
        joinedDate: '2024-01-15'
      },
      { 
        id: 'player-3', 
        name: 'Mike Johnson', 
        position: 'Center', 
        jerseyNumber: 32,
        email: 'mike.j@example.com',
        phone: '+1-555-0103',
        avatar: 'https://i.pravatar.cc/150?u=player3',
        joinedDate: '2024-01-20'
      },
    ],
    wins: 12,
    losses: 3,
    draws: 0,
    logo: 'https://i.pravatar.cc/150?u=teamlogo1',
    description: 'Competitive basketball team from Manhattan',
    status: 'active',
  },
  {
    id: 'team-2',
    name: 'Brooklyn Hoops',
    leagueId: 'league-1',
    captainId: 'player-4',
    members: [
      { 
        id: 'player-4', 
        name: 'Sarah Williams', 
        position: 'Power Forward', 
        jerseyNumber: 15,
        email: 'sarah.w@example.com',
        phone: '+1-555-0104',
        avatar: 'https://i.pravatar.cc/150?u=player4',
        joinedDate: '2024-01-10'
      },
      { 
        id: 'player-5', 
        name: 'Tom Brown', 
        position: 'Small Forward', 
        jerseyNumber: 7,
        email: 'tom.brown@example.com',
        phone: '+1-555-0105',
        avatar: 'https://i.pravatar.cc/150?u=player5',
        joinedDate: '2024-01-12'
      },
    ],
    wins: 10,
    losses: 5,
    draws: 0,
    logo: 'https://i.pravatar.cc/150?u=teamlogo2',
    description: 'Rising stars from Brooklyn',
    status: 'active',
  },
  {
    id: 'team-3',
    name: 'Queens Warriors',
    leagueId: 'league-1',
    captainId: 'player-6',
    members: [
      { 
        id: 'player-6', 
        name: 'Alex Rodriguez', 
        position: 'Point Guard', 
        jerseyNumber: 10,
        email: 'alex.r@example.com',
        phone: '+1-555-0106',
        avatar: 'https://i.pravatar.cc/150?u=player6',
        joinedDate: '2024-02-01'
      },
    ],
    wins: 0,
    losses: 0,
    draws: 0,
    logo: 'https://i.pravatar.cc/150?u=teamlogo3',
    description: 'New team looking to make an impact',
    status: 'pending',
  },
];

// Mock Games
export const mockGames: Game[] = [
  {
    id: 'game-1',
    leagueId: 'league-1',
    homeTeamId: 'team-1',
    awayTeamId: 'team-2',
    homeTeamName: 'Manhattan Ballers',
    awayTeamName: 'Brooklyn Hoops',
    location: 'Madison Square Garden',
    dateTime: '2024-12-01T19:00:00Z',
    sport: 'basketball',
    status: 'completed',
    homeScore: 95,
    awayScore: 88,
    round: 1,
    referee: 'referee-1',
  },
  {
    id: 'game-2',
    leagueId: 'league-1',
    homeTeamId: 'team-3',
    awayTeamId: 'team-1',
    homeTeamName: 'Queens Warriors',
    awayTeamName: 'Manhattan Ballers',
    location: 'Queens Sports Complex',
    dateTime: '2024-12-05T18:30:00Z',
    sport: 'basketball',
    status: 'scheduled',
    round: 2,
  },
  {
    id: 'game-3',
    leagueId: 'league-1',
    homeTeamId: 'team-2',
    awayTeamId: 'team-3',
    homeTeamName: 'Brooklyn Hoops',
    awayTeamName: 'Queens Warriors',
    location: 'Brooklyn Recreation Center',
    dateTime: '2024-12-08T20:00:00Z',
    sport: 'basketball',
    status: 'scheduled',
    round: 2,
  },
];

// Mock Trainers
export const mockTrainers: Trainer[] = [
  {
    id: 'trainer-1',
    name: 'Mike Johnson',
    email: 'mike.trainer@example.com',
    phone: '+1-555-0201',
    specializations: ['Ball Handling', 'Shooting', 'Defense'],
    certifications: ['USSF B License', 'NASM CPT'],
    rating: 4.8,
    totalCamps: 25,
    avatar: 'https://i.pravatar.cc/150?u=trainer1',
  },
  {
    id: 'trainer-2',
    name: 'Sarah Williams',
    email: 'sarah.trainer@example.com',
    phone: '+1-555-0202',
    specializations: ['Youth Development', 'Fundamentals', 'Team Play'],
    certifications: ['USA Basketball Gold License'],
    rating: 4.9,
    totalCamps: 38,
    avatar: 'https://i.pravatar.cc/150?u=trainer2',
  },
  {
    id: 'trainer-3',
    name: 'David Martinez',
    email: 'david.trainer@example.com',
    phone: '+1-555-0203',
    specializations: ['Strength Training', 'Conditioning', 'Injury Prevention'],
    certifications: ['ACE CPT', 'CSCS'],
    rating: 4.7,
    totalCamps: 19,
    avatar: 'https://i.pravatar.cc/150?u=trainer3',
  },
];

// Mock Camps
export const mockCamps: Camp[] = [
  {
    id: 'camp-1',
    name: 'Youth Basketball Skills Camp',
    trainerId: 'trainer-1',
    sport: 'basketball',
    location: 'Downtown Sports Complex',
    startDate: '2025-06-15',
    endDate: '2025-06-28',
    description: 'Intensive 2-week program focused on fundamental basketball skills for ages 10-14.',
    maxParticipants: 30,
    registeredParticipants: 18,
    price: 299,
    ageGroup: '10-14',
    skillLevel: 'beginner',
  },
  {
    id: 'camp-2',
    name: 'Advanced Shooting Clinic',
    trainerId: 'trainer-1',
    sport: 'basketball',
    location: 'Uptown Arena',
    startDate: '2025-07-05',
    endDate: '2025-07-19',
    description: 'Elite shooting development program for experienced players.',
    maxParticipants: 20,
    registeredParticipants: 12,
    price: 399,
    ageGroup: '15-18',
    skillLevel: 'advanced',
  },
  {
    id: 'camp-3',
    name: 'Strength & Conditioning Camp',
    trainerId: 'trainer-3',
    sport: 'basketball',
    location: 'Midtown Fitness Center',
    startDate: '2025-08-01',
    endDate: '2025-08-31',
    description: 'Build athletic foundation with professional strength training.',
    maxParticipants: 25,
    registeredParticipants: 8,
    price: 499,
    ageGroup: '14-18',
    skillLevel: 'intermediate',
  },
];

// Mock Game Reports
export const mockGameReports: GameReport[] = [
  {
    id: 'report-1',
    gameId: 'game-3',
    refereeId: 'referee-2',
    homeScore: 2,
    awayScore: 1,
    incidents: [
      {
        id: 'incident-1',
        type: 'yellow_card',
        playerId: 'player-5',
        playerName: 'Alex Rodriguez',
        teamId: 'team-6',
        minute: 34,
        description: 'Unsporting behavior - excessive arguing with referee',
      },
    ],
    notes: 'Well-played match. Both teams showed good sportsmanship despite competitive nature.',
    submittedAt: '2025-11-28T16:30:00Z',
  },
];

// Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalLeagues: 3,
  activeLeagues: 2,
  totalTrainers: 3,
  activeCamps: 3,
  totalReferees: 3,
  pendingAssignments: 2,
};

// Recent Activity
export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    type: 'league_created',
    description: 'New league created: Brooklyn Soccer League',
    timestamp: '2025-11-20T10:30:00Z',
    userId: 'admin-1',
    userName: 'Admin User',
  },
  {
    id: 'activity-2',
    type: 'camp_registered',
    description: '5 new registrations for Youth Basketball Skills Camp',
    timestamp: '2025-11-21T14:15:00Z',
    userId: 'trainer-1',
    userName: 'Mike Johnson',
  },
  {
    id: 'activity-3',
    type: 'game_reported',
    description: 'Game report submitted for Brooklyn Soccer League match',
    timestamp: '2025-11-28T16:30:00Z',
    userId: 'referee-2',
    userName: 'Sarah Martinez',
  },
  {
    id: 'activity-4',
    type: 'team_registered',
    description: 'New team registered: Manhattan Ballers',
    timestamp: '2025-11-25T09:00:00Z',
    userId: 'user-1',
    userName: 'John Doe',
  },
];

// API Functions
export const mockApi = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(500);
    return mockDashboardStats;
  },

  getRecentActivity: async (): Promise<Activity[]> => {
    await delay(500);
    return mockActivities;
  },

  // Leagues
  getLeagues: async (filters?: { sport?: string; status?: string }): Promise<League[]> => {
    await delay(500);
    let leagues = [...mockLeagues];
    if (filters?.sport) {
      leagues = leagues.filter(l => l.sport === filters.sport);
    }
    if (filters?.status) {
      leagues = leagues.filter(l => l.status === filters.status);
    }
    return leagues;
  },

  getLeagueById: async (id: string): Promise<League | null> => {
    await delay(500);
    return mockLeagues.find(l => l.id === id) || null;
  },

  createLeague: async (league: Omit<League, 'id'>): Promise<League> => {
    await delay(1000);
    const newLeague: League = {
      ...league,
      id: `league-${Date.now()}`,
    };
    mockLeagues.push(newLeague);
    return newLeague;
  },

  updateLeague: async (id: string, updates: Partial<League>): Promise<League> => {
    await delay(1000);
    const index = mockLeagues.findIndex(l => l.id === id);
    if (index === -1) throw new Error('League not found');
    mockLeagues[index] = { ...mockLeagues[index], ...updates };
    return mockLeagues[index];
  },

  // Teams
  getTeamsByLeague: async (leagueId: string): Promise<Team[]> => {
    await delay(500);
    return mockTeams.filter(t => t.leagueId === leagueId);
  },

  getTeamById: async (id: string): Promise<Team | null> => {
    await delay(500);
    return mockTeams.find(t => t.id === id) || null;
  },

  // Team Applications
  getTeamApplications: async (filters?: { leagueId?: string; status?: string }): Promise<TeamApplication[]> => {
    await delay(500);
    const { mockTeamApplications } = await import('./mockPlayerData');
    let applications = [...mockTeamApplications];
    if (filters?.leagueId) {
      applications = applications.filter(a => a.leagueId === filters.leagueId);
    }
    if (filters?.status) {
      applications = applications.filter(a => a.status === filters.status);
    }
    return applications;
  },

  approveTeamApplication: async (id: string): Promise<TeamApplication> => {
    await delay(1000);
    const { mockTeamApplications } = await import('./mockPlayerData');
    const index = mockTeamApplications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    mockTeamApplications[index] = {
      ...mockTeamApplications[index],
      status: 'approved',
      reviewedDate: new Date().toISOString(),
      reviewedBy: 'admin-1',
    };

    // Update team status to active
    const teamIndex = mockTeams.findIndex(t => t.id === mockTeamApplications[index].teamId);
    if (teamIndex !== -1) {
      mockTeams[teamIndex].status = 'active';
    }

    return mockTeamApplications[index];
  },

  rejectTeamApplication: async (id: string, reason: string): Promise<TeamApplication> => {
    await delay(1000);
    const { mockTeamApplications } = await import('./mockPlayerData');
    const index = mockTeamApplications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    mockTeamApplications[index] = {
      ...mockTeamApplications[index],
      status: 'rejected',
      reviewedDate: new Date().toISOString(),
      reviewedBy: 'admin-1',
      rejectionReason: reason,
    };

    // Update team status to rejected
    const teamIndex = mockTeams.findIndex(t => t.id === mockTeamApplications[index].teamId);
    if (teamIndex !== -1) {
      mockTeams[teamIndex].status = 'rejected';
    }

    return mockTeamApplications[index];
  },

  // Players
  getPlayers: async (filters?: { sport?: string; skillLevel?: string; search?: string }): Promise<Player[]> => {
    await delay(500);
    const { mockPlayers } = await import('./mockPlayerData');
    let players = [...mockPlayers];
    
    if (filters?.sport) {
      players = players.filter(p => p.sports.includes(filters.sport as string));
    }
    if (filters?.skillLevel) {
      players = players.filter(p => p.skillLevel === filters.skillLevel);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      players = players.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.email.toLowerCase().includes(search)
      );
    }
    
    return players;
  },

  getPlayerById: async (id: string): Promise<Player | null> => {
    await delay(500);
    const { mockPlayers } = await import('./mockPlayerData');
    return mockPlayers.find(p => p.id === id) || null;
  },

  // Games
  getGames: async (filters?: { leagueId?: string; teamId?: string; status?: string }): Promise<Game[]> => {
    await delay(500);
    let games = [...mockGames];
    
    if (filters?.leagueId) {
      games = games.filter(g => g.leagueId === filters.leagueId);
    }
    if (filters?.teamId) {
      games = games.filter(g => g.homeTeamId === filters.teamId || g.awayTeamId === filters.teamId);
    }
    if (filters?.status) {
      games = games.filter(g => g.status === filters.status);
    }
    
    return games;
  },

  getGameById: async (id: string): Promise<Game | null> => {
    await delay(500);
    return mockGames.find(g => g.id === id) || null;
  },

  createGame: async (game: Omit<Game, 'id'>): Promise<Game> => {
    await delay(1000);
    const newGame: Game = {
      ...game,
      id: `game-${Date.now()}`,
    };
    mockGames.push(newGame);
    return newGame;
  },

  updateGame: async (id: string, updates: Partial<Game>): Promise<Game> => {
    await delay(1000);
    const index = mockGames.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Game not found');
    mockGames[index] = { ...mockGames[index], ...updates };
    return mockGames[index];
  },

  deleteGame: async (id: string): Promise<void> => {
    await delay(500);
    const index = mockGames.findIndex(g => g.id === id);
    if (index !== -1) {
      mockGames.splice(index, 1);
    }
  },

  getPlayerGameStats: async (gameId: string): Promise<PlayerGameStats[]> => {
    await delay(500);
    const { mockPlayerGameStats } = await import('./mockGameStats');
    return mockPlayerGameStats.filter(s => s.gameId === gameId);
  },

  generateSchedule: async (leagueId: string, format: string): Promise<Game[]> => {
    await delay(2000);
    // Mock schedule generation
    const league = await mockApi.getLeagueById(leagueId);
    const teams = await mockApi.getTeamsByLeague(leagueId);
    
    if (!league || teams.length < 2) {
      throw new Error('Not enough teams to generate schedule');
    }

    const newGames: Game[] = [];
    const startDate = new Date(league.startDate);
    
    if (format === 'round-robin') {
      // Generate round-robin schedule
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const gameDate = new Date(startDate);
          gameDate.setDate(gameDate.getDate() + newGames.length * 3); // 3 days between games
          
          newGames.push({
            id: `game-${Date.now()}-${i}-${j}`,
            leagueId,
            homeTeamId: teams[i].id,
            awayTeamId: teams[j].id,
            homeTeamName: teams[i].name,
            awayTeamName: teams[j].name,
            location: league.location,
            dateTime: gameDate.toISOString(),
            sport: league.sport,
            status: 'scheduled',
            round: 1,
          });
        }
      }
    }

    mockGames.push(...newGames);
    return newGames;
  },

  // Trainers
  getTrainers: async (): Promise<Trainer[]> => {
    await delay(500);
    return mockTrainers;
  },

  getTrainerById: async (id: string): Promise<Trainer | null> => {
    await delay(500);
    return mockTrainers.find(t => t.id === id) || null;
  },

  // Camps
  getCamps: async (filters?: { trainerId?: string; sport?: string }): Promise<Camp[]> => {
    await delay(500);
    let camps = [...mockCamps];
    if (filters?.trainerId) {
      camps = camps.filter(c => c.trainerId === filters.trainerId);
    }
    if (filters?.sport) {
      camps = camps.filter(c => c.sport === filters.sport);
    }
    return camps;
  },

  getCampById: async (id: string): Promise<Camp | null> => {
    await delay(500);
    return mockCamps.find(c => c.id === id) || null;
  },

  createCamp: async (camp: Omit<Camp, 'id' | 'registeredParticipants'>): Promise<Camp> => {
    await delay(1000);
    const newCamp: Camp = {
      ...camp,
      id: `camp-${Date.now()}`,
      registeredParticipants: 0,
    };
    mockCamps.push(newCamp);
    return newCamp;
  },

  // Referees
  getReferees: async (): Promise<Referee[]> => {
    await delay(500);
    return mockReferees;
  },

  getRefereeById: async (id: string): Promise<Referee | null> => {
    await delay(500);
    return mockReferees.find(r => r.id === id) || null;
  },

  // Game Assignments
  getAssignments: async (filters?: { refereeId?: string; status?: string }): Promise<GameAssignment[]> => {
    await delay(500);
    let assignments = [...mockGameAssignments];
    if (filters?.refereeId) {
      assignments = assignments.filter(a => a.refereeId === filters.refereeId);
    }
    if (filters?.status) {
      assignments = assignments.filter(a => a.status === filters.status);
    }
    return assignments;
  },

  confirmAssignment: async (id: string): Promise<GameAssignment> => {
    await delay(1000);
    const index = mockGameAssignments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Assignment not found');
    mockGameAssignments[index].status = 'confirmed';
    return mockGameAssignments[index];
  },

  // Game Reports
  submitGameReport: async (report: Omit<GameReport, 'id' | 'submittedAt'>): Promise<GameReport> => {
    await delay(1000);
    const newReport: GameReport = {
      ...report,
      id: `report-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    mockGameReports.push(newReport);
    return newReport;
  },

  getGameReport: async (gameId: string): Promise<GameReport | null> => {
    await delay(500);
    return mockGameReports.find(r => r.gameId === gameId) || null;
  },
};

// Helper function to simulate API delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default mockApi;
