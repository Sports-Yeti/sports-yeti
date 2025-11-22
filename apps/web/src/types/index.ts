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
  seasonFormat?: 'round-robin' | 'single-elimination' | 'double-elimination' | 'swiss';
  gamesPerTeam?: number;
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
  logo?: string;
  description?: string;
  status: 'active' | 'pending' | 'rejected';
}

export interface TeamMember {
  id: string;
  name: string;
  position?: string;
  jerseyNumber?: number;
  email?: string;
  phone?: string;
  avatar?: string;
  joinedDate?: string;
}

export interface TeamApplication {
  id: string;
  teamId: string;
  leagueId: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  dateOfBirth: string;
  sports: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  position?: string;
  teams: string[];
  gamesPlayed: number;
  stats?: {
    wins: number;
    losses: number;
    winRate: number;
  };
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'award' | 'milestone' | 'recognition' | 'publication';
}

export interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  specializations: string[];
  certifications: Certification[];
  achievements: Achievement[];
  rating: number;
  totalCamps: number;
  campsTaught: string[]; // Array of camp IDs
  avatar?: string;
  bio?: string;
  yearsOfExperience?: number;
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
  leagueId?: string;
  leagueName?: string;
  homeTeamName?: string;
  awayTeamName?: string;
  assignedReferees?: { id: string; name: string; role: string }[]; // All referees assigned to this game
}

export interface Game {
  id: string;
  leagueId?: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  location: string;
  dateTime: string;
  sport: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  homeScore?: number;
  awayScore?: number;
  round?: number;
  bracketPosition?: string;
  referee?: string;
}

export interface PlayerGameStats {
  playerId: string;
  playerName: string;
  teamId: string;
  gameId: string;
  points?: number;
  assists?: number;
  rebounds?: number;
  goals?: number;
  shots?: number;
  saves?: number;
  minutesPlayed?: number;
  fouls?: number;
  [key: string]: any; // For sport-specific stats
}

export interface GameReport {
  id: string;
  gameId: string;
  refereeId: string;
  homeScore: number;
  awayScore: number;
  incidents?: Incident[];
  notes?: string;
  submittedAt: string;
  statsImageUrl?: string; // Image of game stats sheet
  autoExtractedStats?: boolean; // Whether stats were auto-extracted from image
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

// Facility Management Types
export interface Equipment {
  id: string;
  name: string;
  category: 'sports' | 'audio-visual' | 'seating' | 'safety' | 'other';
  quantity: number;
  pricePerHour: number;
  pricePerDay: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  description?: string;
  image?: string;
}

export interface Facility {
  id: string;
  name: string;
  ownerId: string; // facility-admin user id
  ownerName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  sports: string[]; // Supported sports
  amenities: string[]; // Parking, WiFi, Locker Rooms, etc.
  capacity: number;
  squareFootage?: number;
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  hourlyRate: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  equipment: Equipment[];
  images: string[];
  availability: {
    monday: { open: string; close: string; available: boolean };
    tuesday: { open: string; close: string; available: boolean };
    wednesday: { open: string; close: string; available: boolean };
    thursday: { open: string; close: string; available: boolean };
    friday: { open: string; close: string; available: boolean };
    saturday: { open: string; close: string; available: boolean };
    sunday: { open: string; close: string; available: boolean };
  };
  rating: number;
  totalBookings: number;
  status: 'active' | 'inactive' | 'maintenance';
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
}

export interface FacilityBooking {
  id: string;
  facilityId: string;
  facilityName: string;
  bookingType: 'camp' | 'game' | 'training' | 'event';
  relatedId?: string; // camp id or game id
  bookedBy: string; // user id
  bookedByName: string;
  startDateTime: string;
  endDateTime: string;
  duration: number; // in hours
  equipmentRented: { equipmentId: string; name: string; quantity: number; cost: number }[];
  totalCost: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
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
