<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolesAndPermissionsSeeder::class);

        // Create a test super admin user
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@sportsyeti.com',
        ]);
        $superAdmin->assignRole('super-admin');

        // Create a test league admin user
        $leagueAdmin = User::factory()->create([
            'name' => 'League Admin',
            'email' => 'leagueadmin@sportsyeti.com',
        ]);
        $leagueAdmin->assignRole('league-admin');

        // Create a test player user
        $player = User::factory()->create([
            'name' => 'Test Player',
            'email' => 'player@sportsyeti.com',
        ]);
        $player->assignRole('player');
    }
}
