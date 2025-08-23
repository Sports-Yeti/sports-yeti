<?php

namespace Database\Seeders;

use App\Models\Facility;
use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => 'password',
            'name' => 'Admin',
        ]);

        $league = League::factory()->create(['name' => 'Yeti League']);

        $facilities = collect(['Court 1', 'Court 2', 'Field A'])->map(function ($name) use ($league) {
            return Facility::create(['league_id' => $league->id, 'name' => $name]);
        });

        $teams = Team::factory()->count(2)->create(['league_id' => $league->id]);

        Player::factory()->count(10)->create([
            'league_id' => $league->id,
            'team_id' => $teams->random()->id,
        ]);
    }
}


