import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Rating,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  People as CapacityIcon,
  Square as SquareIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EventAvailable as BookIcon,
  Schedule as ScheduleIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/LoadingSpinner';
import mockApi from '../../services/mockApi';
import { Facility, FacilityBooking } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

function FacilityDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Booking form state
  const [bookingType, setBookingType] = useState<'camp' | 'game' | 'training' | 'event'>('training');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<{ id: string; quantity: number }[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadFacilityDetails();
      loadBookings();
    }
  }, [id]);

  async function loadFacilityDetails() {
    setLoading(true);
    try {
      const data = await mockApi.getFacilityById(id!);
      setFacility(data);
    } catch (error) {
      console.error('Failed to load facility details:', error);
      addNotification('Failed to load facility details', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings() {
    try {
      const data = await mockApi.getFacilityBookings({ facilityId: id });
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  }

  async function handleBookFacility() {
    if (!facility || !startDateTime || !endDateTime) return;

    try {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours

      let totalCost = duration * facility.hourlyRate;
      
      const equipmentRented = selectedEquipment.map(eq => {
        const equipment = facility.equipment.find(e => e.id === eq.id)!;
        const equipmentCost = duration * equipment.pricePerHour;
        totalCost += equipmentCost * eq.quantity;
        return {
          equipmentId: equipment.id,
          name: equipment.name,
          quantity: eq.quantity,
          cost: equipmentCost * eq.quantity,
        };
      });

      await mockApi.createFacilityBooking({
        facilityId: facility.id,
        facilityName: facility.name,
        bookingType,
        bookedBy: user!.id,
        bookedByName: user!.name,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        duration,
        equipmentRented,
        totalCost,
        status: 'pending',
        notes,
      });

      addNotification('Booking request submitted successfully', 'success');
      setBookingDialogOpen(false);
      loadBookings();
      
      // Reset form
      setBookingType('training');
      setStartDateTime('');
      setEndDateTime('');
      setSelectedEquipment([]);
      setNotes('');
    } catch (error) {
      console.error('Failed to create booking:', error);
      addNotification('Failed to create booking', 'error');
    }
  }

  async function handleDeleteFacility() {
    if (!id) return;
    
    try {
      await mockApi.deleteFacility(id);
      addNotification('Facility deleted successfully', 'success');
      navigate('/facilities');
    } catch (error) {
      console.error('Failed to delete facility:', error);
      addNotification('Failed to delete facility', 'error');
    }
  }

  function addEquipmentToBooking(equipmentId: string) {
    const existing = selectedEquipment.find(e => e.id === equipmentId);
    if (existing) {
      setSelectedEquipment(selectedEquipment.map(e =>
        e.id === equipmentId ? { ...e, quantity: e.quantity + 1 } : e
      ));
    } else {
      setSelectedEquipment([...selectedEquipment, { id: equipmentId, quantity: 1 }]);
    }
  }

  function removeEquipmentFromBooking(equipmentId: string) {
    const existing = selectedEquipment.find(e => e.id === equipmentId);
    if (existing && existing.quantity > 1) {
      setSelectedEquipment(selectedEquipment.map(e =>
        e.id === equipmentId ? { ...e, quantity: e.quantity - 1 } : e
      ));
    } else {
      setSelectedEquipment(selectedEquipment.filter(e => e.id !== equipmentId));
    }
  }

  const isOwner = user?.id === facility?.ownerId || user?.role === 'facility-admin';

  if (loading) {
    return <LoadingSpinner message="Loading facility details..." />;
  }

  if (!facility) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          Facility not found
        </Typography>
        <Button onClick={() => navigate('/facilities')} sx={{ mt: 2 }}>
          Back to Facilities
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/facilities')}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4">{facility.name}</Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {facility.address}, {facility.city}, {facility.state} {facility.zipCode}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          {isOwner && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/facilities/${facility.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<BookIcon />}
            onClick={() => setBookingDialogOpen(true)}
          >
            Book Facility
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          <Card sx={{ mb: 3 }}>
            <ImageList cols={2} rowHeight={200}>
              {facility.images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image}
                    alt={`${facility.name} ${index + 1}`}
                    loading="lazy"
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Card>

          {/* Description */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About This Facility
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {facility.description}
              </Typography>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Amenities
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {facility.amenities.map((amenity) => (
                  <Chip key={amenity} label={amenity} variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Equipment
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipment</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Rate/Hour</TableCell>
                      <TableCell>Condition</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {facility.equipment.map((equipment) => (
                      <TableRow key={equipment.id}>
                        <TableCell>{equipment.name}</TableCell>
                        <TableCell>
                          <Chip label={equipment.category} size="small" />
                        </TableCell>
                        <TableCell>{equipment.quantity}</TableCell>
                        <TableCell>
                          {equipment.pricePerHour > 0 ? `$${equipment.pricePerHour}` : 'Included'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={equipment.condition}
                            size="small"
                            color={
                              equipment.condition === 'excellent' ? 'success' :
                              equipment.condition === 'good' ? 'primary' :
                              equipment.condition === 'fair' ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Availability Schedule */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Availability Schedule
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Hours</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(facility.availability).map(([day, schedule]) => (
                      <TableRow key={day}>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{day}</TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.available ? 'Open' : 'Closed'}
                            size="small"
                            color={schedule.available ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {schedule.available ? `${schedule.open} - ${schedule.close}` : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Bookings
              </Typography>
              {bookings.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No bookings yet
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Booked By</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <Chip label={booking.bookingType} size="small" />
                          </TableCell>
                          <TableCell>
                            {format(new Date(booking.startDateTime), 'MMM dd, yyyy HH:mm')} - 
                            {format(new Date(booking.endDateTime), 'HH:mm')}
                          </TableCell>
                          <TableCell>{booking.bookedByName}</TableCell>
                          <TableCell>
                            <Chip
                              label={booking.status}
                              size="small"
                              color={
                                booking.status === 'confirmed' ? 'success' :
                                booking.status === 'pending' ? 'warning' :
                                booking.status === 'completed' ? 'primary' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>${booking.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" color="primary">
                  ${facility.hourlyRate}/hr
                </Typography>
                <Chip
                  label={facility.status}
                  color={
                    facility.status === 'active' ? 'success' :
                    facility.status === 'maintenance' ? 'warning' : 'default'
                  }
                />
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Rating value={facility.rating} readOnly precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  {facility.rating} ({facility.totalBookings} bookings)
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <PriceIcon color="action" />
                <Box flexGrow={1}>
                  <Typography variant="body2" color="text.secondary">
                    Daily Rate
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${facility.dailyRate}
                  </Typography>
                </Box>
              </Box>

              {facility.weeklyRate && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <PriceIcon color="action" />
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">
                      Weekly Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${facility.weeklyRate}
                    </Typography>
                  </Box>
                </Box>
              )}

              {facility.monthlyRate && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <PriceIcon color="action" />
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${facility.monthlyRate}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CapacityIcon color="action" />
                <Box flexGrow={1}>
                  <Typography variant="body2" color="text.secondary">
                    Capacity
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {facility.capacity} people
                  </Typography>
                </Box>
              </Box>

              {facility.squareFootage && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <SquareIcon color="action" />
                  <Box flexGrow={1}>
                    <Typography variant="body2" color="text.secondary">
                      Square Footage
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {facility.squareFootage.toLocaleString()} sq ft
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ScheduleIcon color="action" />
                <Box flexGrow={1}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ textTransform: 'capitalize' }}>
                    {facility.indoorOutdoor}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sports
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                {facility.sports.map((sport) => (
                  <Chip key={sport} label={sport} size="small" />
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Contact
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography variant="body2">{facility.contactPhone}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{facility.contactEmail}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Book Facility</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Booking Type"
                  value={bookingType}
                  onChange={(e) => setBookingType(e.target.value as any)}
                >
                  <MenuItem value="camp">Camp</MenuItem>
                  <MenuItem value="game">Game</MenuItem>
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date & Time"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date & Time"
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Add Equipment (Optional)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {facility.equipment
                    .filter(eq => eq.pricePerHour > 0)
                    .map((equipment) => {
                      const selected = selectedEquipment.find(e => e.id === equipment.id);
                      return (
                        <Box key={equipment.id} display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={`${equipment.name} ($${equipment.pricePerHour}/hr)`}
                            onClick={() => addEquipmentToBooking(equipment.id)}
                            color={selected ? 'primary' : 'default'}
                          />
                          {selected && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Button size="small" onClick={() => removeEquipmentFromBooking(equipment.id)}>
                                -
                              </Button>
                              <Typography variant="body2">{selected.quantity}</Typography>
                              <Button size="small" onClick={() => addEquipmentToBooking(equipment.id)}>
                                +
                              </Button>
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements or notes..."
                />
              </Grid>
              {startDateTime && endDateTime && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      Estimated Cost: ${calculateEstimatedCost().toFixed(2)}
                    </Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBookFacility}
            variant="contained"
            disabled={!startDateTime || !endDateTime}
          >
            Submit Booking Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this facility? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteFacility} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  function calculateEstimatedCost(): number {
    if (!facility || !startDateTime || !endDateTime) return 0;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    let totalCost = duration * facility.hourlyRate;

    selectedEquipment.forEach(eq => {
      const equipment = facility.equipment.find(e => e.id === eq.id);
      if (equipment) {
        totalCost += duration * equipment.pricePerHour * eq.quantity;
      }
    });

    return totalCost;
  }
}

export default FacilityDetailsPage;
