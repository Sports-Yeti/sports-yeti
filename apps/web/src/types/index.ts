// Extend types from the mobile app
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'league_admin' | 'trainer' | 'referee';
  avatar?: string;
}

export interface League {
  id: string;
  name: string;
  sport: string;
  location: string;
  status: 'active' | 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
  description: string;
  maxTeams: number;
  registeredTeams: number;
  rules?: string;
}

export interface Team {
  id: string;
  name: string;
  leagueId: string;
  captainId: string;
  members: TeamMember[];
  wins: number;
  losses: number;
  draws: number;
}

export interface TeamMember {
  id: string;
  name: string;
  position?: string;
  jerseyNumber?: number;
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  certifications: string[];
  rating: number;
  totalCamps: number;
  avatar?: string;
}

export interface Camp {
  id: string;
  name: string;
  trainerId: string;
  sport: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  maxParticipants: number;
  registeredParticipants: number;
  price: number;
  ageGroup: string;
  skillLevel: string;
}

export interface Referee {
  id: string;
  name: string;
  email: string;
  phone: string;
  sports: string[];
  certifications: string[];
  rating: number;
  totalGames: number;
  avatar?: string;
}

export interface GameAssignment {
  id: string;
  gameId: string;
  refereeId: string;
  sport: string;
  location: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  compensation: number;
}

export interface Game {
  id: string;
  leagueId?: string;
  homeTeamId: string;
  awayTeamId: string;
  location: string;
  dateTime: string;
  sport: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
}

export interface GameReport {
  id: string;
  gameId: string;
  refereeId: string;
  homeScore: number;
  awayScore: number;
  incidents: Incident[];
  notes: string;
  submittedAt: string;
}

export interface Incident {
  id: string;
  type: 'yellow_card' | 'red_card' | 'injury' | 'other';
  playerId: string;
  playerName: string;
  teamId: string;
  minute: number;
  description: string;
}

export interface DashboardStats {
  totalLeagues: number;
  activeLeagues: number;
  totalTrainers: number;
  activeCamps: number;
  totalReferees: number;
  pendingAssignments: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}
