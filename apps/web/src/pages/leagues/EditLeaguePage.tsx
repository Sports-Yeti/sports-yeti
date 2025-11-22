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
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';

const leagueSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  sport: z.string().min(1, 'Sport is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['active', 'upcoming', 'completed']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  maxTeams: z.coerce.number().min(2, 'Minimum 2 teams'),
  rules: z.string().optional(),
});

type LeagueFormData = z.infer<typeof leagueSchema>;

function EditLeaguePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, reset } = useForm<LeagueFormData>({
    resolver: zodResolver(leagueSchema),
  });

  useEffect(() => {
    async function loadLeague() {
      if (!id) return;
      
      setLoading(true);
      try {
        const league = await mockApi.getLeagueById(id);
        if (league) {
          reset({
            name: league.name,
            sport: league.sport,
            location: league.location,
            status: league.status,
            startDate: league.startDate,
            endDate: league.endDate,
            description: league.description,
            maxTeams: league.maxTeams,
            rules: league.rules,
          });
        }
      } catch (error) {
        console.error('Failed to load league:', error);
      } finally {
        setLoading(false);
      }
    }

    loadLeague();
  }, [id, reset]);

  const onSubmit = async (data: LeagueFormData) => {
    if (!id) return;
    
    setSubmitting(true);
    try {
      await mockApi.updateLeague(id, data);
      navigate(`/leagues/${id}`);
    } catch (error) {
      console.error('Failed to update league:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading league..." />;
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
        Edit League
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormInput name="name" control={control} label="League Name" />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="sport"
                control={control}
                label="Sport"
                options={[
                  { value: 'basketball', label: 'Basketball' },
                  { value: 'soccer', label: 'Soccer' },
                  { value: 'tennis', label: 'Tennis' },
                  { value: 'volleyball', label: 'Volleyball' },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput name="location" control={control} label="Location" />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="status"
                control={control}
                label="Status"
                options={[
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="startDate"
                control={control}
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="endDate"
                control={control}
                label="End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormInput
                name="maxTeams"
                control={control}
                label="Maximum Teams"
                type="number"
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="description"
                control={control}
                label="Description"
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="rules"
                control={control}
                label="Rules (Optional)"
                multiline
                rows={6}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/leagues/${id}`)}
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
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default EditLeaguePage;
