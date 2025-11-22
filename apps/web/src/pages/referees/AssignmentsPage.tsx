import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Divider,
  Avatar,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format } from 'date-fns';
import mockApi from '../../services/mockApi';
import { GameAssignment, League } from '../../types';

interface GroupedAssignment {
  game: GameAssignment;
  allReferees: { id: string; name: string; role: string }[];
}

interface LeagueGroup {
  league: League | null;
  assignments: GroupedAssignment[];
}

function AssignmentsPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<GameAssignment[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [statusFilter, leagueFilter]);

  async function loadData() {
    setLoading(true);
    try {
      // In a real app, this would filter by the current referee's ID
      // For demo, we'll use referee-1
      const refereeId = 'referee-1';
      
      const [assignmentsData, leaguesData] = await Promise.all([
        mockApi.getAssignments({
          refereeId,
          status: statusFilter || undefined,
          leagueId: leagueFilter || undefined,
        }),
        mockApi.getLeagues(),
      ]);
      
      setAssignments(assignmentsData);
      setLeagues(leaguesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(assignmentId: string) {
    try {
      await mockApi.confirmAssignment(assignmentId);
      loadData();
    } catch (error) {
      console.error('Failed to confirm assignment:', error);
    }
  }

  // Group assignments by game (removing duplicates) and then by league
  function groupAssignments(): LeagueGroup[] {
    const gameMap = new Map<string, GroupedAssignment>();
    
    // First, group by game ID to consolidate referee info
    assignments.forEach(assignment => {
      if (!gameMap.has(assignment.gameId)) {
        gameMap.set(assignment.gameId, {
          game: assignment,
          allReferees: assignment.assignedReferees || [],
        });
      }
    });
    
    // Convert to array and group by league
    const groupedGames = Array.from(gameMap.values());
    const leagueMap = new Map<string, LeagueGroup>();
    
    groupedGames.forEach(groupedGame => {
      const leagueId = groupedGame.game.leagueId || 'no-league';
      
      if (!leagueMap.has(leagueId)) {
        const league = leagues.find(l => l.id === leagueId) || null;
        leagueMap.set(leagueId, {
          league,
          assignments: [],
        });
      }
      
      leagueMap.get(leagueId)!.assignments.push(groupedGame);
    });
    
    // Sort assignments within each league by date
    Array.from(leagueMap.values()).forEach(group => {
      group.assignments.sort((a, b) => 
        new Date(a.game.dateTime).getTime() - new Date(b.game.dateTime).getTime()
      );
    });
    
    return Array.from(leagueMap.values());
  }

  const leagueGroups = groupAssignments();

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'primary';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Typography>Loading assignments...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Game Assignments
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View your upcoming games, co-referees, and submit reports
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="League"
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
          >
            <MenuItem value="">All Leagues</MenuItem>
            {leagues.map(league => (
              <MenuItem key={league.id} value={league.id}>
                {league.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Assignments grouped by league */}
      {leagueGroups.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No assignments found
          </Typography>
        </Box>
      ) : (
        leagueGroups.map((group, index) => (
          <Accordion key={group.league?.id || `no-league-${index}`} defaultExpanded={index === 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Typography variant="h6">
                  {group.league?.name || 'Other Games'}
                </Typography>
                <Chip 
                  label={`${group.assignments.length} game${group.assignments.length !== 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List sx={{ width: '100%' }}>
                {group.assignments.map((assignment, idx) => (
                  <Box key={assignment.game.id}>
                    {idx > 0 && <Divider />}
                    <ListItem
                      sx={{
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        py: 2,
                      }}
                    >
                      {/* Game Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {assignment.game.homeTeamName} vs {assignment.game.awayTeamName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(assignment.game.dateTime), 'EEEE, MMMM d, yyyy • h:mm a')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            📍 {assignment.game.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                          <Chip
                            label={assignment.game.status}
                            color={getStatusColor(assignment.game.status)}
                            size="small"
                          />
                          <Typography variant="body2" fontWeight="bold">
                            ${assignment.game.compensation}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Assigned Referees */}
                      <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Assigned Referees:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {assignment.allReferees.map(referee => (
                            <Box
                              key={referee.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {referee.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {referee.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {referee.role}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {assignment.game.status === 'pending' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleConfirm(assignment.game.id)}
                          >
                            Confirm Assignment
                          </Button>
                        )}
                        {assignment.game.status === 'confirmed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/games/${assignment.game.gameId}/report`)}
                          >
                            Submit Report
                          </Button>
                        )}
                        {assignment.game.status === 'completed' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/games/${assignment.game.gameId}/report`)}
                          >
                            View Report
                          </Button>
                        )}
                      </Box>
                    </ListItem>
                  </Box>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}

export default AssignmentsPage;
