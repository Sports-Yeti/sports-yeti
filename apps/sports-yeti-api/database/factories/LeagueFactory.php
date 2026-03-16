<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\League;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\League>
 */
class LeagueFactory extends Factory
{
    protected $model = League::class;

    public function definition(): array
    {
        return [
            'admin_id' => User::factory(),
            'name' => $this->faker->company().' '.$this->faker->randomElement(['League', 'Association', 'Federation']),
            'description' => $this->faker->paragraph(),
            'sport_type' => $this->faker->randomElement(['basketball', 'soccer', 'volleyball', 'tennis']),
            'location' => $this->faker->city().', '.$this->faker->stateAbbr(),
            'timezone' => 'America/New_York',
            'registration_fee' => $this->faker->randomFloat(2, 0, 150),
            'is_active' => true,
            'settings' => [
                'max_teams' => 20,
                'registration_open' => true,
            ],
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }

    public function basketball(): static
    {
        return $this->state(fn (array $attributes) => [
            'sport' => 'basketball',
        ]);
    }
}
