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
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as BackIcon, PendingActions as PendingIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import DataCard from '../../components/DataCard';
import DataTable, { Column } from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { League, Team } from '../../types';

function LeagueDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [loading, setLoading] = useState(true);

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
        setTeams(teamsData);
        setPendingApplications(applications.length);
      } catch (error) {
        console.error('Failed to load league details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadLeagueDetails();
  }, [id]);

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

  const teamColumns: Column<Team>[] = [
    { id: 'name', label: 'Team Name', minWidth: 200 },
    { id: 'wins', label: 'Wins', minWidth: 80 },
    { id: 'losses', label: 'Losses', minWidth: 80 },
    { id: 'draws', label: 'Draws', minWidth: 80 },
    {
      id: 'members',
      label: 'Members',
      minWidth: 80,
      format: (value) => value.length,
    },
  ];

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

        {/* Teams Table */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Registered Teams
          </Typography>
          <DataTable
            columns={teamColumns}
            rows={teams}
            emptyMessage="No teams registered yet"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default LeagueDetailsPage;
