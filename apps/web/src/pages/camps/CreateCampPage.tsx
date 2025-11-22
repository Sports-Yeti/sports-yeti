import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import mockApi from '../../services/mockApi';
import { Camp } from '../../types';

const campSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  trainerId: z.string().min(1, 'Trainer is required'),
  sport: z.string().min(1, 'Sport is required'),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  maxParticipants: z.coerce.number().min(5, 'Minimum 5 participants'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  ageGroup: z.string().min(1, 'Age group is required'),
  skillLevel: z.string().min(1, 'Skill level is required'),
});

type CampFormData = z.infer<typeof campSchema>;

function CreateCampPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<CampFormData>({
    resolver: zodResolver(campSchema),
    defaultValues: {
      name: '',
      trainerId: 'trainer-1',
      sport: 'basketball',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      maxParticipants: 30,
      price: 299,
      ageGroup: '10-14',
      skillLevel: 'beginner',
    },
  });

  const onSubmit = async (data: CampFormData) => {
    setSubmitting(true);
    try {
      const newCamp: Omit<Camp, 'id' | 'registeredParticipants'> = data;
      await mockApi.createCamp(newCamp);
      navigate('/camps');
    } catch (error) {
      console.error('Failed to create camp:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Button
        onClick={() => navigate('/camps')}
        startIcon={<BackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Camps
      </Button>

      <Typography variant="h4" gutterBottom>
        Create New Camp
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormInput name="name" control={control} label="Camp Name" />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSelect
                name="trainerId"
                control={control}
                label="Trainer"
                options={[
                  { value: 'trainer-1', label: 'Mike Johnson' },
                  { value: 'trainer-2', label: 'Sarah Williams' },
                  { value: 'trainer-3', label: 'David Martinez' },
                ]}
              />
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

            <Grid item xs={12} md={4}>
              <FormInput
                name="maxParticipants"
                control={control}
                label="Maximum Participants"
                type="number"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput
                name="price"
                control={control}
                label="Price ($)"
                type="number"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormInput name="ageGroup" control={control} label="Age Group (e.g., 10-14)" />
            </Grid>

            <Grid item xs={12}>
              <FormSelect
                name="skillLevel"
                control={control}
                label="Skill Level"
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
              />
            </Grid>

            <Grid item xs={12}>
              <FormInput
                name="description"
                control={control}
                label="Description"
                multiline
                rows={6}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/camps')}
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
                  {submitting ? 'Creating...' : 'Create Camp'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default CreateCampPage;
