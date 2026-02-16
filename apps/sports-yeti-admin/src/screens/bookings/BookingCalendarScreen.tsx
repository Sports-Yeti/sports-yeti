import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { api } from '../../services/api';
import type { Booking, Facility } from '../../types';
import { BookingDetailModal } from '../../components/BookingDetailModal';
import { CreateBookingModal } from '../../components/CreateBookingModal';

type ViewMode = 'day' | 'week' | 'month';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

// Status colors for bookings
const STATUS_COLORS: Record<string, string> = {
  confirmed: COLORS.success,
  pending: COLORS.warning,
  cancelled: COLORS.error,
  completed: COLORS.textSecondary,
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || COLORS.textSecondary;
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function getMonthDays(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: CalendarDay[] = [];

  // Add days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
      isToday: false,
      bookings: [],
    });
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      bookings: [],
    });
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isToday: false,
      bookings: [],
    });
  }

  return days;
}

function getWeekDays(date: Date): CalendarDay[] {
  const today = new Date();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push({
      date: d,
      isCurrentMonth: true,
      isToday: isSameDay(d, today),
      bookings: [],
    });
  }
  return days;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function BookingCalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date | null>(null);

  // Calculate date range for API call
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === 'month') {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    } else if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    }
    // For day view, just use currentDate

    return { start, end };
  }, [currentDate, viewMode]);

  // Load bookings
  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, unknown> = {
        start_date: dateRange.start.toISOString().split('T')[0],
        end_date: dateRange.end.toISOString().split('T')[0],
      };
      if (selectedFacility) {
        params.facility_id = selectedFacility;
      }
      const response = await api.getBookings(params);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.start, dateRange.end, selectedFacility]);

  // Load facilities on mount
  useEffect(() => {
    async function loadFacilities() {
      try {
        const response = await api.getFacilities();
        setFacilities(response.data);
      } catch (error) {
        console.error('Failed to load facilities:', error);
      }
    }
    loadFacilities();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Navigation functions
  function navigatePrev() {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  }

  function navigateNext() {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  // Get calendar days with bookings
  const calendarDays = useMemo(() => {
    let days: CalendarDay[];
    if (viewMode === 'month') {
      days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
    } else {
      days = getWeekDays(currentDate);
    }

    // Assign bookings to days
    return days.map((day) => ({
      ...day,
      bookings: bookings.filter((b) =>
        isSameDay(new Date(b.start_time), day.date)
      ),
    }));
  }, [currentDate, viewMode, bookings]);

  // Get bookings for day view
  const dayBookings = useMemo(() => {
    return bookings.filter((b) =>
      isSameDay(new Date(b.start_time), currentDate)
    );
  }, [bookings, currentDate]);

  function handleBookingClick(booking: Booking) {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  }

  function handleDayClick(date: Date) {
    if (viewMode === 'month') {
      setCurrentDate(date);
      setViewMode('day');
    }
  }

  function handleCreateBooking(date?: Date) {
    setCreateModalDate(date || currentDate);
    setIsCreateModalOpen(true);
  }

  function handleBookingUpdated() {
    loadBookings();
    setIsDetailModalOpen(false);
    setIsCreateModalOpen(false);
  }

  // Header title
  const headerTitle = useMemo(() => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endOfWeek.getDate()}, ${endOfWeek.getFullYear()}`;
      }
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${endOfWeek.getFullYear()}`;
    }
    return currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate, viewMode]);

  // Render month view
  function renderMonthView() {
    return (
      <View style={styles.monthGrid}>
        {/* Weekday headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Days grid */}
        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellInactive,
                day.isToday && styles.dayCellToday,
              ]}
              onPress={() => handleDayClick(day.date)}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberInactive,
                  day.isToday && styles.dayNumberToday,
                ]}
              >
                {day.date.getDate()}
              </Text>
              <View style={styles.dayBookings}>
                {day.bookings.slice(0, 3).map((booking) => (
                  <TouchableOpacity
                    key={booking.id}
                    style={[
                      styles.bookingDot,
                      { backgroundColor: getStatusColor(booking.status) },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleBookingClick(booking);
                    }}
                  >
                    <Text style={styles.bookingDotText} numberOfLines={1}>
                      {formatTime(booking.start_time)}{' '}
                      {booking.space?.name || 'Booking'}
                    </Text>
                  </TouchableOpacity>
                ))}
                {day.bookings.length > 3 && (
                  <Text style={styles.moreBookings}>
                    +{day.bookings.length - 3} more
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Render week view
  function renderWeekView() {
    return (
      <ScrollView style={styles.weekContainer}>
        {/* Header with days */}
        <View style={styles.weekHeader}>
          <View style={styles.timeColumn} />
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.weekDayHeader, day.isToday && styles.weekDayHeaderToday]}
              onPress={() => handleDayClick(day.date)}
            >
              <Text style={styles.weekDayName}>{WEEKDAYS[index]}</Text>
              <Text
                style={[
                  styles.weekDayNumber,
                  day.isToday && styles.weekDayNumberToday,
                ]}
              >
                {day.date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Time grid */}
        <View style={styles.weekGrid}>
          {HOURS.map((hour) => (
            <View key={hour} style={styles.hourRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>
                  {hour === 0
                    ? '12 AM'
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? '12 PM'
                        : `${hour - 12} PM`}
                </Text>
              </View>
              {calendarDays.map((day, dayIndex) => {
                const hourBookings = day.bookings.filter((b) => {
                  const bookingHour = new Date(b.start_time).getHours();
                  return bookingHour === hour;
                });

                return (
                  <TouchableOpacity
                    key={dayIndex}
                    style={styles.hourCell}
                    onPress={() => {
                      const bookingDate = new Date(day.date);
                      bookingDate.setHours(hour, 0, 0, 0);
                      handleCreateBooking(bookingDate);
                    }}
                  >
                    {hourBookings.map((booking) => (
                      <TouchableOpacity
                        key={booking.id}
                        style={[
                          styles.weekBookingBlock,
                          { backgroundColor: getStatusColor(booking.status) + '20' },
                          { borderLeftColor: getStatusColor(booking.status) },
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleBookingClick(booking);
                        }}
                      >
                        <Text style={styles.weekBookingTime}>
                          {formatTime(booking.start_time)}
                        </Text>
                        <Text style={styles.weekBookingTitle} numberOfLines={1}>
                          {booking.space?.name || 'Booking'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  // Render day view
  function renderDayView() {
    return (
      <ScrollView style={styles.dayContainer}>
        {HOURS.map((hour) => {
          const hourBookings = dayBookings.filter((b) => {
            const bookingHour = new Date(b.start_time).getHours();
            return bookingHour === hour;
          });

          return (
            <TouchableOpacity
              key={hour}
              style={styles.dayHourRow}
              onPress={() => {
                const bookingDate = new Date(currentDate);
                bookingDate.setHours(hour, 0, 0, 0);
                handleCreateBooking(bookingDate);
              }}
            >
              <View style={styles.dayTimeColumn}>
                <Text style={styles.timeText}>
                  {hour === 0
                    ? '12 AM'
                    : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                        ? '12 PM'
                        : `${hour - 12} PM`}
                </Text>
              </View>
              <View style={styles.dayHourContent}>
                {hourBookings.map((booking) => (
                  <TouchableOpacity
                    key={booking.id}
                    style={[
                      styles.dayBookingBlock,
                      { backgroundColor: getStatusColor(booking.status) + '15' },
                      { borderLeftColor: getStatusColor(booking.status) },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleBookingClick(booking);
                    }}
                  >
                    <View style={styles.dayBookingHeader}>
                      <Text style={styles.dayBookingTime}>
                        {formatTime(booking.start_time)} -{' '}
                        {formatTime(booking.end_time)}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(booking.status) + '30' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(booking.status) },
                          ]}
                        >
                          {booking.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.dayBookingTitle}>
                      {booking.space?.name || 'Space Booking'}
                    </Text>
                    <Text style={styles.dayBookingSubtitle}>
                      {booking.space?.facility?.name || 'Facility'}
                    </Text>
                    {booking.user && (
                      <Text style={styles.dayBookingUser}>
                        Booked by: {booking.user.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Booking Calendar</Text>
          <Text style={styles.subtitle}>{headerTitle}</Text>
        </View>
        <View style={styles.headerRight}>
          {/* View mode toggle */}
          <View style={styles.viewModeToggle}>
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.viewModeButton,
                  viewMode === mode && styles.viewModeButtonActive,
                ]}
                onPress={() => setViewMode(mode)}
              >
                <Text
                  style={[
                    styles.viewModeButtonText,
                    viewMode === mode && styles.viewModeButtonTextActive,
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Create booking button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => handleCreateBooking()}
          >
            <Text style={styles.createButtonText}>+ New Booking</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation and filters */}
      <View style={styles.toolbar}>
        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButton} onPress={navigatePrev}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={navigateNext}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Facility filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedFacility && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFacility(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !selectedFacility && styles.filterChipTextActive,
                ]}
              >
                All Facilities
              </Text>
            </TouchableOpacity>
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                style={[
                  styles.filterChip,
                  selectedFacility === facility.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFacility(facility.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFacility === facility.id && styles.filterChipTextActive,
                  ]}
                >
                  {facility.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Calendar content */}
      <View style={styles.calendarContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : viewMode === 'month' ? (
          renderMonthView()
        ) : viewMode === 'week' ? (
          renderWeekView()
        ) : (
          renderDayView()
        )}
      </View>

      {/* Modals */}
      {isDetailModalOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isVisible={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdate={handleBookingUpdated}
        />
      )}

      {isCreateModalOpen && (
        <CreateBookingModal
          isVisible={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleBookingUpdated}
          initialDate={createModalDate}
          facilities={facilities}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  viewModeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  viewModeButtonTextActive: {
    color: COLORS.textLight,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  createButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  toolbar: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  todayButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  todayButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterSection: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.textLight,
  },
  legend: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  calendarContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Month view styles
  monthGrid: {
    flex: 1,
    padding: SPACING.md,
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    minHeight: 100,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  dayCellInactive: {
    backgroundColor: COLORS.background,
  },
  dayCellToday: {
    backgroundColor: COLORS.primaryLight,
  },
  dayNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dayNumberInactive: {
    color: COLORS.textMuted,
  },
  dayNumberToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dayBookings: {
    gap: 2,
  },
  bookingDot: {
    padding: 2,
    borderRadius: 3,
    marginBottom: 2,
  },
  bookingDotText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  moreBookings: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  // Week view styles
  weekContainer: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekDayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  weekDayHeaderToday: {
    backgroundColor: COLORS.primaryLight,
  },
  weekDayName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  weekDayNumber: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  weekDayNumberToday: {
    color: COLORS.primary,
  },
  weekGrid: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    minHeight: 60,
  },
  timeColumn: {
    width: 60,
    padding: SPACING.xs,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  hourCell: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  weekBookingBlock: {
    padding: SPACING.xs,
    borderRadius: 4,
    borderLeftWidth: 3,
    marginBottom: 2,
  },
  weekBookingTime: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  weekBookingTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  // Day view styles
  dayContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  dayHourRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    minHeight: 80,
  },
  dayTimeColumn: {
    width: 80,
    padding: SPACING.sm,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  dayHourContent: {
    flex: 1,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  dayBookingBlock: {
    padding: SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  dayBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dayBookingTime: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dayBookingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayBookingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dayBookingUser: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
