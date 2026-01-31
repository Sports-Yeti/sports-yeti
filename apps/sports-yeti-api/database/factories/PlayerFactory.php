<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Player;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Player>
 */
class PlayerFactory extends Factory
{
    protected $model = Player::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bio' => $this->faker->paragraph(),
            'experience_level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced', 'pro']),
            'availability_status' => $this->faker->randomElement(['available', 'looking_for_team', 'unavailable']),
            'is_private' => false,
            'position' => $this->faker->randomElement(['point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center']),
        ];
    }

    public function beginner(): static
    {
        return $this->state(fn (array $attributes) => [
            'experience_level' => 'beginner',
        ]);
    }

    public function advanced(): static
    {
        return $this->state(fn (array $attributes) => [
            'experience_level' => 'advanced',
        ]);
    }

    public function private(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_private' => true,
        ]);
    }

    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'availability_status' => 'available',
        ]);
    }
}
