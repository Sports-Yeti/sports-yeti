<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Team>
 */
class TeamFactory extends Factory
{
    protected $model = Team::class;

    public function definition(): array
    {
        $teamNames = [
            'Thunder', 'Lightning', 'Storm', 'Warriors', 'Titans', 
            'Eagles', 'Hawks', 'Panthers', 'Lions', 'Bears',
            'Wolves', 'Sharks', 'Dragons', 'Phoenix', 'Blazers'
        ];

        return [
            'league_id' => League::factory(),
            'captain_id' => Player::factory(),
            'name' => $this->faker->city() . ' ' . $this->faker->randomElement($teamNames),
            'description' => $this->faker->sentence(),
            'logo_url' => null,
            'status' => 'active',
            'max_roster_size' => 15,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'inactive',
        ]);
    }
}
