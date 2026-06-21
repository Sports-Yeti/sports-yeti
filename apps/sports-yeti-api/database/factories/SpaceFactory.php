<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Facility;
use App\Models\Space;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Space>
 */
class SpaceFactory extends Factory
{
    protected $model = Space::class;

    public function definition(): array
    {
        return [
            'facility_id' => Facility::factory(),
            'name' => 'Court '.$this->faker->numberBetween(1, 10),
            'type' => $this->faker->randomElement(['basketball_court', 'soccer_field', 'volleyball_court', 'tennis_court', 'multipurpose']),
            'description' => $this->faker->sentence(),
            'capacity' => $this->faker->numberBetween(10, 50),
            'hourly_rate' => $this->faker->randomFloat(2, 25, 150),
            'is_active' => true,
            'amenities' => $this->faker->randomElements(['scoreboard', 'lighting', 'seating', 'sound_system'], 2),
        ];
    }

    public function basketballCourt(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'basketball_court',
            'name' => 'Basketball Court '.$this->faker->numberBetween(1, 5),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
