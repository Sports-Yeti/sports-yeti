<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PaymentPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('payments.view') || $user->hasPermissionTo('payments.view-own');
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->hasPermissionTo('payments.view')) {
            return true;
        }

        return $user->hasPermissionTo('payments.view-own') && $payment->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('payments.create');
    }

    public function refund(User $user, Payment $payment): bool
    {
        return $user->hasPermissionTo('payments.refund');
    }
}
