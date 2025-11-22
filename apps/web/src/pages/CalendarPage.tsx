import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import { Calendar, dateFnsLocalizer, View, Event as CalendarEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DataCard from '../components/DataCard';
import { useNotifications } from '../contexts/NotificationContext';
import mockApi from '../services/mockApi';
import { GameAssignment } from '../types';

// Setup date-fns localizer for react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface CalendarEventData extends CalendarEvent {
  id: string;
  type: 'game' | 'assignment';
  status?: string;
  location?: string;
  data: GameAssignment;
}

function CalendarPage() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [calendarView, setCalendarView] = useState<View>('month');
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { showNotification } = useNotifications();

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      // Load assignments - these are the games with referee assignments
      const assignments = await mockApi.getAssignments();

      const assignmentEvents: CalendarEventData[] = assignments.map(assignment => ({
        id: assignment.id,
        title: `Ref: ${assignment.gameId}`,
        start: new Date(assignment.dateTime),
        end: new Date(new Date(assignment.dateTime).getTime() + 2 * 60 * 60 * 1000),
        type: 'assignment' as const,
        status: assignment.status,
        data: assignment,
      }));

      setEvents(assignmentEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      showNotification('error', 'Failed to load calendar events');
    }
  }

  function handleSelectEvent(event: CalendarEventData) {
    setSelectedEvent(event);
    setDialogOpen(true);
  }

  function eventStyleGetter(event: CalendarEventData) {
    let backgroundColor = '#3174ad';
    
    if (event.type === 'assignment') {
      switch (event.status) {
        case 'completed':
          backgroundColor = '#4caf50';
          break;
        case 'cancelled':
          backgroundColor = '#f44336';
          break;
        case 'confirmed':
          backgroundColor = '#2196f3';
          break;
        case 'pending':
          backgroundColor = '#ff9800';
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View games and referee assignments
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="calendar">
              <CalendarIcon sx={{ mr: 1 }} />
              Calendar
            </ToggleButton>
            <ToggleButton value="list">
              <ListIcon sx={{ mr: 1 }} />
              List
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <DataCard>
        {view === 'calendar' ? (
          <Box sx={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={calendarView}
              onView={setCalendarView}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              popup
              style={{ height: '100%' }}
            />
          </Box>
        ) : (
          <Box>
            {events
              .sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime())
              .map(event => (
                <Box
                  key={event.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleSelectEvent(event)}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="h6">{event.title as string}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {format(event.start as Date, 'EEEE, MMMM d, yyyy • h:mm a')}
                      </Typography>
                      {event.location && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {event.location}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={event.type}
                      size="small"
                      color={event.type === 'game' ? 'primary' : 'warning'}
                    />
                  </Box>
                </Box>
              ))}
          </Box>
        )}
      </DataCard>

      {/* Event Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title as string}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip
                  label={selectedEvent.type}
                  size="small"
                  color={selectedEvent.type === 'game' ? 'primary' : 'warning'}
                  sx={{ mr: 1 }}
                />
                {selectedEvent.status && (
                  <Chip label={selectedEvent.status} size="small" />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Date & Time:</strong>
              </Typography>
              <Typography variant="body1" gutterBottom>
                {format(selectedEvent.start as Date, 'EEEE, MMMM d, yyyy')}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {format(selectedEvent.start as Date, 'h:mm a')} - {format(selectedEvent.end as Date, 'h:mm a')}
              </Typography>

              {selectedEvent.location && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    <strong>Location:</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedEvent.location}
                  </Typography>
                </>
              )}

              {selectedEvent.type === 'assignment' && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    <strong>Game ID:</strong>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {(selectedEvent.data as GameAssignment).gameId}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>
                    <strong>Referee ID:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {(selectedEvent.data as GameAssignment).refereeId}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CalendarPage;
