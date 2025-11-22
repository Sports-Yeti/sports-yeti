import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import DataTable, { Column } from '../../components/DataTable';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotifications } from '../../contexts/NotificationContext';
import mockApi from '../../services/mockApi';
import { TeamApplication, Team } from '../../types';

function TeamApplicationsPage() {
  const { id: leagueId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  
  const [applications, setApplications] = useState<(TeamApplication & { team?: Team })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<TeamApplication | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewTeamDialogOpen, setViewTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    loadApplications();
  }, [leagueId]);

  async function loadApplications() {
    if (!leagueId) return;
    
    setLoading(true);
    try {
      const apps = await mockApi.getTeamApplications({ leagueId });
      
      // Load team details for each application
      const appsWithTeams = await Promise.all(
        apps.map(async (app) => {
          const team = await mockApi.getTeamById(app.teamId);
          return { ...app, team: team || undefined };
        })
      );
      
      setApplications(appsWithTeams);
    } catch (error) {
      console.error('Failed to load applications:', error);
      showNotification('error', 'Failed to load team applications');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(application: TeamApplication) {
    try {
      await mockApi.approveTeamApplication(application.id);
      showNotification('success', 'Team application approved!');
      loadApplications();
    } catch (error) {
      showNotification('error', 'Failed to approve application');
    }
  }

  function openRejectDialog(application: TeamApplication) {
    setSelectedApp(application);
    setRejectDialogOpen(true);
  }

  async function handleReject() {
    if (!selectedApp || !rejectionReason.trim()) {
      showNotification('warning', 'Please provide a rejection reason');
      return;
    }

    try {
      await mockApi.rejectTeamApplication(selectedApp.id, rejectionReason);
      showNotification('success', 'Team application rejected');
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedApp(null);
      loadApplications();
    } catch (error) {
      showNotification('error', 'Failed to reject application');
    }
  }

  function viewTeamDetails(team: Team) {
    setSelectedTeam(team);
    setViewTeamDialogOpen(true);
  }

  const columns: Column<TeamApplication & { team?: Team }>[] = [
    {
      id: 'team',
      label: 'Team Name',
      minWidth: 200,
      format: (_, row) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={row.team?.logo} alt={row.team?.name}>
            {row.team?.name?.[0]}
          </Avatar>
          {row.team?.name || 'Unknown Team'}
        </Box>
      ),
    },
    {
      id: 'appliedDate',
      label: 'Applied Date',
      minWidth: 150,
      format: (value) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          color={
            value === 'approved'
              ? 'success'
              : value === 'rejected'
              ? 'error'
              : 'warning'
          }
          size="small"
        />
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      minWidth: 250,
      format: (value) => value || '-',
    },
    {
      id: 'teamId',
      label: 'Actions',
      minWidth: 200,
      format: (_, row) => (
        <Box display="flex" gap={1}>
          <IconButton
            size="small"
            color="primary"
            onClick={(e) => {
              e.stopPropagation();
              if (row.team) viewTeamDetails(row.team);
            }}
          >
            <ViewIcon />
          </IconButton>
          {row.status === 'pending' && (
            <>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(row);
                }}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<RejectIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  openRejectDialog(row);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </Box>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading applications..." />;
  }

  return (
    <Box>
      <Button
        onClick={() => navigate(`/leagues/${leagueId}`)}
        startIcon={<BackIcon />}
        sx={{ mb: 2 }}
      >
        Back to League
      </Button>

      <Typography variant="h4" gutterBottom>
        Team Applications
      </Typography>

      <DataCard sx={{ mt: 3 }}>
        <DataTable
          columns={columns}
          rows={applications}
          emptyMessage="No team applications found"
        />
      </DataCard>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Team Application</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
            Please provide a reason for rejecting {selectedApp && applications.find(a => a.id === selectedApp.id)?.team?.name || 'this team'}:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g., Team does not meet minimum player count requirement"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Team Dialog */}
      <Dialog open={viewTeamDialogOpen} onClose={() => setViewTeamDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Team Details: {selectedTeam?.name}</DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedTeam.description}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Team Members ({selectedTeam.members.length})
              </Typography>
              
              <List>
                {selectedTeam.members.map((member) => (
                  <ListItem key={member.id} divider>
                    <ListItemAvatar>
                      <Avatar src={member.avatar} alt={member.name}>
                        {member.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.name}
                      secondary={
                        <>
                          {member.position && `${member.position} • `}
                          {member.jerseyNumber && `#${member.jerseyNumber} • `}
                          {member.email}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTeamDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamApplicationsPage;
