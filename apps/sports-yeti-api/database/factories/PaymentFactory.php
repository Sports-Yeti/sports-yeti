<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'amount' => $this->faker->randomFloat(2, 10, 500),
            'currency' => 'usd',
            'type' => $this->faker->randomElement(['booking', 'camp', 'league', 'membership']),
            'status' => 'pending',
            'description' => $this->faker->sentence(),
            'stripe_payment_intent_id' => 'pi_'.Str::random(24),
            'idempotency_key' => Str::uuid()->toString(),
            'metadata' => [],
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'stripe_charge_id' => 'ch_'.Str::random(24),
            'paid_at' => now(),
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
        ]);
    }

    public function refunded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'refunded',
            'refunded_at' => now(),
        ]);
    }

    public function forBooking(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'booking',
        ]);
    }

    public function forCamp(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'camp',
        ]);
    }
}
