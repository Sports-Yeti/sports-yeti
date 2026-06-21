<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\Space;
use Carbon\Carbon;

class BookingService
{
    public function hasConflict(Space $space, string $startTime, string $endTime, ?string $excludeBookingId = null): bool
    {
        $query = Booking::where('space_id', $space->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where(function ($q) use ($startTime, $endTime) {
                $q->where(function ($inner) use ($startTime) {
                    // New booking starts during existing booking
                    $inner->where('start_time', '<=', $startTime)
                        ->where('end_time', '>', $startTime);
                })->orWhere(function ($inner) use ($endTime) {
                    // New booking ends during existing booking
                    $inner->where('start_time', '<', $endTime)
                        ->where('end_time', '>=', $endTime);
                })->orWhere(function ($inner) use ($startTime, $endTime) {
                    // New booking contains existing booking
                    $inner->where('start_time', '>=', $startTime)
                        ->where('end_time', '<=', $endTime);
                });
            });

        if ($excludeBookingId) {
            $query->where('id', '!=', $excludeBookingId);
        }

        return $query->exists();
    }

    public function calculateHours(string $startTime, string $endTime): float
    {
        $start = Carbon::parse($startTime);
        $end = Carbon::parse($endTime);

        return $start->floatDiffInHours($end);
    }

    public function getAvailableSlots(Space $space, string $date): array
    {
        $slots = [];
        $targetDate = Carbon::parse($date);

        // Get operating hours from facility (default 8am-10pm)
        $facility = $space->facility;
        $dayOfWeek = strtolower($targetDate->format('l'));
        $hours = $facility->operating_hours[$dayOfWeek] ?? ['open' => '08:00', 'close' => '22:00'];

        $openTime = Carbon::parse($date.' '.$hours['open']);
        $closeTime = Carbon::parse($date.' '.$hours['close']);

        // Get all bookings for this space on this date
        $bookings = Booking::where('space_id', $space->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereDate('start_time', $targetDate)
            ->orderBy('start_time')
            ->get();

        $currentTime = $openTime;

        foreach ($bookings as $booking) {
            $bookingStart = Carbon::parse($booking->start_time);
            $bookingEnd = Carbon::parse($booking->end_time);

            // Add available slot before this booking
            if ($currentTime < $bookingStart) {
                $slots[] = [
                    'start_time' => $currentTime->toDateTimeString(),
                    'end_time' => $bookingStart->toDateTimeString(),
                    'available' => true,
                ];
            }

            // Add the booked slot
            $slots[] = [
                'start_time' => $bookingStart->toDateTimeString(),
                'end_time' => $bookingEnd->toDateTimeString(),
                'available' => false,
                'booking_id' => $booking->id,
            ];

            $currentTime = $bookingEnd;
        }

        // Add remaining time until close
        if ($currentTime < $closeTime) {
            $slots[] = [
                'start_time' => $currentTime->toDateTimeString(),
                'end_time' => $closeTime->toDateTimeString(),
                'available' => true,
            ];
        }

        return $slots;
    }
}
