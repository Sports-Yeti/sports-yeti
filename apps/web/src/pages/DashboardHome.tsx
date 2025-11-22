import { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  SportsSoccer as LeagueIcon,
  FitnessCenter as TrainerIcon,
  SportsMma as RefereeIcon,
  Event as EventIcon,
  School as CampIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import StatCard from '../components/StatCard';
import DataCard from '../components/DataCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import mockApi from '../services/mockApi';
import { DashboardStats, Activity } from '../types';

function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, activitiesData] = await Promise.all([
          mockApi.getDashboardStats(),
          mockApi.getRecentActivity(),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'league_created':
        return <LeagueIcon />;
      case 'camp_registered':
        return <CampIcon />;
      case 'game_reported':
        return <RefereeIcon />;
      case 'team_registered':
        return <EventIcon />;
      default:
        return <EventIcon />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        {user?.role === 'league_admin' && 'Manage your leagues, teams, and competitions'}
        {user?.role === 'trainer' && 'Manage your training camps and participants'}
        {user?.role === 'referee' && 'View your assignments and submit game reports'}
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(user?.role === 'league_admin' || !user?.role) && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Leagues"
                value={stats?.totalLeagues || 0}
                icon={<LeagueIcon />}
                color="primary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Leagues"
                value={stats?.activeLeagues || 0}
                icon={<LeagueIcon />}
                color="success.main"
                subtitle="Currently running"
              />
            </Grid>
          </>
        )}
        {(user?.role === 'trainer' || user?.role === 'league_admin' || !user?.role) && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Trainers"
                value={stats?.totalTrainers || 0}
                icon={<TrainerIcon />}
                color="info.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Camps"
                value={stats?.activeCamps || 0}
                icon={<CampIcon />}
                color="warning.main"
              />
            </Grid>
          </>
        )}
        {(user?.role === 'referee' || user?.role === 'league_admin' || !user?.role) && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Referees"
                value={stats?.totalReferees || 0}
                icon={<RefereeIcon />}
                color="secondary.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Assignments"
                value={stats?.pendingAssignments || 0}
                icon={<PendingIcon />}
                color="error.main"
                subtitle="Awaiting confirmation"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Recent Activity */}
      <DataCard>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <List>
          {activities.map((activity) => (
            <ListItem key={activity.id} divider>
              <ListItemAvatar>
                <Avatar component="div" sx={{ bgcolor: 'primary.main' }}>
                  {getActivityIcon(activity.type) as any}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.description}
                secondary={
                  <>
                    {activity.userName && `by ${activity.userName} • `}
                    {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </DataCard>
    </Box>
  );
}

export default DashboardHome;
