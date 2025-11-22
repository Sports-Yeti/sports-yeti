import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import DataTable, { Column } from '../../components/DataTable';
import ExportButtons from '../../components/ExportButtons';
import mockApi from '../../services/mockApi';
import { League } from '../../types';

function LeaguesPage() {
  const navigate = useNavigate();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadLeagues();
  }, [sportFilter, statusFilter]);

  async function loadLeagues() {
    setLoading(true);
    try {
      const data = await mockApi.getLeagues({
        sport: sportFilter || undefined,
        status: statusFilter || undefined,
      });
      setLeagues(data);
    } catch (error) {
      console.error('Failed to load leagues:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<League>[] = [
    { id: 'name', label: 'Name', minWidth: 200 },
    { id: 'sport', label: 'Sport', minWidth: 100 },
    {
      id: 'location',
      label: 'Location',
      minWidth: 150,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          color={
            value === 'active'
              ? 'success'
              : value === 'upcoming'
              ? 'warning'
              : 'default'
          }
          size="small"
        />
      ),
    },
    {
      id: 'startDate',
      label: 'Start Date',
      minWidth: 120,
      format: (value) => format(new Date(value), 'MMM d, yyyy'),
    },
    {
      id: 'registeredTeams',
      label: 'Teams',
      minWidth: 100,
      format: (value, row) => `${value}/${row.maxTeams}`,
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Leagues</Typography>
        <Box display="flex" gap={2}>
          <ExportButtons
            data={leagues}
            filename="leagues"
            title="Leagues Report"
            columns={[
              { header: 'Name', dataKey: 'name' },
              { header: 'Sport', dataKey: 'sport' },
              { header: 'Location', dataKey: 'location' },
              { header: 'Status', dataKey: 'status' },
              { header: 'Start Date', dataKey: 'startDate' },
              { header: 'Teams', dataKey: 'registeredTeams' },
            ]}
            fields={['name', 'sport', 'location', 'status', 'startDate', 'registeredTeams', 'maxTeams']}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/leagues/create')}
          >
            Create League
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Sport"
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
          >
            <MenuItem value="">All Sports</MenuItem>
            <MenuItem value="basketball">Basketball</MenuItem>
            <MenuItem value="soccer">Soccer</MenuItem>
            <MenuItem value="tennis">Tennis</MenuItem>
            <MenuItem value="volleyball">Volleyball</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Leagues Table */}
      <DataTable
        columns={columns}
        rows={leagues}
        loading={loading}
        onRowClick={(league) => navigate(`/leagues/${league.id}`)}
        emptyMessage="No leagues found"
      />
    </Box>
  );
}

export default LeaguesPage;
