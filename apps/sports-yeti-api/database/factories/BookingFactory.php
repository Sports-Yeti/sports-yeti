<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Space;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $startTime = $this->faker->dateTimeBetween('now', '+30 days');
        $duration = $this->faker->randomElement([1, 2, 3]); // hours

        return [
            'user_id' => User::factory(),
            'space_id' => Space::factory(),
            'start_time' => $startTime,
            'end_time' => (clone $startTime)->modify("+{$duration} hours"),
            'status' => 'confirmed',
            'purpose' => $this->faker->randomElement(['Practice', 'Game', 'Training', 'Event']),
            'notes' => $this->faker->optional()->sentence(),
            'total_amount' => $this->faker->randomFloat(2, 50, 300),
            'total_hours' => $duration,
            'qr_code' => Str::random(32),
            'idempotency_key' => Str::uuid()->toString(),
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'checked_in_at' => now(),
        ]);
    }

    public function past(): static
    {
        $startTime = $this->faker->dateTimeBetween('-30 days', '-1 day');
        $duration = $this->faker->randomElement([1, 2, 3]);

        return $this->state(fn (array $attributes) => [
            'start_time' => $startTime,
            'end_time' => (clone $startTime)->modify("+{$duration} hours"),
            'status' => 'completed',
        ]);
    }
}
