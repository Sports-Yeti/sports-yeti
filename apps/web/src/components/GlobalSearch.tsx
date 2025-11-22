import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Chip,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  SportsSoccer as LeagueIcon,
  People as TeamIcon,
  Person as PlayerIcon,
  FitnessCenter as TrainerIcon,
  SportsMma as RefereeIcon,
  Event as GameIcon,
  School as CampIcon,
} from '@mui/icons-material';
import mockApi from '../services/mockApi';

interface SearchResult {
  id: string;
  type: 'league' | 'team' | 'player' | 'trainer' | 'referee' | 'game' | 'camp';
  title: string;
  subtitle?: string;
  path: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [query]);

  async function performSearch(searchQuery: string) {
    setLoading(true);
    try {
      const searchTerm = searchQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search leagues
      const leagues = await mockApi.getLeagues();
      leagues
        .filter(l => 
          l.name.toLowerCase().includes(searchTerm) ||
          l.sport.toLowerCase().includes(searchTerm) ||
          l.location.toLowerCase().includes(searchTerm)
        )
        .forEach(l => {
          allResults.push({
            id: l.id,
            type: 'league',
            title: l.name,
            subtitle: `${l.sport} • ${l.location}`,
            path: `/leagues/${l.id}`,
          });
        });

      // Search players
      const players = await mockApi.getPlayers({ search: searchTerm });
      players.slice(0, 5).forEach(p => {
        allResults.push({
          id: p.id,
          type: 'player',
          title: p.name,
          subtitle: `${p.email} • ${p.position || 'Player'}`,
          path: `/players`, // Opens player search with this player
        });
      });

      // Search trainers
      const trainers = await mockApi.getTrainers();
      trainers
        .filter(t => 
          t.name.toLowerCase().includes(searchTerm) ||
          t.email.toLowerCase().includes(searchTerm)
        )
        .forEach(t => {
          allResults.push({
            id: t.id,
            type: 'trainer',
            title: t.name,
            subtitle: t.specializations.join(', '),
            path: `/trainers/${t.id}`,
          });
        });

      // Search referees
      const referees = await mockApi.getReferees();
      referees
        .filter(r => 
          r.name.toLowerCase().includes(searchTerm) ||
          r.email.toLowerCase().includes(searchTerm)
        )
        .forEach(r => {
          allResults.push({
            id: r.id,
            type: 'referee',
            title: r.name,
            subtitle: `${r.certifications.join(', ')} • ${r.sports.join(', ')}`,
            path: `/referees/${r.id}`,
          });
        });

      // Search camps
      const camps = await mockApi.getCamps();
      camps
        .filter(c => 
          c.name.toLowerCase().includes(searchTerm) ||
          c.sport.toLowerCase().includes(searchTerm) ||
          c.location.toLowerCase().includes(searchTerm)
        )
        .forEach(c => {
          allResults.push({
            id: c.id,
            type: 'camp',
            title: c.name,
            subtitle: `${c.sport} • ${c.location}`,
            path: `/camps`,
          });
        });

      setResults(allResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case 'league': return <LeagueIcon />;
      case 'team': return <TeamIcon />;
      case 'player': return <PlayerIcon />;
      case 'trainer': return <TrainerIcon />;
      case 'referee': return <RefereeIcon />;
      case 'game': return <GameIcon />;
      case 'camp': return <CampIcon />;
      default: return <SearchIcon />;
    }
  }

  function handleSelectResult(result: SearchResult) {
    navigate(result.path);
    onClose();
    setQuery('');
  }

  function handleClose() {
    onClose();
    setQuery('');
    setResults([]);
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { position: 'fixed', top: 100, m: 2 }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <TextField
          fullWidth
          placeholder="Search leagues, players, trainers, referees, camps..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {loading ? <CircularProgress size={20} /> : <SearchIcon />}
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { border: 'none' },
            },
            p: 2,
            pb: 0,
          }}
        />

        <Divider />

        {query && results.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No results found for "{query}"
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {results.map((result, index) => (
              <ListItemButton
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleSelectResult(result)}
              >
                <ListItemIcon>
                  {getIcon(result.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {result.title}
                      <Chip label={result.type} size="small" variant="outlined" />
                    </Box>
                  }
                  secondary={result.subtitle}
                />
              </ListItemButton>
            ))}
          </List>
        )}

        {!query && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Start typing to search across all entities
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Tip: Use Ctrl+K or Cmd+K to quickly open search
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default GlobalSearch;
