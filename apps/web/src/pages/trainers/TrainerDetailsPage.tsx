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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { 
  ArrowBack as BackIcon, 
  School as CampIcon,
  EmojiEvents as AwardIcon,
  Verified as VerifiedIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import DataCard from '../../components/DataCard';
import DataTable, { Column } from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { Trainer, Camp } from '../../types';
import { format, differenceInDays } from 'date-fns';

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

  function getCertificationStatus(cert: any) {
    if (!cert.expiryDate) return 'active';
    const daysUntilExpiry = differenceInDays(new Date(cert.expiryDate), new Date());
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 90) return 'expiring';
    return 'active';
  }

  function getAchievementIcon(category: string) {
    switch (category) {
      case 'award': return <AwardIcon />;
      case 'milestone': return <BadgeIcon />;
      case 'recognition': return <VerifiedIcon />;
      case 'publication': return <CalendarIcon />;
      default: return <AwardIcon />;
    }
  }

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
              <Typography variant="body2" color="text.secondary" mb={2}>
                {trainer.phone}
              </Typography>
              
              {trainer.yearsOfExperience && (
                <Chip 
                  label={`${trainer.yearsOfExperience} Years Experience`} 
                  color="primary" 
                  sx={{ mb: 2 }}
                />
              )}

              {trainer.bio && (
                <>
                  <Divider sx={{ width: '100%', my: 2 }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {trainer.bio}
                  </Typography>
                </>
              )}
            </Box>
          </DataCard>
        </Grid>

        {/* Trainer Information */}
        <Grid item xs={12} md={8}>
          <DataCard>
            <Typography variant="h6" gutterBottom>
              Professional Information
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
                  primary="Active Certifications"
                  secondary={trainer.certifications.length}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Achievements"
                  secondary={trainer.achievements.length}
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

        {/* Certifications */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <VerifiedIcon /> Professional Certifications
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Certification</strong></TableCell>
                    <TableCell><strong>Issuing Organization</strong></TableCell>
                    <TableCell><strong>Issue Date</strong></TableCell>
                    <TableCell><strong>Expiry Date</strong></TableCell>
                    <TableCell><strong>Credential ID</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainer.certifications.map((cert) => {
                    const status = getCertificationStatus(cert);
                    return (
                      <TableRow key={cert.id}>
                        <TableCell>{cert.name}</TableCell>
                        <TableCell>{cert.issuingOrganization}</TableCell>
                        <TableCell>{format(new Date(cert.issueDate), 'MMM yyyy')}</TableCell>
                        <TableCell>
                          {cert.expiryDate ? format(new Date(cert.expiryDate), 'MMM yyyy') : 'No Expiry'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {cert.credentialId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={status.toUpperCase()} 
                            size="small"
                            color={status === 'active' ? 'success' : status === 'expiring' ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {trainer.certifications.some(c => getCertificationStatus(c) === 'expiring') && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Some certifications are expiring soon. Please renew them to maintain active status.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
              <AwardIcon /> Achievements & Recognition
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              {trainer.achievements.map((achievement) => (
                <Grid item xs={12} md={6} key={achievement.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                          {getAchievementIcon(achievement.category)}
                        </Box>
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {achievement.title}
                            </Typography>
                            <Chip 
                              label={achievement.category} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {achievement.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(achievement.date), 'MMMM d, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Camps Taught */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Camps Taught</Typography>
            <Button
              variant="contained"
              startIcon={<CampIcon />}
              onClick={() => navigate('/camps/create')}
            >
              Create New Camp
            </Button>
          </Box>
          <DataTable
            columns={campColumns}
            rows={camps}
            onRowClick={(camp) => navigate(`/camps/${camp.id}`)}
            emptyMessage="No camps found for this trainer"
          />
          
          {camps.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Total Participants:</strong> {camps.reduce((sum, camp) => sum + camp.registeredParticipants, 0)} students
                {' · '}
                <strong>Upcoming Camps:</strong> {camps.filter(c => new Date(c.startDate) > new Date()).length}
                {' · '}
                <strong>Total Revenue:</strong> ${camps.reduce((sum, camp) => sum + (camp.price * camp.registeredParticipants), 0).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default TrainerDetailsPage;
