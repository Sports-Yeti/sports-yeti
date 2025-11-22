import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  TextField,
  MenuItem,
  Chip,
  Rating,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  People as CapacityIcon,
} from '@mui/icons-material';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { Facility } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

function FacilitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  useEffect(() => {
    loadFacilities();
  }, [sportFilter, cityFilter, statusFilter]);

  async function loadFacilities() {
    setLoading(true);
    try {
      const data = await mockApi.getFacilities({
        sport: sportFilter || undefined,
        city: cityFilter || undefined,
        status: statusFilter || undefined,
      });
      setFacilities(data);
    } catch (error) {
      console.error('Failed to load facilities:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFacilities = facilities.filter(facility =>
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSports = Array.from(new Set(facilities.flatMap(f => f.sports)));
  const allCities = Array.from(new Set(facilities.map(f => f.city)));

  if (loading) {
    return <LoadingSpinner message="Loading facilities..." />;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Facilities</Typography>
        {user?.role === 'facility-admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/facilities/create')}
          >
            Add Facility
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Browse and book sports facilities for your leagues, camps, and events
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Sport"
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
            >
              <MenuItem value="">All Sports</MenuItem>
              {allSports.map((sport) => (
                <MenuItem key={sport} value={sport}>
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="City"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <MenuItem value="">All Cities</MenuItem>
              {allCities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Facilities Grid */}
      {filteredFacilities.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No facilities found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or search terms
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredFacilities.map((facility) => (
            <Grid item xs={12} md={6} lg={4} key={facility.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 6 },
                  transition: 'box-shadow 0.3s',
                }}
                onClick={() => navigate(`/facilities/${facility.id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={facility.images[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={facility.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Typography variant="h6" component="div">
                      {facility.name}
                    </Typography>
                    <Chip
                      label={facility.status}
                      size="small"
                      color={
                        facility.status === 'active' ? 'success' :
                        facility.status === 'maintenance' ? 'warning' : 'default'
                      }
                    />
                  </Box>

                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {facility.city}, {facility.state}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Rating value={facility.rating} readOnly size="small" precision={0.1} />
                    <Typography variant="body2" color="text.secondary">
                      ({facility.totalBookings} bookings)
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {facility.description.substring(0, 120)}
                    {facility.description.length > 120 ? '...' : ''}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {facility.sports.slice(0, 3).map((sport) => (
                      <Chip key={sport} label={sport} size="small" variant="outlined" />
                    ))}
                    {facility.sports.length > 3 && (
                      <Chip label={`+${facility.sports.length - 3} more`} size="small" variant="outlined" />
                    )}
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PriceIcon fontSize="small" color="primary" />
                      <Typography variant="h6" color="primary">
                        ${facility.hourlyRate}/hr
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <CapacityIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {facility.capacity} capacity
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/facilities/${facility.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default FacilitiesPage;
