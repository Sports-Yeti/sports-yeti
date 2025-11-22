import { Booking, EquipmentBooking } from '../../types';
import { mockPlayers } from './users';

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    spaceId: 'space-1',
    userId: mockPlayers[0].id,
    startTime: '2024-01-25T11:00:00Z',
    endTime: '2024-01-25T12:00:00Z',
    status: 'confirmed',
    pointCost: 100,
    cashCost: 50,
    equipmentBookings: [
      {
        id: 'equipment-booking-1',
        bookingId: 'booking-1',
        equipmentId: 'equipment-1',
        quantity: 1,
        pointCost: 10,
        cashCost: 5
      }
    ],
    qrCode: 'BK-001-250125-1100',
    checkedIn: false,
    createdAt: '2024-01-20T14:00:00Z'
  },
  {
    id: 'booking-2',
    spaceId: 'space-2',
    userId: mockPlayers[1].id,
    startTime: '2024-01-25T10:00:00Z',
    endTime: '2024-01-25T11:00:00Z',
    status: 'completed',
    pointCost: 100,
    cashCost: 50,
    equipmentBookings: [],
    qrCode: 'BK-002-250125-1000',
    checkedIn: true,
    checkedInAt: '2024-01-25T09:50:00Z',
    createdAt: '2024-01-19T16:00:00Z'
  },
  {
    id: 'booking-3',
    spaceId: 'space-2',
    userId: mockPlayers[0].id,
    startTime: '2024-01-25T15:00:00Z',
    endTime: '2024-01-25T16:00:00Z',
    status: 'confirmed',
    pointCost: 100,
    cashCost: 50,
    equipmentBookings: [
      {
        id: 'equipment-booking-2',
        bookingId: 'booking-3',
        equipmentId: 'equipment-2',
        quantity: 1,
        pointCost: 5,
        cashCost: 2
      }
    ],
    qrCode: 'BK-003-250125-1500',
    checkedIn: false,
    createdAt: '2024-01-21T12:00:00Z'
  }
];

export const getBookingById = (id: string): Booking | undefined =>
  mockBookings.find(booking => booking.id === id);

export const getBookingsByUser = (userId: string): Booking[] =>
  mockBookings.filter(booking => booking.userId === userId);

export const getUpcomingBookings = (userId: string): Booking[] =>
  mockBookings.filter(booking =>
    booking.userId === userId &&
    new Date(booking.startTime) > new Date() &&
    booking.status === 'confirmed'
  );

export const getMyUpcomingBookings = (): Booking[] =>
  getUpcomingBookings(mockPlayers[0].id);