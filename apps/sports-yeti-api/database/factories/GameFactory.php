<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Facility;
use App\Models\Game;
use App\Models\League;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Game>
 */
class GameFactory extends Factory
{
    protected $model = Game::class;

    public function definition(): array
    {
        $league = League::factory()->create();

        return [
            'league_id' => $league->id,
            'home_team_id' => Team::factory()->create(['league_id' => $league->id])->id,
            'away_team_id' => Team::factory()->create(['league_id' => $league->id])->id,
            'facility_id' => Facility::factory()->create(['league_id' => $league->id])->id,
            'space_id' => null,
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+30 days'),
            'duration_minutes' => $this->faker->randomElement([45, 60, 90]),
            'status' => 'scheduled',
            'home_score' => null,
            'away_score' => null,
            'notes' => $this->faker->optional()->sentence(),
        ];
    }

    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'scheduled',
            'scheduled_at' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'scheduled_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'scheduled_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'home_score' => $this->faker->numberBetween(50, 120),
            'away_score' => $this->faker->numberBetween(50, 120),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }
}
