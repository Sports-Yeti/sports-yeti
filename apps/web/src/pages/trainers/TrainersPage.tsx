import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Rating,
  Avatar,
  Chip,
} from '@mui/material';
import DataTable, { Column } from '../../components/DataTable';
import mockApi from '../../services/mockApi';
import { Trainer } from '../../types';

function TrainersPage() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrainers() {
      setLoading(true);
      try {
        const data = await mockApi.getTrainers();
        setTrainers(data);
      } catch (error) {
        console.error('Failed to load trainers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTrainers();
  }, []);

  const columns: Column<Trainer>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 200,
      format: (value, row) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={row.avatar} alt={value}>
            {value[0]}
          </Avatar>
          {value}
        </Box>
      ),
    },
    {
      id: 'specializations',
      label: 'Specializations',
      minWidth: 250,
      format: (value: string[]) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {value.map((spec) => (
            <Chip key={spec} label={spec} size="small" />
          ))}
        </Box>
      ),
    },
    {
      id: 'certifications',
      label: 'Certifications',
      minWidth: 200,
      format: (value: string[]) => value.join(', '),
    },
    {
      id: 'rating',
      label: 'Rating',
      minWidth: 150,
      format: (value) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Rating value={value} readOnly precision={0.1} size="small" />
          <Typography variant="body2">({value})</Typography>
        </Box>
      ),
    },
    {
      id: 'totalCamps',
      label: 'Total Camps',
      minWidth: 100,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trainers
      </Typography>

      <DataTable
        columns={columns}
        rows={trainers}
        loading={loading}
        onRowClick={(trainer) => navigate(`/trainers/${trainer.id}`)}
        emptyMessage="No trainers found"
      />
    </Box>
  );
}

export default TrainersPage;
