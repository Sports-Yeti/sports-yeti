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
import mockApi from '../../services/mockApi';
import { Camp } from '../../types';

function CampsPage() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('');

  useEffect(() => {
    loadCamps();
  }, [sportFilter]);

  async function loadCamps() {
    setLoading(true);
    try {
      const data = await mockApi.getCamps({
        sport: sportFilter || undefined,
      });
      setCamps(data);
    } catch (error) {
      console.error('Failed to load camps:', error);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Camp>[] = [
    { id: 'name', label: 'Camp Name', minWidth: 200 },
    { id: 'sport', label: 'Sport', minWidth: 100 },
    {
      id: 'location',
      label: 'Location',
      minWidth: 150,
    },
    {
      id: 'startDate',
      label: 'Start Date',
      minWidth: 120,
      format: (value) => format(new Date(value), 'MMM d, yyyy'),
    },
    {
      id: 'skillLevel',
      label: 'Skill Level',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value}
          color={
            value === 'beginner'
              ? 'success'
              : value === 'intermediate'
              ? 'warning'
              : 'error'
          }
          size="small"
        />
      ),
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
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Training Camps</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/camps/create')}
        >
          Create Camp
        </Button>
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
      </Grid>

      {/* Camps Table */}
      <DataTable
        columns={columns}
        rows={camps}
        loading={loading}
        emptyMessage="No camps found"
      />
    </Box>
  );
}

export default CampsPage;
