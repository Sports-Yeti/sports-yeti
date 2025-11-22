import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  Rating,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ArrowBack as BackIcon, School as CampIcon } from '@mui/icons-material';
import DataCard from '../../components/DataCard';
import DataTable, { Column } from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { Trainer, Camp } from '../../types';
import { format } from 'date-fns';

function TrainerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrainerDetails() {
      if (!id) return;
      
      setLoading(true);
      try {
        const [trainerData, campsData] = await Promise.all([
          mockApi.getTrainerById(id),
          mockApi.getCamps({ trainerId: id }),
        ]);
        setTrainer(trainerData);
        setCamps(campsData);
      } catch (error) {
        console.error('Failed to load trainer details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrainerDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading trainer details..." />;
  }

  if (!trainer) {
    return (
      <Box>
        <Typography variant="h6">Trainer not found</Typography>
        <Button onClick={() => navigate('/trainers')} startIcon={<BackIcon />}>
          Back to Trainers
        </Button>
      </Box>
    );
  }

  const campColumns: Column<Camp>[] = [
    { id: 'name', label: 'Camp Name', minWidth: 200 },
    {
      id: 'startDate',
      label: 'Start Date',
      minWidth: 120,
      format: (value) => format(new Date(value), 'MMM d, yyyy'),
    },
    {
      id: 'registeredParticipants',
      label: 'Participants',
      minWidth: 120,
      format: (value, row) => `${value}/${row.maxParticipants}`,
    },
    {
      id: 'price',
      label: 'Price',
      minWidth: 100,
      format: (value) => `$${value}`,
    },
    { id: 'skillLevel', label: 'Skill Level', minWidth: 100 },
  ];

  return (
    <Box>
      <Button
        onClick={() => navigate('/trainers')}
        startIcon={<BackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Trainers
      </Button>

      <Grid container spacing={3}>
        {/* Trainer Profile */}
        <Grid item xs={12} md={4}>
          <DataCard>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={trainer.avatar}
                alt={trainer.name}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {trainer.name[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {trainer.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Rating value={trainer.rating} readOnly precision={0.1} />
                <Typography variant="body2">({trainer.rating})</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {trainer.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {trainer.phone}
              </Typography>
            </Box>
          </DataCard>
        </Grid>

        {/* Trainer Information */}
        <Grid item xs={12} md={8}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Trainer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Specializations"
                  secondary={
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                      {trainer.specializations.map((spec) => (
                        <Chip key={spec} label={spec} size="small" />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Certifications"
                  secondary={
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                      {trainer.certifications.map((cert) => (
                        <Chip key={cert} label={cert} size="small" color="primary" />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Total Camps Conducted"
                  secondary={trainer.totalCamps}
                />
              </ListItem>
            </List>
          </DataCard>
        </Grid>

        {/* Camps */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Camps</Typography>
            <Button
              variant="contained"
              startIcon={<CampIcon />}
              onClick={() => navigate('/camps/create')}
            >
              Create Camp
            </Button>
          </Box>
          <DataTable
            columns={campColumns}
            rows={camps}
            onRowClick={(camp) => navigate(`/camps/${camp.id}`)}
            emptyMessage="No camps found for this trainer"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default TrainerDetailsPage;
