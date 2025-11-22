import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import DataTable, { Column } from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { Player } from '../../types';
import { format } from 'date-fns';

function PlayerSearchPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [skillLevelFilter, setSkillLevelFilter] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, [searchTerm, sportFilter, skillLevelFilter]);

  async function loadPlayers() {
    setLoading(true);
    try {
      const data = await mockApi.getPlayers({
        search: searchTerm || undefined,
        sport: sportFilter || undefined,
        skillLevel: skillLevelFilter || undefined,
      });
      setPlayers(data);
    } catch (error) {
      console.error('Failed to load players:', error);
    } finally {
      setLoading(false);
    }
  }

  function viewPlayerProfile(player: Player) {
    setSelectedPlayer(player);
    setProfileDialogOpen(true);
  }

  const columns: Column<Player>[] = [
    {
      id: 'name',
      label: 'Player',
      minWidth: 200,
      format: (value, row) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={row.avatar} alt={value}>
            {value[0]}
          </Avatar>
          {value}
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
    },
    {
      id: 'sports',
      label: 'Sports',
      minWidth: 150,
      format: (value: string[]) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {value.map((sport) => (
            <Chip key={sport} label={sport} size="small" />
          ))}
        </Box>
      ),
    },
    {
      id: 'skillLevel',
      label: 'Skill Level',
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color={
            value === 'professional'
              ? 'error'
              : value === 'advanced'
              ? 'warning'
              : value === 'intermediate'
              ? 'info'
              : 'default'
          }
        />
      ),
    },
    {
      id: 'position',
      label: 'Position',
      minWidth: 150,
      format: (value) => value || '-',
    },
    {
      id: 'gamesPlayed',
      label: 'Games Played',
      minWidth: 120,
    },
    {
      id: 'stats',
      label: 'Win Rate',
      minWidth: 100,
      format: (value) => value ? `${(value.winRate * 100).toFixed(0)}%` : '-',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Player Search
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Search and view player profiles across the platform
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Sport"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            <MenuItem value="">All Sports</MenuItem>
            <MenuItem value="basketball">Basketball</MenuItem>
            <MenuItem value="soccer">Soccer</MenuItem>
            <MenuItem value="tennis">Tennis</MenuItem>
            <MenuItem value="volleyball">Volleyball</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Skill Level"
            value={skillLevelFilter}
            onChange={(e) => setSkillLevelFilter(e.target.value)}
          >
            <MenuItem value="">All Levels</MenuItem>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Players Table */}
      {loading ? (
        <LoadingSpinner message="Loading players..." />
      ) : (
        <DataTable
          columns={columns}
          rows={players}
          onRowClick={viewPlayerProfile}
          emptyMessage="No players found"
        />
      )}

      {/* Player Profile Dialog */}
      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setProfileDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PlayerSearchPage;
