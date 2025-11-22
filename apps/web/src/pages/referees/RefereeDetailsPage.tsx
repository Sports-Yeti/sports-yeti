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
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import DataCard from '../../components/DataCard';
import DataTable, { Column } from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { Referee, GameAssignment } from '../../types';

function RefereeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [referee, setReferee] = useState<Referee | null>(null);
  const [assignments, setAssignments] = useState<GameAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRefereeDetails() {
      if (!id) return;
      
      setLoading(true);
      try {
        const [refereeData, assignmentsData] = await Promise.all([
          mockApi.getRefereeById(id),
          mockApi.getAssignments({ refereeId: id }),
        ]);
        setReferee(refereeData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Failed to load referee details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRefereeDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading referee details..." />;
  }

  if (!referee) {
    return (
      <Box>
        <Typography variant="h6">Referee not found</Typography>
        <Button onClick={() => navigate('/referees')} startIcon={<BackIcon />}>
          Back to Referees
        </Button>
      </Box>
    );
  }

  const assignmentColumns: Column<GameAssignment>[] = [
    {
      id: 'dateTime',
      label: 'Date & Time',
      minWidth: 150,
      format: (value) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    },
    { id: 'sport', label: 'Sport', minWidth: 100 },
    { id: 'location', label: 'Location', minWidth: 150 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          color={
            value === 'completed'
              ? 'success'
              : value === 'confirmed'
              ? 'primary'
              : value === 'pending'
              ? 'warning'
              : 'default'
          }
          size="small"
        />
      ),
    },
    {
      id: 'compensation',
      label: 'Compensation',
      minWidth: 120,
      format: (value) => `$${value}`,
    },
  ];

  return (
    <Box>
      <Button
        onClick={() => navigate('/referees')}
        startIcon={<BackIcon />}
        sx={{ mb: 2 }}
      >
        Back to Referees
      </Button>

      <Grid container spacing={3}>
        {/* Referee Profile */}
        <Grid item xs={12} md={4}>
          <DataCard>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={referee.avatar}
                alt={referee.name}
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {referee.name[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {referee.name}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Rating value={referee.rating} readOnly precision={0.1} />
                <Typography variant="body2">({referee.rating})</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {referee.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {referee.phone}
              </Typography>
            </Box>
          </DataCard>
        </Grid>

        {/* Referee Information */}
        <Grid item xs={12} md={8}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Referee Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Sports"
                  secondary={
                    <Box display="flex" gap={0.5} flexWrap="wrap" mt={1}>
                      {referee.sports.map((sport) => (
                        <Chip key={sport} label={sport} size="small" />
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
                      {referee.certifications.map((cert) => (
                        <Chip key={cert} label={cert} size="small" color="primary" />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Total Games Officiated"
                  secondary={referee.totalGames}
                />
              </ListItem>
            </List>
          </DataCard>
        </Grid>

        {/* Assignments */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Game Assignments
          </Typography>
          <DataTable
            columns={assignmentColumns}
            rows={assignments}
            onRowClick={(assignment) => {
              if (assignment.status === 'completed') {
                navigate(`/games/${assignment.gameId}/report`);
              }
            }}
            emptyMessage="No assignments found for this referee"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default RefereeDetailsPage;
