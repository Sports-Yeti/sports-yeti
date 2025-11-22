import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';
import { 
  Edit as EditIcon, 
  ArrowBack as BackIcon, 
  PendingActions as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { League, Team, Player } from '../../types';

function LeagueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);

  useEffect(() => {
    async function loadLeagueDetails() {
      if (!id) return;
      
      setLoading(true);
      try {
        const [leagueData, teamsData, applications] = await Promise.all([
          mockApi.getLeagueById(id),
          mockApi.getTeamsByLeague(id),
          mockApi.getTeamApplications({ leagueId: id, status: 'pending' }),
        ]);
        setLeague(leagueData);
        setTeams(teamsData.filter(t => t.status === 'active')); // Only show active teams
        setPendingApplications(applications.length);
      } catch (error) {
        console.error('Failed to load league details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadLeagueDetails();
  }, [id]);

  async function handleViewPlayer(playerId: string) {
    try {
      const playerData = await mockApi.getPlayerById(playerId);
      if (playerData) {
        setSelectedPlayer(playerData);
        setPlayerDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to load player details:', error);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading league details..." />;
  }

  if (!league) {
    return (
      <Box>
        <Typography variant="h6">League not found</Typography>
        <Button onClick={() => navigate('/leagues')} startIcon={<BackIcon />}>
          Back to Leagues
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        onClick={() => navigate('/leagues')}
        startIcon={<BackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Leagues
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">{league.name}</Typography>
        <Box display="flex" gap={2}>
          <Badge badgeContent={pendingApplications} color="error">
            <Button
              variant="outlined"
              startIcon={<PendingIcon />}
              onClick={() => navigate(`/leagues/${id}/applications`)}
            >
              Team Applications
            </Button>
          </Badge>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/leagues/${id}/edit`)}
          >
            Edit League
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* League Information */}
        <Grid item xs={12} md={6}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              League Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Sport"
                  secondary={
                    <Chip label={league.sport} color="primary" size="small" />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Status"
                  secondary={
                    <Chip
                      label={league.status}
                      color={
                        league.status === 'active'
                          ? 'success'
                          : league.status === 'upcoming'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Location"
                  secondary={league.location}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Season"
                  secondary={`${format(new Date(league.startDate), 'MMM d, yyyy')} - ${format(new Date(league.endDate), 'MMM d, yyyy')}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Teams"
                  secondary={`${league.registeredTeams} / ${league.maxTeams} registered`}
                />
              </ListItem>
            </List>
          </DataCard>
        </Grid>

        {/* Description & Rules */}
        <Grid item xs={12} md={6}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              {league.description}
            </Typography>

            {league.rules && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Rules
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                  {league.rules}
                </Typography>
              </>
            )}
          </DataCard>
        </Grid>

        {/* Teams with Players */}
        <Grid item xs={12}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Registered Teams ({teams.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {teams.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No teams registered yet
              </Typography>
            ) : (
              <Box>
                {teams.map((team) => (
                  <Accordion key={team.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" gap={2} width="100%">
                        <Avatar src={team.logo} alt={team.name}>
                          {team.name[0]}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">{team.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {team.members.length} players • {team.wins}W - {team.losses}L - {team.draws}D
                          </Typography>
                        </Box>
                        <Chip 
                          label={team.status} 
                          size="small" 
                          color={team.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box>
                        {team.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {team.description}
                          </Typography>
                        )}
                        
                        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                          Team Members ({team.members.length})
                        </Typography>
                        <List dense>
                          {team.members.map((member) => (
                            <ListItemButton 
                              key={member.id}
                              onClick={() => handleViewPlayer(member.id)}
                              sx={{ borderRadius: 1 }}
                            >
                              <ListItemAvatar>
                                <Avatar src={member.avatar} alt={member.name}>
                                  {member.name[0]}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={member.name}
                                secondary={
                                  <>
                                    {member.position && `${member.position} • `}
                                    {member.jerseyNumber && `#${member.jerseyNumber} • `}
                                    {member.email}
                                    {member.joinedDate && ` • Joined ${format(new Date(member.joinedDate), 'MMM d, yyyy')}`}
                                  </>
                                }
                              />
                              <IconButton size="small">
                                <ViewIcon />
                              </IconButton>
                            </ListItemButton>
                          ))}
                        </List>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </DataCard>
        </Grid>
      </Grid>

      {/* Player Details Dialog */}
      <Dialog open={playerDialogOpen} onClose={() => setPlayerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Player Profile</DialogTitle>
        <DialogContent>
          {selectedPlayer && (
            <Box>
              {/* Header */}
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  src={selectedPlayer.avatar}
                  alt={selectedPlayer.name}
                  sx={{ width: 80, height: 80 }}
                >
                  {selectedPlayer.name[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedPlayer.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPlayer.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPlayer.phone}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Details */}
              <List>
                <ListItem>
                  <ListItemText
                    primary="Date of Birth"
                    secondary={format(new Date(selectedPlayer.dateOfBirth), 'MMMM d, yyyy')}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Sports"
                    secondary={
                      <Box display="flex" gap={0.5} mt={1}>
                        {selectedPlayer.sports.map((sport) => (
                          <Chip key={sport} label={sport} size="small" />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Skill Level"
                    secondary={
                      <Chip
                        label={selectedPlayer.skillLevel}
                        size="small"
                        color={
                          selectedPlayer.skillLevel === 'professional'
                            ? 'error'
                            : selectedPlayer.skillLevel === 'advanced'
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ mt: 1 }}
                      />
                    }
                  />
                </ListItem>
                {selectedPlayer.position && (
                  <ListItem>
                    <ListItemText
                      primary="Preferred Position"
                      secondary={selectedPlayer.position}
                    />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemText
                    primary="Teams"
                    secondary={selectedPlayer.teams.length > 0 ? `${selectedPlayer.teams.length} team(s)` : 'No teams'}
                  />
                </ListItem>
              </List>

              {/* Stats */}
              {selectedPlayer.stats && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="primary">
                          {selectedPlayer.gamesPlayed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Games Played
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="success.main">
                          {selectedPlayer.stats.wins}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Wins
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" color="primary">
                          {(selectedPlayer.stats.winRate * 100).toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Win Rate
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlayerDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setPlayerDialogOpen(false);
              navigate('/players');
            }}
          >
            View All Players
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LeagueDetailsPage;
