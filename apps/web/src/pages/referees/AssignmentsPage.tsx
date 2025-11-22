import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Button,
} from '@mui/material';
import { format } from 'date-fns';
import DataTable, { Column } from '../../components/DataTable';
import { useAuth } from '../../contexts/AuthContext';
import mockApi from '../../services/mockApi';
import { GameAssignment } from '../../types';

function AssignmentsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<GameAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadAssignments();
  }, [statusFilter, user]);

  async function loadAssignments() {
    setLoading(true);
    try {
      // In a real app, this would filter by the current referee's ID
      const data = await mockApi.getAssignments({
        status: statusFilter || undefined,
      });
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(assignmentId: string) {
    try {
      await mockApi.confirmAssignment(assignmentId);
      loadAssignments();
    } catch (error) {
      console.error('Failed to confirm assignment:', error);
    }
  }

  const columns: Column<GameAssignment>[] = [
    {
      id: 'dateTime',
      label: 'Date & Time',
      minWidth: 150,
      format: (value) => format(new Date(value), 'MMM d, yyyy h:mm a'),
    },
    { id: 'sport', label: 'Sport', minWidth: 100 },
    { id: 'location', label: 'Location', minWidth: 200 },
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
    {
      id: 'gameId',
      label: 'Action',
      minWidth: 150,
      format: (value, row) => {
        if (row.status === 'pending') {
          return (
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                handleConfirm(row.id);
              }}
            >
              Confirm
            </Button>
          );
        }
        if (row.status === 'completed') {
          return (
            <Button
              size="small"
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/games/${value}/report`);
              }}
            >
              View Report
            </Button>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Assignments
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Assignments Table */}
      <DataTable
        columns={columns}
        rows={assignments}
        loading={loading}
        emptyMessage="No assignments found"
      />
    </Box>
  );
}

export default AssignmentsPage;
