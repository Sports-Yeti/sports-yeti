import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Alert,
  TextField,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Sports as SportsIcon,
  AutoAwesome as AutoIcon,
  ViewList as ListIcon,
  AccountTree as BracketIcon,
} from '@mui/icons-material';
import { format, addDays } from 'date-fns';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import DataTable, { Column } from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import BracketView from '../../components/BracketView';
import mockApi from '../../services/mockApi';
import { League, Game, Team } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';

const gameSchema = z.object({
  homeTeamId: z.string().min(1, 'Home team required'),
  awayTeamId: z.string().min(1, 'Away team required'),
  dateTime: z.string().min(1, 'Date and time required'),
  location: z.string().min(1, 'Location required'),
  round: z.coerce.number().min(1).optional(),
  referee: z.string().optional(),
});

type GameFormData = z.infer<typeof gameSchema>;

function GameSchedulingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoScheduleDialogOpen, setAutoScheduleDialogOpen] = useState(false);
  const [seasonFormat, setSeasonFormat] = useState<string>('round-robin');
  const [gamesPerTeam, setGamesPerTeam] = useState<number>(6);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'bracket'>('list');

  const { control, handleSubmit, reset } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      homeTeamId: '',
      awayTeamId: '',
      dateTime: '',
      location: '',
      round: 1,
      referee: '',
    },
  });

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    
    setLoading(true);
    try {
      const [leagueData, teamsData, gamesData] = await Promise.all([
        mockApi.getLeagueById(id),
        mockApi.getTeamsByLeague(id),
        mockApi.getGames({ leagueId: id }),
      ]);
      
      setLeague(leagueData);
      setTeams(teamsData);
      setGames(gamesData);
      
      if (leagueData?.seasonFormat) {
        setSeasonFormat(leagueData.seasonFormat);
      }
      if (leagueData?.gamesPerTeam) {
        setGamesPerTeam(leagueData.gamesPerTeam);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showNotification('error', 'Failed to load league data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSeasonFormat() {
    if (!id) return;
    
    try {
      await mockApi.updateLeague(id, {
        seasonFormat: seasonFormat as any,
        gamesPerTeam,
      });
      
      showNotification('success', 'Season format updated successfully');
      loadData();
    } catch (error) {
      console.error('Failed to update season format:', error);
      showNotification('error', 'Failed to update season format');
    }
  }

  async function handleAutoSchedule() {
    if (!id) return;
    
    try {
      const newGames = await mockApi.generateSchedule(id, seasonFormat);
      showNotification('success', `Generated ${newGames.length} games successfully!`);
      setAutoScheduleDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to generate schedule:', error);
      showNotification('error', 'Failed to generate schedule');
    }
  }

  function handleAddGame() {
    setEditingGame(null);
    reset({
      homeTeamId: '',
      awayTeamId: '',
      dateTime: '',
      location: league?.location || '',
      round: 1,
      referee: '',
    });
    setDialogOpen(true);
  }

  function handleEditGame(game: Game) {
    setEditingGame(game);
    reset({
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      dateTime: game.dateTime,
      location: game.location,
      round: game.round || 1,
      referee: game.referee || '',
    });
    setDialogOpen(true);
  }

  async function handleDeleteGame(gameId: string) {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    try {
      await mockApi.deleteGame(gameId);
      showNotification('success', 'Game deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete game:', error);
      showNotification('error', 'Failed to delete game');
    }
  }

  const onSubmit = async (data: GameFormData) => {
    if (!id) return;
    
    try {
      const homeTeam = teams.find(t => t.id === data.homeTeamId);
      const awayTeam = teams.find(t => t.id === data.awayTeamId);
      
      if (!homeTeam || !awayTeam) {
        showNotification('error', 'Invalid team selection');
        return;
      }

      const gameData = {
        leagueId: id,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        homeTeamName: homeTeam.name,
        awayTeamName: awayTeam.name,
        location: data.location,
        dateTime: data.dateTime,
        sport: league?.sport || '',
        status: 'scheduled' as const,
        round: data.round,
        referee: data.referee || undefined,
      };

      if (editingGame) {
        await mockApi.updateGame(editingGame.id, gameData);
        showNotification('success', 'Game updated successfully');
      } else {
        await mockApi.createGame(gameData);
        showNotification('success', 'Game created successfully');
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save game:', error);
      showNotification('error', 'Failed to save game');
    }
  };

  const gameColumns: Column<Game>[] = [
    {
      id: 'dateTime',
      label: 'Date & Time',
      minWidth: 150,
      format: (value) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    },
    {
      id: 'homeTeamName',
      label: 'Match',
      minWidth: 250,
      format: (_value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {row.homeTeamName} vs {row.awayTeamName}
          </Typography>
          {row.homeScore !== undefined && row.awayScore !== undefined && (
            <Typography variant="caption" color="text.secondary">
              Score: {row.homeScore} - {row.awayScore}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      minWidth: 150,
    },
    {
      id: 'round',
      label: 'Round',
      minWidth: 80,
      format: (value) => value ? `Round ${value}` : '-',
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color={
            value === 'completed' ? 'success' :
            value === 'in-progress' ? 'primary' :
            value === 'scheduled' ? 'default' : 'warning'
          }
        />
      ),
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 150,
      format: (_value, row) => (
        <Box display="flex" gap={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              handleEditGame(row);
            }}
          >
            Edit
          </Button>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteGame(row.id);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading league schedule..." />;
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
        onClick={() => navigate(`/leagues/${id}`)}
        startIcon={<BackIcon />}
        sx={{ mb: 2 }}
      >
        Back to League Details
      </Button>

      <Typography variant="h4" gutterBottom>
        Game Scheduling: {league.name}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage games and schedule for this league
      </Typography>

      {/* Season Format Configuration */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <SportsIcon /> Season Format Configuration
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Season Format</InputLabel>
              <Select
                value={seasonFormat}
                label="Season Format"
                onChange={(e) => setSeasonFormat(e.target.value)}
              >
                <MenuItem value="round-robin">Round Robin (Everyone plays everyone)</MenuItem>
                <MenuItem value="single-elimination">Single Elimination (Bracket)</MenuItem>
                <MenuItem value="double-elimination">Double Elimination (Bracket with losers bracket)</MenuItem>
                <MenuItem value="swiss">Swiss System (Balanced matchmaking)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {seasonFormat === 'round-robin' && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Games Per Team"
                value={gamesPerTeam}
                onChange={(e) => setGamesPerTeam(parseInt(e.target.value) || 0)}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>{seasonFormat === 'round-robin' ? 'Round Robin' : 
                       seasonFormat === 'single-elimination' ? 'Single Elimination' :
                       seasonFormat === 'double-elimination' ? 'Double Elimination' : 'Swiss System'}:</strong>
              {' '}
              {seasonFormat === 'round-robin' && 'Each team plays against every other team an equal number of times.'}
              {seasonFormat === 'single-elimination' && 'Teams are eliminated after one loss. Winner advances in bracket.'}
              {seasonFormat === 'double-elimination' && 'Teams get a second chance in losers bracket before elimination.'}
              {seasonFormat === 'swiss' && 'Teams are paired based on similar records, ensuring competitive matches.'}
            </Alert>
            
            <Button
              variant="contained"
              onClick={handleSaveSeasonFormat}
              sx={{ mr: 2 }}
            >
              Save Format
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<AutoIcon />}
              onClick={() => setAutoScheduleDialogOpen(true)}
            >
              Auto-Generate Schedule
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Games List */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6">Scheduled Games ({games.length})</Typography>
            
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="list">
                <ListIcon sx={{ mr: 0.5 }} fontSize="small" />
                List
              </ToggleButton>
              <ToggleButton value="bracket">
                <BracketIcon sx={{ mr: 0.5 }} fontSize="small" />
                Bracket
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddGame}
          >
            Add Game
          </Button>
        </Box>

        {viewMode === 'list' ? (
          <DataTable
            columns={gameColumns}
            rows={games}
            emptyMessage="No games scheduled yet. Click 'Add Game' or use auto-generate."
          />
        ) : (
          <BracketView
            games={games}
            teams={teams}
            format={seasonFormat}
          />
        )}
      </Paper>

      {/* Add/Edit Game Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingGame ? 'Edit Game' : 'Add New Game'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormSelect
                  name="homeTeamId"
                  control={control}
                  label="Home Team"
                  options={teams.map(t => ({ value: t.id, label: t.name }))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormSelect
                  name="awayTeamId"
                  control={control}
                  label="Away Team"
                  options={teams.map(t => ({ value: t.id, label: t.name }))}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormInput
                  name="dateTime"
                  control={control}
                  label="Date & Time"
                  type="datetime-local"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormInput
                  name="location"
                  control={control}
                  label="Location"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormInput
                  name="round"
                  control={control}
                  label="Round"
                  type="number"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormInput
                  name="referee"
                  control={control}
                  label="Referee (Optional)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingGame ? 'Update' : 'Create'} Game
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Auto-Schedule Confirmation Dialog */}
      <Dialog
        open={autoScheduleDialogOpen}
        onClose={() => setAutoScheduleDialogOpen(false)}
      >
        <DialogTitle>Auto-Generate Schedule</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will generate games based on the current season format. Any existing games will be preserved.
          </Alert>
          
          <Typography variant="body2" paragraph>
            <strong>Season Format:</strong> {seasonFormat}
          </Typography>
          
          <Typography variant="body2" paragraph>
            <strong>Number of Teams:</strong> {teams.length}
          </Typography>
          
          {seasonFormat === 'round-robin' && (
            <Typography variant="body2" paragraph>
              <strong>Games Per Team:</strong> {gamesPerTeam}
              <br />
              <strong>Total Games to Generate:</strong> ~{Math.floor(teams.length * gamesPerTeam / 2)}
            </Typography>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Games will be scheduled starting from {format(addDays(new Date(), 7), 'MMM d, yyyy')}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoScheduleDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAutoSchedule}
            startIcon={<AutoIcon />}
          >
            Generate Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default GameSchedulingPage;
