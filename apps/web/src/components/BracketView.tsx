import { Box, Paper, Typography, Chip } from '@mui/material';
import { Game, Team } from '../types';

interface BracketMatch {
  id: string;
  round: number;
  position: number;
  team1?: { id: string; name: string; seed?: number; score?: number };
  team2?: { id: string; name: string; seed?: number; score?: number };
  winner?: string;
  game?: Game;
}

interface BracketViewProps {
  games: Game[];
  teams: Team[];
  format: string;
}

function BracketView({ games, format }: BracketViewProps) {
  // Organize games into bracket structure
  const organizeBracket = (): BracketMatch[][] => {
    if (format !== 'single-elimination' && format !== 'double-elimination') {
      return [];
    }

    // Group games by round
    const gamesByRound = games.reduce((acc, game) => {
      const round = game.round || 1;
      if (!acc[round]) acc[round] = [];
      acc[round].push(game);
      return acc;
    }, {} as Record<number, Game[]>);

    // Convert to bracket structure
    const rounds: BracketMatch[][] = [];
    const maxRound = Math.max(...Object.keys(gamesByRound).map(Number));

    for (let round = 1; round <= maxRound; round++) {
      const roundGames = gamesByRound[round] || [];
      const matches: BracketMatch[] = roundGames.map((game, idx) => ({
        id: game.id,
        round,
        position: idx,
        team1: {
          id: game.homeTeamId,
          name: game.homeTeamName || 'TBD',
          score: game.homeScore,
        },
        team2: {
          id: game.awayTeamId,
          name: game.awayTeamName || 'TBD',
          score: game.awayScore,
        },
        winner: game.status === 'completed' ? (
          game.homeScore !== undefined && game.awayScore !== undefined ?
            (game.homeScore > game.awayScore ? game.homeTeamId : game.awayTeamId) :
            undefined
        ) : undefined,
        game,
      }));
      rounds.push(matches);
    }

    return rounds;
  };

  const bracketRounds = organizeBracket();

  if (bracketRounds.length === 0) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight={400}
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h6" color="text.secondary">
          No Bracket Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bracket view is only available for elimination tournaments.
          Current format: {format}
        </Typography>
      </Box>
    );
  }

  const getRoundName = (roundIndex: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - roundIndex;
    if (roundsFromEnd === 0) return 'Champion';
    if (roundsFromEnd === 1) return 'Finals';
    if (roundsFromEnd === 2) return 'Semi-Finals';
    if (roundsFromEnd === 3) return 'Quarter-Finals';
    return `Round ${roundIndex + 1}`;
  };

  const getMatchHeight = (roundIndex: number) => {
    return 120 * Math.pow(2, roundIndex);
  };

  const getMatchMargin = (roundIndex: number) => {
    return 60 * Math.pow(2, roundIndex) - 60;
  };

  return (
    <Box 
      sx={{ 
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 2,
      }}
    >
      <Box 
        display="flex" 
        gap={4} 
        sx={{ 
          minWidth: 'fit-content',
          py: 4,
          px: 2,
        }}
      >
        {bracketRounds.map((round, roundIndex) => (
          <Box key={roundIndex} display="flex" flexDirection="column" gap={2}>
            {/* Round Header */}
            <Typography 
              variant="h6" 
              textAlign="center" 
              fontWeight="bold"
              sx={{ mb: 2, minHeight: 32 }}
            >
              {getRoundName(roundIndex, bracketRounds.length)}
            </Typography>

            {/* Matches in this round */}
            <Box 
              display="flex" 
              flexDirection="column" 
              justifyContent="space-around"
              sx={{ 
                flex: 1,
                gap: `${getMatchMargin(roundIndex)}px`,
              }}
            >
              {round.map((match) => (
                <Box 
                  key={match.id}
                  sx={{ 
                    position: 'relative',
                    height: `${getMatchHeight(roundIndex)}px`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      width: 200,
                      bgcolor: 'background.paper',
                      border: '2px solid',
                      borderColor: match.game?.status === 'completed' ? 'success.main' : 'divider',
                      position: 'relative',
                    }}
                  >
                    {/* Team 1 */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: match.winner === match.team1?.id ? 'success.50' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        fontWeight={match.winner === match.team1?.id ? 'bold' : 'normal'}
                        sx={{ 
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {match.team1?.name || 'TBD'}
                      </Typography>
                      {match.team1?.score !== undefined && (
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          sx={{ ml: 1, minWidth: 24, textAlign: 'center' }}
                        >
                          {match.team1.score}
                        </Typography>
                      )}
                    </Box>

                    {/* Team 2 */}
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: match.winner === match.team2?.id ? 'success.50' : 'transparent',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography 
                        variant="body2"
                        fontWeight={match.winner === match.team2?.id ? 'bold' : 'normal'}
                        sx={{ 
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {match.team2?.name || 'TBD'}
                      </Typography>
                      {match.team2?.score !== undefined && (
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          sx={{ ml: 1, minWidth: 24, textAlign: 'center' }}
                        >
                          {match.team2.score}
                        </Typography>
                      )}
                    </Box>

                    {/* Status Badge */}
                    {match.game && (
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          top: -10,
                          right: -10,
                        }}
                      >
                        <Chip
                          label={match.game.status}
                          size="small"
                          color={
                            match.game.status === 'completed' ? 'success' :
                            match.game.status === 'in_progress' ? 'primary' :
                            'default'
                          }
                        />
                      </Box>
                    )}
                  </Paper>

                  {/* Connector lines to next round */}
                  {roundIndex < bracketRounds.length - 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        width: 32,
                        height: 2,
                        bgcolor: 'divider',
                        zIndex: 0,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        {/* Champion Box */}
        {bracketRounds.length > 0 && bracketRounds[bracketRounds.length - 1].length === 1 && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              🏆
            </Typography>
            <Paper
              elevation={4}
              sx={{
                width: 220,
                p: 3,
                bgcolor: 'warning.light',
                border: '3px solid',
                borderColor: 'warning.main',
                textAlign: 'center',
              }}
            >
              <Typography variant="overline" color="text.secondary" display="block">
                CHAMPION
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>
                {bracketRounds[bracketRounds.length - 1][0].winner ? 
                  (bracketRounds[bracketRounds.length - 1][0].winner === bracketRounds[bracketRounds.length - 1][0].team1?.id ?
                    bracketRounds[bracketRounds.length - 1][0].team1?.name :
                    bracketRounds[bracketRounds.length - 1][0].team2?.name) :
                  'TBD'
                }
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default BracketView;
