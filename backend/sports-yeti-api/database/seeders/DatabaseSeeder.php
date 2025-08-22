<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\League;
use App\Models\Player;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'League Admin',
            'email' => 'admin@sportsyeti.com',
            'password' => Hash::make('password'),
            'phone' => '+1234567890',
            'language_preference' => 'en',
            'timezone' => 'UTC',
            'email_verified_at' => now(),
        ]);

        // Create basketball league
        $league = League::create([
            'name' => 'Downtown Basketball League',
            'description' => 'Competitive basketball league for downtown players',
            'admin_id' => $admin->id,
            'sport_type' => 'basketball',
            'location' => 'Downtown Sports Complex',
        ]);

        // Create admin player profile
        Player::create([
            'user_id' => $admin->id,
            'league_id' => $league->id,
            'bio' => 'League administrator and basketball enthusiast',
            'experience_level' => 'advanced',
            'availability_status' => 'available',
            'is_private' => false,
            'point_balance' => 5000,
        ]);

        // Create test players
        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => "Player {$i}",
                'email' => "player{$i}@example.com",
                'password' => Hash::make('password'),
                'phone' => "+123456{$i}",
                'email_verified_at' => now(),
            ]);

            Player::create([
                'user_id' => $user->id,
                'league_id' => $league->id,
                'bio' => "Basketball player #{$i}",
                'experience_level' => ['beginner', 'intermediate', 'advanced'][rand(0, 2)],
                'availability_status' => 'available',
                'is_private' => false,
                'point_balance' => rand(500, 3000),
            ]);
        }

        $this->command->info('✅ Database seeded successfully!');
        $this->command->info("📧 Admin login: admin@sportsyeti.com / password");
        $this->command->info("🏀 League: {$league->name}");
        $this->command->info("👥 Players: 11 total");
    }
}
