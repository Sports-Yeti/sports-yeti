import { useMemo } from 'react';
import { create } from 'zustand';
import { BOOKINGS, type Booking } from '../mocks/bookings';

/**
 * Session bookings layered over the seeded `BOOKINGS` fixture. Paying for
 * a slot on FacilityDetail creates one here so it shows up under
 * Bookings; cancelling on BookingDetail flips its status everywhere.
 * Resets on app restart (mock data only).
 */
interface BookingsState {
  createdBookings: Booking[];
  cancelledIds: Record<string, true>;
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
}

export const useBookingsStore = create<BookingsState>((set) => ({
  createdBookings: [],
  cancelledIds: {},
  addBooking: (booking) =>
    set((s) => ({ createdBookings: [booking, ...s.createdBookings] })),
  cancelBooking: (id) =>
    set((s) => ({ cancelledIds: { ...s.cancelledIds, [id]: true } })),
}));

/** Session + seeded bookings with cancellations applied, newest first. */
export function useBookings(): Booking[] {
  const createdBookings = useBookingsStore((s) => s.createdBookings);
  const cancelledIds = useBookingsStore((s) => s.cancelledIds);
  return useMemo(
    () =>
      [...createdBookings, ...BOOKINGS].map((b) =>
        cancelledIds[b.id] ? { ...b, status: 'cancelled' as const } : b,
      ),
    [createdBookings, cancelledIds],
  );
}

/** One booking by id (session or seeded), cancellation applied. */
export function useBooking(id: string): Booking | undefined {
  const bookings = useBookings();
  return useMemo(() => bookings.find((b) => b.id === id), [bookings, id]);
}
