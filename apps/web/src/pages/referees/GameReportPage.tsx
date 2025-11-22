import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataCard from '../../components/DataCard';
import mockApi from '../../services/mockApi';
import { Game, GameReport } from '../../types';

const incidentSchema = z.object({
  type: z.enum(['yellow_card', 'red_card', 'injury', 'other']),
  playerId: z.string().min(1, 'Player ID required'),
  playerName: z.string().min(1, 'Player name required'),
  teamId: z.string().min(1, 'Team ID required'),
  minute: z.coerce.number().min(0, 'Must be positive'),
  description: z.string().min(1, 'Description required'),
});

const gameReportSchema = z.object({
  homeScore: z.coerce.number().min(0, 'Score must be positive'),
  awayScore: z.coerce.number().min(0, 'Score must be positive'),
  notes: z.string().min(10, 'Notes must be at least 10 characters'),
  incidents: z.array(incidentSchema),
});

type GameReportFormData = z.infer<typeof gameReportSchema>;

function GameReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [existingReport, setExistingReport] = useState<GameReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, watch } = useForm<GameReportFormData>({
    resolver: zodResolver(gameReportSchema),
    defaultValues: {
      homeScore: 0,
      awayScore: 0,
      notes: '',
      incidents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'incidents',
  });

  useEffect(() => {
    async function loadGameData() {
      if (!id) return;
      
      setLoading(true);
      try {
        const [gameData, reportData] = await Promise.all([
          mockApi.getGameById(id),
          mockApi.getGameReport(id),
        ]);
        setGame(gameData);
        setExistingReport(reportData);
      } catch (error) {
        console.error('Failed to load game data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadGameData();
  }, [id]);

  const onSubmit = async (data: GameReportFormData) => {
    if (!id || !game) return;
    
    setSubmitting(true);
    try {
      const report: Omit<GameReport, 'id' | 'submittedAt'> = {
        gameId: id,
        refereeId: 'referee-1', // In real app, this would come from auth context
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        incidents: data.incidents.map((inc, idx) => ({
          ...inc,
          id: `incident-${Date.now()}-${idx}`,
        })),
        notes: data.notes,
      };
      
      await mockApi.submitGameReport(report);
      navigate('/assignments');
    } catch (error) {
      console.error('Failed to submit game report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading game details..." />;
  }

  if (!game) {
    return (
      <Box>
        <Typography variant="h6">Game not found</Typography>
        <Button onClick={() => navigate('/assignments')} startIcon={<BackIcon />}>
          Back to Assignments
        </Button>
      </Box>
    );
  }

  if (existingReport) {
    return (
      <Box>
        <Button
          onClick={() => navigate('/assignments')}
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Assignments
        </Button>

        <Typography variant="h4" gutterBottom>
          Game Report
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DataCard>
              <Typography variant="h6" gutterBottom>
                Game Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                <strong>Date:</strong> {format(new Date(game.dateTime), 'MMM d, yyyy h:mm a')}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Location:</strong> {game.location}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Sport:</strong> {game.sport}
              </Typography>
              <Typography variant="body2">
                <strong>Final Score:</strong> {existingReport.homeScore} - {existingReport.awayScore}
              </Typography>
            </DataCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <DataCard>
              <Typography variant="h6" gutterBottom>
                Report Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" paragraph>
                <strong>Submitted:</strong> {format(new Date(existingReport.submittedAt), 'MMM d, yyyy h:mm a')}
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Incidents:</strong> {existingReport.incidents?.length || 0}
              </Typography>
              <Typography variant="body2">
                <strong>Notes:</strong>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {existingReport.notes}
              </Typography>
            </DataCard>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        onClick={() => navigate('/assignments')}
        startIcon={<BackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Assignments
      </Button>

      <Typography variant="h4" gutterBottom>
        Submit Game Report
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Game Information
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Date:</strong> {format(new Date(game.dateTime), 'MMM d, yyyy h:mm a')}
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Location:</strong> {game.location}
        </Typography>
        <Typography variant="body2" gutterBottom>
          <strong>Sport:</strong> {game.sport}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormInput
                name="homeScore"
                control={control}
                label="Home Team Score"
                type="number"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="awayScore"
                control={control}
                label="Away Team Score"
                type="number"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Incidents</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    append({
                      type: 'yellow_card',
                      playerId: '',
                      playerName: '',
                      teamId: '',
                      minute: 0,
                      description: '',
                    })
                  }
                >
                  Add Incident
                </Button>
              </Box>

              {fields.map((field, index) => (
                <Paper key={field.id} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={watch(`incidents.${index}.type`)}
                          label="Type"
                        >
                          <MenuItem value="yellow_card">Yellow Card</MenuItem>
                          <MenuItem value="red_card">Red Card</MenuItem>
                          <MenuItem value="injury">Injury</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <FormInput
                        name={`incidents.${index}.minute` as any}
                        control={control}
                        label="Minute"
                        type="number"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <FormInput
                        name={`incidents.${index}.playerName` as any}
                        control={control}
                        label="Player Name"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <FormInput
                        name={`incidents.${index}.playerId` as any}
                        control={control}
                        label="Player ID"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={1} display="flex" alignItems="center">
                      <IconButton color="error" onClick={() => remove(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>

                    <Grid item xs={12}>
                      <FormInput
                        name={`incidents.${index}.description` as any}
                        control={control}
                        label="Description"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="notes"
                control={control}
                label="General Notes"
                multiline
                rows={6}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/assignments')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default GameReportPage;
