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
import { Referee } from '../../types';

function RefereesPage() {
  const navigate = useNavigate();
  const [referees, setReferees] = useState<Referee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReferees() {
      setLoading(true);
      try {
        const data = await mockApi.getReferees();
        setReferees(data);
      } catch (error) {
        console.error('Failed to load referees:', error);
      } finally {
        setLoading(false);
      }
    }

    loadReferees();
  }, []);

  const columns: Column<Referee>[] = [
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
      id: 'sports',
      label: 'Sports',
      minWidth: 200,
      format: (value: string[]) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {value.map((sport) => (
            <Chip key={sport} label={sport} size="small" />
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
      id: 'totalGames',
      label: 'Total Games',
      minWidth: 100,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Referees
      </Typography>

      <DataTable
        columns={columns}
        rows={referees}
        loading={loading}
        onRowClick={(referee) => navigate(`/referees/${referee.id}`)}
        emptyMessage="No referees found"
      />
    </Box>
  );
}

export default RefereesPage;
