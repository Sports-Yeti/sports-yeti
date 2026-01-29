<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BookingPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('bookings.view') || $user->hasPermissionTo('bookings.view-own');
    }

    public function view(User $user, Booking $booking): bool
    {
        if ($user->hasPermissionTo('bookings.view')) {
            return true;
        }

        // Users can view their own bookings
        return $user->hasPermissionTo('bookings.view-own') && $booking->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('bookings.create');
    }

    public function cancel(User $user, Booking $booking): bool
    {
        if ($user->hasPermissionTo('bookings.cancel')) {
            return true;
        }

        // Users can cancel their own bookings
        return $user->hasPermissionTo('bookings.cancel-own') && $booking->user_id === $user->id;
    }

    public function checkIn(User $user, Booking $booking): bool
    {
        if ($user->hasPermissionTo('bookings.check-in')) {
            return true;
        }

        // Users can check-in for their own bookings
        return $booking->user_id === $user->id;
    }
}
