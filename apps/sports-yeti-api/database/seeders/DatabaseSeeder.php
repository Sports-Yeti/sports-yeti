<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Camp;
use App\Models\CampRegistration;
use App\Models\CampSession;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatPoll;
use App\Models\ChatPollVote;
use App\Models\Comment;
use App\Models\Facility;
use App\Models\Game;
use App\Models\GameParticipant;
use App\Models\GameReport;
use App\Models\League;
use App\Models\LeagueAdmin;
use App\Models\LeagueNews;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Player;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\Referee;
use App\Models\RefereeAssignment;
use App\Models\Space;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use App\Models\Waiver;
use App\Models\WaiverSignature;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        // ─── Users ───────────────────────────────────────────────────
        $superAdmin = User::factory()->create([
            'name' => 'Marcus Thompson',
            'email' => 'admin@sportsyeti.com',
            'phone' => '555-100-0001',
        ]);
        $superAdmin->assignRole('super-admin');

        $leagueAdmin = User::factory()->create([
            'name' => 'Sarah Chen',
            'email' => 'leagueadmin@sportsyeti.com',
            'phone' => '555-100-0002',
        ]);
        $leagueAdmin->assignRole('league-admin');

        $facilityManager = User::factory()->create([
            'name' => 'David Park',
            'email' => 'facility@sportsyeti.com',
            'phone' => '555-100-0003',
        ]);
        $facilityManager->assignRole('facility-manager');

        $playerUsers = collect();
        $playerNames = [
            'James Rodriguez', 'Aisha Williams', 'Tyler Jackson', 'Emma Martinez',
            'Khalil Brown', 'Olivia Davis', 'Liam Nguyen', 'Sophia Anderson',
            'Noah Wilson', 'Isabella Taylor', 'Mason Thomas', 'Ava Hernandez',
            'Ethan Moore', 'Mia Clark', 'Lucas White', 'Harper Lewis',
            'Logan Robinson', 'Ella Walker', 'Aiden Hall', 'Chloe Allen',
            'Jackson Young', 'Lily King', 'Sebastian Wright', 'Zoey Scott',
        ];

        foreach ($playerNames as $i => $name) {
            $user = User::factory()->create([
                'name' => $name,
                'email' => 'player'.($i + 1).'@sportsyeti.com',
                'phone' => '555-200-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
            ]);
            $user->assignRole('player');
            $playerUsers->push($user);
        }

        $refereeUsers = collect();
        $refereeNames = ['Mike Santos', 'Karen Phillips', 'Derek Johnson', 'Nina Patel'];
        foreach ($refereeNames as $i => $name) {
            $user = User::factory()->create([
                'name' => $name,
                'email' => 'ref'.($i + 1).'@sportsyeti.com',
                'phone' => '555-300-'.str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
            ]);
            $user->assignRole('player');
            $refereeUsers->push($user);
        }

        // ─── Players ─────────────────────────────────────────────────
        $levels = ['beginner', 'intermediate', 'advanced', 'pro'];
        $positions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];
        $statuses = ['available', 'available', 'available', 'looking_for_team'];

        $superAdminPlayer = Player::create([
            'user_id' => $superAdmin->id,
            'experience_level' => 'pro',
            'availability_status' => 'available',
            'bio' => 'Platform founder and competitive basketball player.',
            'position' => 'Point Guard',
            'stats' => ['games_played' => 45, 'camps_attended' => 3, 'highlights_count' => 0],
        ]);

        $leagueAdminPlayer = Player::create([
            'user_id' => $leagueAdmin->id,
            'experience_level' => 'advanced',
            'availability_status' => 'available',
            'bio' => 'Running the Metro Basketball League for 5 years.',
            'position' => 'Shooting Guard',
            'stats' => ['games_played' => 120, 'camps_attended' => 8, 'highlights_count' => 0],
        ]);

        Player::create([
            'user_id' => $facilityManager->id,
            'experience_level' => 'intermediate',
            'availability_status' => 'unavailable',
            'bio' => 'Facility manager at Eastside Sports Complex.',
        ]);

        $players = collect();
        foreach ($playerUsers as $i => $user) {
            $player = Player::create([
                'user_id' => $user->id,
                'experience_level' => $levels[$i % count($levels)],
                'availability_status' => $statuses[$i % count($statuses)],
                'bio' => fake()->sentence(10),
                'position' => $positions[$i % count($positions)],
                'height_inches' => rand(66, 82),
                'weight_lbs' => rand(150, 240),
                'date_of_birth' => fake()->dateTimeBetween('-35 years', '-18 years')->format('Y-m-d'),
                'is_private' => $i % 7 === 0,
                'stats' => [
                    'games_played' => rand(5, 80),
                    'camps_attended' => rand(0, 5),
                    'highlights_count' => 0,
                    'available_to_sub' => $i % 3 === 0,
                    'certifications' => $i % 5 === 0 ? 'First Aid Certified' : null,
                ],
            ]);
            $players->push($player);
        }

        $refereePlayers = collect();
        foreach ($refereeUsers as $user) {
            $player = Player::create([
                'user_id' => $user->id,
                'experience_level' => 'advanced',
                'availability_status' => 'available',
                'bio' => 'Certified referee with years of experience.',
            ]);
            $refereePlayers->push($player);
        }

        // ─── Leagues ─────────────────────────────────────────────────
        $metroBasketball = League::create([
            'name' => 'Metro Basketball League',
            'description' => 'The premier recreational basketball league in the metro area. Competitive play for all skill levels with divisions from beginner to advanced.',
            'admin_id' => $leagueAdmin->id,
            'sport_type' => 'basketball',
            'location' => 'New York, NY',
            'timezone' => 'America/New_York',
            'registration_fee' => 150.00,
            'is_active' => true,
            'settings' => [
                'max_teams' => 16,
                'registration_open' => now()->subMonth()->toDateString(),
                'registration_close' => now()->addMonth()->toDateString(),
                'season_start' => now()->toDateString(),
                'season_end' => now()->addMonths(3)->toDateString(),
                'games_per_week' => 2,
            ],
        ]);

        $citySoccer = League::create([
            'name' => 'City Soccer United',
            'description' => 'Indoor and outdoor soccer league with spring and fall seasons. Teams of 7 compete in round-robin format.',
            'admin_id' => $leagueAdmin->id,
            'sport_type' => 'soccer',
            'location' => 'Brooklyn, NY',
            'timezone' => 'America/New_York',
            'registration_fee' => 120.00,
            'is_active' => true,
            'settings' => [
                'max_teams' => 12,
                'registration_open' => now()->subWeeks(2)->toDateString(),
                'registration_close' => now()->addWeeks(3)->toDateString(),
            ],
        ]);

        $eliteVolleyball = League::create([
            'name' => 'Elite Volleyball Association',
            'description' => 'Co-ed volleyball league for intermediate and advanced players. Beach and indoor divisions available.',
            'admin_id' => $superAdmin->id,
            'sport_type' => 'volleyball',
            'location' => 'Queens, NY',
            'timezone' => 'America/New_York',
            'registration_fee' => 100.00,
            'is_active' => true,
            'settings' => ['max_teams' => 8],
        ]);

        $leagues = collect([$metroBasketball, $citySoccer, $eliteVolleyball]);

        // League admins
        LeagueAdmin::create(['league_id' => $metroBasketball->id, 'user_id' => $leagueAdmin->id, 'role' => 'admin']);
        LeagueAdmin::create(['league_id' => $citySoccer->id, 'user_id' => $leagueAdmin->id, 'role' => 'admin']);
        LeagueAdmin::create(['league_id' => $eliteVolleyball->id, 'user_id' => $superAdmin->id, 'role' => 'admin']);

        // ─── Facilities ──────────────────────────────────────────────
        $eastside = Facility::withoutGlobalScopes()->create([
            'league_id' => $metroBasketball->id,
            'name' => 'Eastside Sports Complex',
            'description' => 'Modern multi-sport facility with 4 full courts, locker rooms, and pro shop.',
            'address' => '450 E 52nd Street',
            'city' => 'New York',
            'state' => 'NY',
            'zip_code' => '10022',
            'latitude' => 40.7565,
            'longitude' => -73.9656,
            'phone' => '555-400-0001',
            'email' => 'info@eastsidesports.com',
            'operating_hours' => [
                'monday' => ['open' => '06:00', 'close' => '22:00'],
                'tuesday' => ['open' => '06:00', 'close' => '22:00'],
                'wednesday' => ['open' => '06:00', 'close' => '22:00'],
                'thursday' => ['open' => '06:00', 'close' => '22:00'],
                'friday' => ['open' => '06:00', 'close' => '23:00'],
                'saturday' => ['open' => '07:00', 'close' => '23:00'],
                'sunday' => ['open' => '08:00', 'close' => '20:00'],
            ],
            'amenities' => ['Locker Rooms', 'Pro Shop', 'Parking', 'Water Fountains', 'Scoreboard', 'Wi-Fi'],
            'is_active' => true,
        ]);

        $riverside = Facility::withoutGlobalScopes()->create([
            'league_id' => $citySoccer->id,
            'name' => 'Riverside Athletic Center',
            'description' => 'Outdoor turf fields and indoor gymnasium. Perfect for soccer and volleyball.',
            'address' => '125 Riverside Drive',
            'city' => 'Brooklyn',
            'state' => 'NY',
            'zip_code' => '11201',
            'latitude' => 40.6782,
            'longitude' => -73.9442,
            'phone' => '555-400-0002',
            'email' => 'bookings@riversideac.com',
            'operating_hours' => [
                'monday' => ['open' => '07:00', 'close' => '21:00'],
                'tuesday' => ['open' => '07:00', 'close' => '21:00'],
                'wednesday' => ['open' => '07:00', 'close' => '21:00'],
                'thursday' => ['open' => '07:00', 'close' => '21:00'],
                'friday' => ['open' => '07:00', 'close' => '22:00'],
                'saturday' => ['open' => '08:00', 'close' => '22:00'],
                'sunday' => ['open' => '09:00', 'close' => '18:00'],
            ],
            'amenities' => ['Turf Fields', 'Indoor Gym', 'Changing Rooms', 'Concession Stand'],
            'is_active' => true,
        ]);

        $summit = Facility::withoutGlobalScopes()->create([
            'league_id' => $eliteVolleyball->id,
            'name' => 'Summit Recreation Center',
            'description' => 'Community recreation center with volleyball and basketball courts, meeting rooms.',
            'address' => '88 Queens Blvd',
            'city' => 'Queens',
            'state' => 'NY',
            'zip_code' => '11375',
            'latitude' => 40.7213,
            'longitude' => -73.8447,
            'phone' => '555-400-0003',
            'email' => 'info@summitrc.com',
            'operating_hours' => [
                'monday' => ['open' => '06:00', 'close' => '22:00'],
                'tuesday' => ['open' => '06:00', 'close' => '22:00'],
                'wednesday' => ['open' => '06:00', 'close' => '22:00'],
                'thursday' => ['open' => '06:00', 'close' => '22:00'],
                'friday' => ['open' => '06:00', 'close' => '23:00'],
                'saturday' => ['open' => '07:00', 'close' => '23:00'],
                'sunday' => ['open' => '08:00', 'close' => '20:00'],
            ],
            'amenities' => ['Sand Courts', 'Indoor Courts', 'Bleachers', 'Parking', 'Showers'],
            'is_active' => true,
        ]);

        // ─── Spaces ──────────────────────────────────────────────────
        $eastsideCourt1 = Space::create([
            'facility_id' => $eastside->id, 'name' => 'Court A', 'description' => 'Full-size hardwood basketball court with electronic scoreboard.',
            'sport_type' => 'basketball', 'capacity' => 30, 'hourly_rate' => 85.00, 'surface_type' => 'hardwood', 'is_indoor' => true, 'is_active' => true,
            'features' => ['Electronic Scoreboard', 'LED Lighting', 'Bleacher Seating'],
        ]);
        $eastsideCourt2 = Space::create([
            'facility_id' => $eastside->id, 'name' => 'Court B', 'description' => 'Practice court with rebounding machines.',
            'sport_type' => 'basketball', 'capacity' => 20, 'hourly_rate' => 65.00, 'surface_type' => 'hardwood', 'is_indoor' => true, 'is_active' => true,
            'features' => ['Rebounding Machine', 'Shot Clock'],
        ]);
        $eastsideCourt3 = Space::create([
            'facility_id' => $eastside->id, 'name' => 'Court C', 'description' => 'Multi-purpose court.',
            'sport_type' => 'basketball', 'capacity' => 25, 'hourly_rate' => 75.00, 'surface_type' => 'hardwood', 'is_indoor' => true, 'is_active' => true,
        ]);
        $eastsideTraining = Space::create([
            'facility_id' => $eastside->id, 'name' => 'Training Room', 'description' => 'Conditioning and film room.',
            'sport_type' => 'basketball', 'capacity' => 15, 'hourly_rate' => 40.00, 'surface_type' => 'rubber', 'is_indoor' => true, 'is_active' => true,
            'features' => ['Film Projector', 'Weights', 'Agility Equipment'],
        ]);

        $riversideField1 = Space::create([
            'facility_id' => $riverside->id, 'name' => 'Turf Field 1', 'description' => 'Full-size artificial turf soccer field.',
            'sport_type' => 'soccer', 'capacity' => 40, 'hourly_rate' => 120.00, 'surface_type' => 'artificial_turf', 'is_indoor' => false, 'is_active' => true,
            'features' => ['Goals', 'Lighting', 'Line Markings'],
        ]);
        $riversideField2 = Space::create([
            'facility_id' => $riverside->id, 'name' => 'Turf Field 2', 'description' => 'Practice-size turf field.',
            'sport_type' => 'soccer', 'capacity' => 25, 'hourly_rate' => 80.00, 'surface_type' => 'artificial_turf', 'is_indoor' => false, 'is_active' => true,
        ]);
        $riversideGym = Space::create([
            'facility_id' => $riverside->id, 'name' => 'Indoor Gymnasium', 'description' => 'Multi-purpose indoor gym.',
            'sport_type' => 'volleyball', 'capacity' => 30, 'hourly_rate' => 70.00, 'surface_type' => 'hardwood', 'is_indoor' => true, 'is_active' => true,
        ]);

        $summitSand1 = Space::create([
            'facility_id' => $summit->id, 'name' => 'Sand Court 1', 'description' => 'Beach volleyball court.',
            'sport_type' => 'volleyball', 'capacity' => 20, 'hourly_rate' => 55.00, 'surface_type' => 'sand', 'is_indoor' => false, 'is_active' => true,
        ]);
        $summitSand2 = Space::create([
            'facility_id' => $summit->id, 'name' => 'Sand Court 2',
            'sport_type' => 'volleyball', 'capacity' => 20, 'hourly_rate' => 55.00, 'surface_type' => 'sand', 'is_indoor' => false, 'is_active' => true,
        ]);
        $summitIndoor = Space::create([
            'facility_id' => $summit->id, 'name' => 'Main Indoor Court', 'description' => 'Full indoor volleyball court with padded floors.',
            'sport_type' => 'volleyball', 'capacity' => 30, 'hourly_rate' => 75.00, 'surface_type' => 'rubber', 'is_indoor' => true, 'is_active' => true,
            'features' => ['Adjustable Net Heights', 'Padded Floors', 'Ball Cart'],
        ]);

        // ─── Teams ───────────────────────────────────────────────────
        $teamData = [
            // Basketball teams (Metro Basketball League)
            ['Thunder Hawks', $metroBasketball, $players[0], 'approved', 'High-energy team with a fast-break offense.'],
            ['Night Wolves', $metroBasketball, $players[4], 'approved', 'Defensive powerhouse, gritty and relentless.'],
            ['Iron Eagles', $metroBasketball, $players[8], 'approved', 'Veteran squad with championship experience.'],
            ['Rising Suns', $metroBasketball, $players[12], 'approved', 'Young up-and-coming roster full of potential.'],
            ['Storm Breakers', $metroBasketball, $players[16], 'pending', 'New team looking to make a splash.'],
            ['Shadow Kings', $metroBasketball, $players[20], 'pending', 'Streetball legends entering league play.'],
            // Soccer teams (City Soccer United)
            ['Brooklyn FC', $citySoccer, $players[1], 'approved', 'Community-rooted soccer club.'],
            ['United Strikers', $citySoccer, $players[5], 'approved', 'Attack-minded team with creative playmakers.'],
            ['Harbor City SC', $citySoccer, $players[9], 'approved', 'Solid defensive structure, counterattack specialists.'],
            ['Dynamo FC', $citySoccer, $players[13], 'rejected', 'Application rejected due to incomplete roster.'],
            // Volleyball teams (Elite Volleyball Association)
            ['Spike Force', $eliteVolleyball, $players[2], 'approved', 'Dominant at the net with powerful hitters.'],
            ['Beach Blazers', $eliteVolleyball, $players[6], 'approved', 'Sand court specialists transitioning indoors.'],
            ['Net Ninjas', $eliteVolleyball, $players[10], 'approved', 'Quick reflexes and excellent court coverage.'],
            ['Set Point', $eliteVolleyball, $players[14], 'inactive', 'On hiatus for the current season.'],
        ];

        $teams = collect();
        foreach ($teamData as [$name, $league, $captain, $status, $desc]) {
            $team = Team::withoutGlobalScopes()->create([
                'name' => $name,
                'league_id' => $league->id,
                'captain_id' => $captain->id,
                'description' => $desc,
                'status' => $status,
                'max_roster_size' => $league->sport_type === 'soccer' ? 11 : 10,
                'stats' => ['wins' => rand(0, 12), 'losses' => rand(0, 8), 'draws' => rand(0, 3)],
            ]);
            $teams->push($team);
        }

        // ─── Team Members ────────────────────────────────────────────
        foreach ($teams as $teamIdx => $team) {
            // Captain is always a member
            TeamMember::create([
                'team_id' => $team->id,
                'player_id' => $team->captain_id,
                'role' => 'captain',
                'payment_status' => 'paid',
                'waiver_signed' => true,
                'joined_at' => now()->subMonths(2),
            ]);

            // Add 4-6 additional players per team, avoiding duplicates
            $rosterSize = rand(4, 6);
            $usedPlayerIds = [$team->captain_id];
            for ($m = 0; $m < $rosterSize; $m++) {
                $candidate = $players[($teamIdx * 3 + $m + 1) % $players->count()];
                if (in_array($candidate->id, $usedPlayerIds)) {
                    continue;
                }
                $usedPlayerIds[] = $candidate->id;

                $paymentStatuses = ['paid', 'paid', 'paid', 'pending', 'partial'];
                TeamMember::create([
                    'team_id' => $team->id,
                    'player_id' => $candidate->id,
                    'role' => 'player',
                    'payment_status' => $paymentStatuses[$m % count($paymentStatuses)],
                    'waiver_signed' => $m % 4 !== 3,
                    'joined_at' => now()->subWeeks(rand(1, 8)),
                ]);
            }
        }

        // ─── Games ───────────────────────────────────────────────────
        $approvedBball = $teams->filter(fn ($t) => $t->league_id === $metroBasketball->id && $t->status === 'approved')->values();
        $approvedSoccer = $teams->filter(fn ($t) => $t->league_id === $citySoccer->id && $t->status === 'approved')->values();
        $approvedVolley = $teams->filter(fn ($t) => $t->league_id === $eliteVolleyball->id && $t->status === 'approved')->values();

        $games = collect();

        // Past completed basketball games
        for ($w = 1; $w <= 4; $w++) {
            for ($g = 0; $g < 2 && $g + 1 < $approvedBball->count(); $g++) {
                $t1 = $approvedBball[$g];
                $t2 = $approvedBball[$g + 1];
                $s1 = rand(60, 110);
                $s2 = rand(60, 110);
                $game = Game::withoutGlobalScopes()->create([
                    'league_id' => $metroBasketball->id,
                    'team1_id' => $t1->id, 'team2_id' => $t2->id,
                    'facility_id' => $eastside->id, 'space_id' => $eastsideCourt1->id,
                    'scheduled_at' => now()->subWeeks($w)->addHours(rand(17, 20)),
                    'status' => 'completed', 'game_type' => 'regular',
                    'team1_score' => $s1, 'team2_score' => $s2,
                    'winner_team_id' => $s1 > $s2 ? $t1->id : $t2->id,
                    'season_number' => 1, 'week_number' => $w,
                ]);
                $games->push($game);
            }
        }

        // Upcoming basketball games
        for ($w = 0; $w < 3; $w++) {
            if ($approvedBball->count() >= 4) {
                $game = Game::withoutGlobalScopes()->create([
                    'league_id' => $metroBasketball->id,
                    'team1_id' => $approvedBball[$w % $approvedBball->count()]->id,
                    'team2_id' => $approvedBball[($w + 1) % $approvedBball->count()]->id,
                    'facility_id' => $eastside->id, 'space_id' => $eastsideCourt1->id,
                    'scheduled_at' => now()->addDays($w * 3 + 1)->setHour(19)->setMinute(0),
                    'status' => 'scheduled', 'game_type' => 'regular',
                    'season_number' => 1, 'week_number' => 5 + $w,
                ]);
                $games->push($game);
            }
        }

        // In-progress basketball game
        if ($approvedBball->count() >= 4) {
            $liveGame = Game::withoutGlobalScopes()->create([
                'league_id' => $metroBasketball->id,
                'team1_id' => $approvedBball[2]->id, 'team2_id' => $approvedBball[3]->id,
                'facility_id' => $eastside->id, 'space_id' => $eastsideCourt2->id,
                'scheduled_at' => now()->subHour(),
                'status' => 'in_progress', 'game_type' => 'regular',
                'team1_score' => 42, 'team2_score' => 38,
                'season_number' => 1, 'week_number' => 5,
            ]);
            $games->push($liveGame);
        }

        // Soccer games
        if ($approvedSoccer->count() >= 2) {
            $games->push(Game::withoutGlobalScopes()->create([
                'league_id' => $citySoccer->id,
                'team1_id' => $approvedSoccer[0]->id, 'team2_id' => $approvedSoccer[1]->id,
                'facility_id' => $riverside->id, 'space_id' => $riversideField1->id,
                'scheduled_at' => now()->subWeek()->setHour(10), 'status' => 'completed', 'game_type' => 'regular',
                'team1_score' => 3, 'team2_score' => 1, 'winner_team_id' => $approvedSoccer[0]->id,
            ]));
            $games->push(Game::withoutGlobalScopes()->create([
                'league_id' => $citySoccer->id,
                'team1_id' => $approvedSoccer[1]->id, 'team2_id' => $approvedSoccer[2]->id,
                'facility_id' => $riverside->id, 'space_id' => $riversideField1->id,
                'scheduled_at' => now()->addDays(5)->setHour(14), 'status' => 'scheduled', 'game_type' => 'regular',
            ]));
        }

        // Volleyball games
        if ($approvedVolley->count() >= 2) {
            $games->push(Game::withoutGlobalScopes()->create([
                'league_id' => $eliteVolleyball->id,
                'team1_id' => $approvedVolley[0]->id, 'team2_id' => $approvedVolley[1]->id,
                'facility_id' => $summit->id, 'space_id' => $summitIndoor->id,
                'scheduled_at' => now()->subDays(3)->setHour(18), 'status' => 'completed', 'game_type' => 'regular',
                'team1_score' => 25, 'team2_score' => 22, 'winner_team_id' => $approvedVolley[0]->id,
            ]));
            $games->push(Game::withoutGlobalScopes()->create([
                'league_id' => $eliteVolleyball->id,
                'team1_id' => $approvedVolley[1]->id, 'team2_id' => $approvedVolley[2]->id,
                'facility_id' => $summit->id, 'space_id' => $summitSand1->id,
                'scheduled_at' => now()->addDays(7)->setHour(16), 'status' => 'scheduled', 'game_type' => 'friendly',
            ]));
        }

        // ─── Game Participants ───────────────────────────────────────
        foreach ($games as $game) {
            $seenPlayerIds = [];

            $team1Members = TeamMember::where('team_id', $game->team1_id)->limit(5)->get();
            foreach ($team1Members as $tm) {
                if (in_array($tm->player_id, $seenPlayerIds)) {
                    continue;
                }
                $seenPlayerIds[] = $tm->player_id;
                GameParticipant::create([
                    'game_id' => $game->id, 'player_id' => $tm->player_id, 'team_id' => $game->team1_id,
                    'attendance_confirmed' => $game->status !== 'scheduled',
                    'attendance_response' => $game->status === 'scheduled' ? ['yes', 'maybe', null][rand(0, 2)] : 'yes',
                    'stats' => $game->status === 'completed' ? [
                        'points' => rand(4, 28), 'rebounds' => rand(1, 12), 'assists' => rand(0, 10),
                        'steals' => rand(0, 5), 'blocks' => rand(0, 3),
                    ] : null,
                ]);
            }
            $team2Members = TeamMember::where('team_id', $game->team2_id)->limit(5)->get();
            foreach ($team2Members as $tm) {
                if (in_array($tm->player_id, $seenPlayerIds)) {
                    continue;
                }
                $seenPlayerIds[] = $tm->player_id;
                GameParticipant::create([
                    'game_id' => $game->id, 'player_id' => $tm->player_id, 'team_id' => $game->team2_id,
                    'attendance_confirmed' => $game->status !== 'scheduled',
                    'attendance_response' => $game->status === 'scheduled' ? ['yes', 'maybe', null][rand(0, 2)] : 'yes',
                    'stats' => $game->status === 'completed' ? [
                        'points' => rand(4, 28), 'rebounds' => rand(1, 12), 'assists' => rand(0, 10),
                        'steals' => rand(0, 5), 'blocks' => rand(0, 3),
                    ] : null,
                ]);
            }
        }

        // ─── Game Reports ────────────────────────────────────────────
        $completedGames = $games->where('status', 'completed');
        foreach ($completedGames->take(3) as $game) {
            GameReport::create([
                'game_id' => $game->id,
                'captain_id' => Team::find($game->team1_id)->captain_id,
                'report_type' => 'post_game',
                'details' => 'Good competitive game. Fair officiating, no major incidents.',
                'equipment_damage' => false,
                'status' => 'submitted',
            ]);
        }

        // ─── Chats ───────────────────────────────────────────────────
        $teamChats = collect();
        foreach ($teams->where('status', 'approved')->take(6) as $team) {
            $chat = Chat::create([
                'team_id' => $team->id, 'league_id' => $team->league_id,
                'type' => 'team', 'name' => $team->name.' Chat', 'is_active' => true,
            ]);
            $teamChats->push($chat);
        }

        $gameChats = collect();
        foreach ($games->take(6) as $game) {
            $t1 = Team::withoutGlobalScopes()->find($game->team1_id);
            $t2 = Team::withoutGlobalScopes()->find($game->team2_id);
            $chat = Chat::create([
                'game_id' => $game->id, 'league_id' => $game->league_id,
                'type' => 'game', 'name' => ($t1->name ?? 'Team 1').' vs '.($t2->name ?? 'Team 2'), 'is_active' => true,
            ]);
            $gameChats->push($chat);
        }

        // Chat messages
        $chatMessages = [
            'Great game yesterday, looking forward to next week!',
            'Practice moved to Thursday at 7pm.',
            'Who is bringing the water bottles?',
            'Nice win team! Keep the momentum going.',
            'Anyone want to do extra shooting drills after practice?',
            'Coach says we need to work on our transition defense.',
            'Game time is confirmed for Saturday at 3pm.',
            'Let\'s go team! We got this!',
        ];
        foreach ($teamChats->take(3) as $chat) {
            $teamMembers = TeamMember::where('team_id', $chat->team_id)->get();
            foreach (array_slice($chatMessages, 0, rand(3, 6)) as $idx => $msg) {
                $sender = $teamMembers->isNotEmpty() ? Player::find($teamMembers->random()->player_id)?->user_id : $leagueAdmin->id;
                ChatMessage::create([
                    'chat_id' => $chat->id, 'user_id' => $sender ?? $leagueAdmin->id,
                    'message' => $msg, 'message_type' => 'text',
                    'created_at' => now()->subHours(rand(1, 72)),
                ]);
            }
        }

        // Chat polls
        if ($teamChats->isNotEmpty()) {
            $poll = ChatPoll::create([
                'chat_id' => $teamChats->first()->id,
                'created_by' => $leagueAdmin->id,
                'question' => 'What time works best for practice next week?',
                'options' => ['Tuesday 6pm', 'Wednesday 7pm', 'Thursday 6pm', 'Saturday 10am'],
                'poll_type' => 'attendance',
                'is_closed' => false,
                'expires_at' => now()->addDays(3),
            ]);
            ChatPollVote::create(['poll_id' => $poll->id, 'user_id' => $playerUsers[0]->id, 'option_index' => 1]);
            ChatPollVote::create(['poll_id' => $poll->id, 'user_id' => $playerUsers[4]->id, 'option_index' => 2]);
            ChatPollVote::create(['poll_id' => $poll->id, 'user_id' => $playerUsers[8]->id, 'option_index' => 1]);
        }

        // ─── Referees ────────────────────────────────────────────────
        $referees = collect();
        $refSports = [['basketball', 'soccer'], ['basketball'], ['soccer', 'volleyball'], ['volleyball']];
        $refCerts = ['NFHS Certified', 'USSF Grade 8', 'USAV Regional', 'AAU Certified'];
        $refRates = [45.00, 55.00, 40.00, 50.00];
        foreach ($refereeUsers as $i => $user) {
            $referee = Referee::create([
                'user_id' => $user->id,
                'league_id' => $leagues[$i % $leagues->count()]->id,
                'sport_types' => $refSports[$i],
                'experience_level' => 'advanced',
                'certification' => $refCerts[$i],
                'hourly_rate' => $refRates[$i],
                'rating' => round(rand(35, 50) / 10, 2),
                'total_games' => rand(20, 80),
                'is_available' => true,
                'bio' => fake()->sentence(12),
            ]);
            $referees->push($referee);
        }

        // ─── Referee Assignments ─────────────────────────────────────
        // Completed assignments for past games
        foreach ($completedGames->take(4) as $i => $game) {
            RefereeAssignment::create([
                'referee_id' => $referees[$i % $referees->count()]->id,
                'game_id' => $game->id,
                'status' => 'completed',
                'assigned_rate' => $referees[$i % $referees->count()]->hourly_rate,
                'is_bidding' => false,
                'admin_approved' => true,
                'report' => 'Game officiated without incident. Both teams showed good sportsmanship.',
                'rating_given' => round(rand(35, 50) / 10, 2),
            ]);
        }

        // Pending/accepted assignments for upcoming games
        $upcomingGames = $games->where('status', 'scheduled');
        foreach ($upcomingGames->take(2) as $i => $game) {
            RefereeAssignment::create([
                'referee_id' => $referees[$i % $referees->count()]->id,
                'game_id' => $game->id,
                'status' => $i === 0 ? 'accepted' : 'pending',
                'assigned_rate' => $referees[$i % $referees->count()]->hourly_rate,
                'is_bidding' => false,
                'admin_approved' => $i === 0,
            ]);
        }

        // Bidding assignment
        if ($upcomingGames->count() > 2) {
            $biddingGame = $upcomingGames->values()->get(2);
            if ($biddingGame) {
                RefereeAssignment::create([
                    'referee_id' => $referees[2]->id, 'game_id' => $biddingGame->id,
                    'status' => 'pending', 'assigned_rate' => 0, 'is_bidding' => true,
                    'bid_amount' => 50.00, 'admin_approved' => false,
                ]);
                RefereeAssignment::create([
                    'referee_id' => $referees[3]->id, 'game_id' => $biddingGame->id,
                    'status' => 'pending', 'assigned_rate' => 0, 'is_bidding' => true,
                    'bid_amount' => 42.00, 'admin_approved' => false,
                ]);
            }
        }

        // ─── Bookings ────────────────────────────────────────────────
        $bookingSpaces = [$eastsideCourt1, $eastsideCourt2, $riversideField1, $summitSand1, $summitIndoor];
        $bookingUsers = [$superAdmin, $leagueAdmin, ...$playerUsers->take(6)];

        // Past bookings (completed)
        for ($b = 0; $b < 8; $b++) {
            $space = $bookingSpaces[$b % count($bookingSpaces)];
            $user = $bookingUsers[$b % count($bookingUsers)];
            $start = now()->subDays(rand(2, 14))->setHour(rand(9, 18))->setMinute(0)->setSecond(0);
            $hours = rand(1, 3);
            Booking::create([
                'space_id' => $space->id, 'user_id' => $user->id,
                'start_time' => $start, 'end_time' => $start->copy()->addHours($hours),
                'status' => 'completed', 'amount' => $space->hourly_rate * $hours,
                'qr_code' => Str::uuid()->toString(), 'purpose' => ['Practice', 'Open Play', 'Training', 'Team Event'][$b % 4],
                'checked_in_at' => $start,
            ]);
        }

        // Upcoming bookings (confirmed)
        for ($b = 0; $b < 5; $b++) {
            $space = $bookingSpaces[$b % count($bookingSpaces)];
            $user = $bookingUsers[($b + 3) % count($bookingUsers)];
            $start = now()->addDays(rand(1, 10))->setHour(rand(10, 19))->setMinute(0)->setSecond(0);
            $hours = rand(1, 2);
            Booking::create([
                'space_id' => $space->id, 'user_id' => $user->id,
                'start_time' => $start, 'end_time' => $start->copy()->addHours($hours),
                'status' => 'confirmed', 'amount' => $space->hourly_rate * $hours,
                'qr_code' => Str::uuid()->toString(), 'purpose' => ['Practice', 'Open Play', 'Private Session'][$b % 3],
            ]);
        }

        // Pending booking
        $pendStart = now()->addDays(3)->setHour(17)->setMinute(0)->setSecond(0);
        Booking::create([
            'space_id' => $eastsideCourt3->id, 'user_id' => $playerUsers[10]->id,
            'start_time' => $pendStart, 'end_time' => $pendStart->copy()->addHours(2),
            'status' => 'pending', 'amount' => 150.00,
            'qr_code' => Str::uuid()->toString(), 'purpose' => 'Team tryout',
        ]);

        // ─── Camps ───────────────────────────────────────────────────
        $summerCamp = Camp::withoutGlobalScopes()->create([
            'league_id' => $metroBasketball->id,
            'name' => 'Summer Hoops Intensive',
            'description' => 'Five-day intensive basketball camp focusing on fundamentals, game strategy, and physical conditioning. Led by former college coaches.',
            'start_date' => now()->addWeeks(4)->toDateString(),
            'end_date' => now()->addWeeks(5)->toDateString(),
            'registration_fee' => 275.00,
            'max_participants' => 40,
            'skill_level' => 'intermediate',
            'age_group' => '14-18',
            'status' => 'open',
        ]);

        $youthCamp = Camp::withoutGlobalScopes()->create([
            'league_id' => $metroBasketball->id,
            'name' => 'Youth Basketball Fundamentals',
            'description' => 'Weekend camp for beginners. Learn dribbling, passing, shooting, and teamwork basics.',
            'start_date' => now()->addWeeks(6)->toDateString(),
            'end_date' => now()->addWeeks(6)->addDays(2)->toDateString(),
            'registration_fee' => 125.00,
            'max_participants' => 30,
            'skill_level' => 'beginner',
            'age_group' => '8-13',
            'status' => 'open',
        ]);

        $soccerCamp = Camp::withoutGlobalScopes()->create([
            'league_id' => $citySoccer->id,
            'name' => 'Soccer Skills Bootcamp',
            'description' => 'Three-day soccer skills bootcamp with professional trainers. Ball control, positioning, and set pieces.',
            'start_date' => now()->addWeeks(3)->toDateString(),
            'end_date' => now()->addWeeks(3)->addDays(3)->toDateString(),
            'registration_fee' => 200.00,
            'max_participants' => 25,
            'skill_level' => 'all',
            'age_group' => '16+',
            'status' => 'open',
        ]);

        $completedCamp = Camp::withoutGlobalScopes()->create([
            'league_id' => $eliteVolleyball->id,
            'name' => 'Spring Volleyball Clinic',
            'description' => 'Completed clinic covering serving, setting, and defensive techniques.',
            'start_date' => now()->subWeeks(4)->toDateString(),
            'end_date' => now()->subWeeks(3)->toDateString(),
            'registration_fee' => 150.00,
            'max_participants' => 20,
            'skill_level' => 'advanced',
            'status' => 'completed',
        ]);

        // Camp sessions
        foreach (range(1, 5) as $day) {
            CampSession::create([
                'camp_id' => $summerCamp->id, 'facility_id' => $eastside->id, 'space_id' => $eastsideCourt1->id,
                'title' => "Day $day - ".['Fundamentals', 'Offense', 'Defense', 'Scrimmage', 'Tournament'][$day - 1],
                'start_time' => now()->addWeeks(4)->addDays($day - 1)->setHour(9),
                'end_time' => now()->addWeeks(4)->addDays($day - 1)->setHour(15),
                'max_participants' => 40, 'session_type' => 'training',
            ]);
        }
        CampSession::create([
            'camp_id' => $soccerCamp->id, 'facility_id' => $riverside->id, 'space_id' => $riversideField1->id,
            'title' => 'Day 1 - Ball Control Mastery',
            'start_time' => now()->addWeeks(3)->setHour(8),
            'end_time' => now()->addWeeks(3)->setHour(14),
            'max_participants' => 25, 'session_type' => 'training',
        ]);

        // Camp registrations
        foreach ($players->take(12) as $i => $player) {
            $camp = [$summerCamp, $youthCamp, $soccerCamp][$i % 3];
            CampRegistration::create([
                'camp_id' => $camp->id, 'player_id' => $player->id,
                'payment_status' => $i % 4 === 3 ? 'pending' : 'paid',
                'attendance_status' => 'registered',
            ]);
        }
        foreach ($players->slice(16, 4) as $player) {
            CampRegistration::create([
                'camp_id' => $completedCamp->id, 'player_id' => $player->id,
                'payment_status' => 'paid', 'attendance_status' => 'attended',
            ]);
        }

        // ─── Payments ────────────────────────────────────────────────
        // League registration payments
        foreach ($teams->where('status', 'approved')->take(6) as $team) {
            $members = TeamMember::where('team_id', $team->id)->where('payment_status', 'paid')->get();
            foreach ($members->take(3) as $tm) {
                $player = Player::find($tm->player_id);
                if (! $player) {
                    continue;
                }
                $league = League::find($team->league_id);
                Payment::create([
                    'user_id' => $player->user_id,
                    'league_id' => $team->league_id,
                    'amount' => $league ? $league->registration_fee : 100.00,
                    'fee_amount' => 5.00,
                    'net_amount' => ($league ? $league->registration_fee : 100.00) - 5.00,
                    'currency' => 'USD',
                    'type' => 'league_registration',
                    'status' => 'completed',
                    'payable_type' => 'App\\Models\\Team',
                    'payable_id' => $team->id,
                    'paid_at' => now()->subWeeks(rand(2, 6)),
                    'stripe_payment_intent_id' => 'pi_demo_'.Str::random(16),
                    'metadata' => ['team_name' => $team->name, 'league_name' => $league?->name],
                ]);
            }
        }

        // Camp registration payments
        $paidCampRegs = CampRegistration::where('payment_status', 'paid')->get();
        foreach ($paidCampRegs->take(8) as $reg) {
            $player = Player::find($reg->player_id);
            $camp = Camp::withoutGlobalScopes()->find($reg->camp_id);
            if (! $player || ! $camp) {
                continue;
            }
            Payment::create([
                'user_id' => $player->user_id,
                'league_id' => $camp->league_id,
                'amount' => $camp->registration_fee,
                'fee_amount' => 3.00,
                'net_amount' => $camp->registration_fee - 3.00,
                'currency' => 'USD',
                'type' => 'camp_registration',
                'status' => 'completed',
                'payable_type' => 'App\\Models\\CampRegistration',
                'payable_id' => $reg->id,
                'paid_at' => now()->subWeeks(rand(1, 4)),
                'stripe_payment_intent_id' => 'pi_demo_'.Str::random(16),
            ]);
        }

        // Facility booking payments
        $completedBookings = Booking::where('status', 'completed')->take(4)->get();
        foreach ($completedBookings as $booking) {
            Payment::create([
                'user_id' => $booking->user_id,
                'amount' => $booking->amount,
                'fee_amount' => 2.50,
                'net_amount' => $booking->amount - 2.50,
                'currency' => 'USD',
                'type' => 'facility_booking',
                'status' => 'completed',
                'payable_type' => 'App\\Models\\Booking',
                'payable_id' => $booking->id,
                'paid_at' => $booking->start_time,
                'stripe_payment_intent_id' => 'pi_demo_'.Str::random(16),
            ]);
        }

        // Pending payment
        Payment::create([
            'user_id' => $playerUsers[15]->id,
            'league_id' => $metroBasketball->id,
            'amount' => 150.00,
            'fee_amount' => 5.00,
            'net_amount' => 145.00,
            'currency' => 'USD',
            'type' => 'league_registration',
            'status' => 'pending',
            'payable_type' => 'App\\Models\\Team',
            'payable_id' => $teams->first()->id,
        ]);

        // Refunded payment
        Payment::create([
            'user_id' => $playerUsers[18]->id,
            'league_id' => $citySoccer->id,
            'amount' => 120.00,
            'fee_amount' => 5.00,
            'net_amount' => 115.00,
            'currency' => 'USD',
            'type' => 'league_registration',
            'status' => 'refunded',
            'payable_type' => 'App\\Models\\Team',
            'payable_id' => $teams->where('league_id', $citySoccer->id)->first()->id ?? $teams->first()->id,
            'paid_at' => now()->subWeeks(3),
            'refunded_at' => now()->subDays(5),
            'stripe_payment_intent_id' => 'pi_demo_'.Str::random(16),
        ]);

        // ─── Waivers ─────────────────────────────────────────────────
        $liabilityWaiver = Waiver::create([
            'league_id' => $metroBasketball->id,
            'title' => 'Liability Waiver and Release Form',
            'content' => "ASSUMPTION OF RISK AND WAIVER OF LIABILITY\n\nI, the undersigned, voluntarily agree to participate in sports activities organized by Metro Basketball League. I understand that participation in basketball and related activities carries inherent risks of injury, including but not limited to sprains, fractures, concussions, and other physical harm.\n\nI hereby release, waive, and discharge Metro Basketball League, its officers, employees, agents, and volunteers from any and all liability, claims, or demands for personal injury, death, or property damage arising from my participation.\n\nI confirm that I am physically fit and have no medical conditions that would prevent safe participation. I agree to follow all rules and guidelines set forth by the league.\n\nThis waiver shall be binding upon my heirs, executors, and assigns.",
            'is_required' => true,
            'is_active' => true,
            'version' => '2.0',
        ]);

        $codeOfConduct = Waiver::create([
            'league_id' => $metroBasketball->id,
            'title' => 'Player Code of Conduct Agreement',
            'content' => "PLAYER CODE OF CONDUCT\n\nAs a participant in the Metro Basketball League, I agree to:\n\n1. Treat all players, officials, and spectators with respect.\n2. Refrain from unsportsmanlike behavior, including taunting, trash talk, and intentional fouling.\n3. Arrive on time for all scheduled games and practices.\n4. Wear appropriate athletic attire and equipment.\n5. Report any injuries or safety concerns immediately.\n6. Accept referee decisions without excessive argument.\n7. Refrain from the use of alcohol or drugs before or during games.\n8. Maintain a positive and supportive team environment.\n\nViolation of this code may result in suspension or expulsion from the league without refund.",
            'is_required' => true,
            'is_active' => true,
            'version' => '1.0',
        ]);

        $soccerWaiver = Waiver::create([
            'league_id' => $citySoccer->id,
            'title' => 'Soccer League Liability Waiver',
            'content' => "CITY SOCCER UNITED - LIABILITY WAIVER\n\nI acknowledge the risks associated with participating in organized soccer activities and voluntarily assume all risks. I release City Soccer United and all affiliated parties from liability for injuries sustained during league play, practices, and events.",
            'is_required' => true,
            'is_active' => true,
        ]);

        // Waiver signatures — deduplicate by (waiver_id, user_id)
        $allApprovedTeamPlayers = TeamMember::whereIn('team_id', $teams->where('status', 'approved')->where('league_id', $metroBasketball->id)->pluck('id'))->get();
        $liabilitySignedUserIds = [];
        $conductSignedUserIds = [];
        foreach ($allApprovedTeamPlayers as $idx => $tm) {
            $player = Player::find($tm->player_id);
            if (! $player) {
                continue;
            }

            if ($idx % 5 !== 4 && ! in_array($player->user_id, $liabilitySignedUserIds)) {
                $liabilitySignedUserIds[] = $player->user_id;
                WaiverSignature::create([
                    'waiver_id' => $liabilityWaiver->id,
                    'user_id' => $player->user_id,
                    'signed_at' => now()->subWeeks(rand(1, 6)),
                    'ip_address' => '192.168.1.'.rand(10, 200),
                ]);
            }

            if ($idx % 2 === 0 && ! in_array($player->user_id, $conductSignedUserIds)) {
                $conductSignedUserIds[] = $player->user_id;
                WaiverSignature::create([
                    'waiver_id' => $codeOfConduct->id,
                    'user_id' => $player->user_id,
                    'signed_at' => now()->subWeeks(rand(1, 6)),
                    'ip_address' => '192.168.1.'.rand(10, 200),
                ]);
            }
        }

        // ─── League News ─────────────────────────────────────────────
        LeagueNews::create([
            'league_id' => $metroBasketball->id,
            'author_id' => $leagueAdmin->id,
            'title' => 'Season 1 Kicks Off This Week!',
            'content' => "We're thrilled to announce that the Metro Basketball League Season 1 officially begins this week! All approved teams have been notified of their schedules. Make sure to check your game times and court assignments.\n\nKey reminders:\n- All players must have signed waivers before their first game\n- Arrive 15 minutes before game time\n- Wear your team colors\n\nLet's have a great season!",
            'is_published' => true,
            'is_pinned' => true,
            'published_at' => now()->subDays(3),
        ]);

        LeagueNews::create([
            'league_id' => $metroBasketball->id,
            'author_id' => $leagueAdmin->id,
            'title' => 'New Referee Bidding System Now Available',
            'content' => "We've launched our new referee marketplace! Referees can now bid on games, and league admins can review and approve assignments. This ensures fair compensation and quality officiating for all games.\n\nReferees: check the available games section in your app to start bidding.",
            'is_published' => true,
            'is_pinned' => false,
            'published_at' => now()->subDays(7),
        ]);

        LeagueNews::create([
            'league_id' => $metroBasketball->id,
            'author_id' => $leagueAdmin->id,
            'title' => 'Summer Hoops Intensive - Registration Open',
            'content' => 'Registration is now open for our Summer Hoops Intensive camp! Five days of professional coaching, drills, and competitive scrimmages. Space is limited to 40 participants. Register through the app today.',
            'is_published' => true,
            'published_at' => now()->subDays(1),
        ]);

        LeagueNews::create([
            'league_id' => $metroBasketball->id,
            'author_id' => $leagueAdmin->id,
            'title' => 'Draft: Playoff Format Announcement',
            'content' => 'Top 4 teams will advance to single-elimination playoffs at the end of the regular season. Details to be confirmed.',
            'is_published' => false,
        ]);

        LeagueNews::create([
            'league_id' => $citySoccer->id,
            'author_id' => $leagueAdmin->id,
            'title' => 'Welcome to City Soccer United!',
            'content' => "Welcome to our spring season! All teams have been assigned to their divisions. Check the schedule for your first match. Remember to complete your waivers before game day.\n\nField conditions: Turf Field 1 is fully operational. Field 2 will be available starting next week.",
            'is_published' => true,
            'published_at' => now()->subDays(10),
        ]);

        // ─── Posts (Social Feed) ─────────────────────────────────────
        $post1 = Post::create([
            'user_id' => $playerUsers[0]->id,
            'league_id' => $metroBasketball->id,
            'content' => 'Just finished a great practice session with the Thunder Hawks! Our offense is clicking and we are ready for Saturday. Who else is excited for gameday?',
            'post_type' => 'post', 'visibility' => 'public',
            'likes_count' => 8, 'comments_count' => 3,
            'created_at' => now()->subDays(2),
        ]);

        $post2 = Post::create([
            'user_id' => $leagueAdmin->id,
            'league_id' => $metroBasketball->id,
            'content' => 'Congratulations to the Iron Eagles on their 4-game winning streak! They are looking like serious contenders this season. Full standings updated in the league section.',
            'post_type' => 'announcement', 'visibility' => 'public',
            'likes_count' => 15, 'comments_count' => 5,
            'created_at' => now()->subDays(1),
        ]);

        $post3 = Post::create([
            'user_id' => $playerUsers[4]->id,
            'team_id' => $teams->where('status', 'approved')->values()->get(1)?->id,
            'content' => 'Night Wolves practice schedule updated for next week. Check the team chat for details. Let\'s keep this energy going!',
            'post_type' => 'post', 'visibility' => 'team',
            'likes_count' => 4, 'comments_count' => 1,
        ]);

        // Post likes
        foreach ([$playerUsers[1], $playerUsers[3], $playerUsers[5], $playerUsers[7]] as $liker) {
            PostLike::create(['post_id' => $post1->id, 'user_id' => $liker->id]);
        }
        foreach ($playerUsers->take(10) as $liker) {
            PostLike::create(['post_id' => $post2->id, 'user_id' => $liker->id]);
        }

        // Comments
        Comment::create([
            'post_id' => $post1->id, 'user_id' => $playerUsers[1]->id,
            'content' => 'Let\'s gooo! Can\'t wait for Saturday!',
        ]);
        Comment::create([
            'post_id' => $post1->id, 'user_id' => $playerUsers[8]->id,
            'content' => 'Good luck to the Hawks! We\'ll be ready for you next week though.',
        ]);
        $parentComment = Comment::create([
            'post_id' => $post2->id, 'user_id' => $playerUsers[9]->id,
            'content' => 'They are playing amazing basketball right now. That defense is no joke.',
        ]);
        Comment::create([
            'post_id' => $post2->id, 'user_id' => $playerUsers[0]->id,
            'content' => 'Agreed! But we\'re coming for that streak next week.',
            'parent_id' => $parentComment->id,
        ]);

        // ─── Notifications ───────────────────────────────────────────
        $notificationData = [
            [$playerUsers[0]->id, 'game_reminder', 'Game Tomorrow', 'Thunder Hawks vs Night Wolves at Eastside Sports Complex, 7:00 PM', ['game_id' => $games->where('status', 'scheduled')->first()?->id]],
            [$playerUsers[0]->id, 'team_update', 'New Team Member', 'A new player has joined the Thunder Hawks roster.', null],
            [$playerUsers[4]->id, 'game_reminder', 'Game This Week', 'Night Wolves vs Iron Eagles at Eastside Sports Complex', null],
            [$leagueAdmin->id, 'team_application', 'New Team Application', 'Storm Breakers has applied to join the Metro Basketball League. Review their application.', ['team_id' => $teams->where('status', 'pending')->first()?->id]],
            [$leagueAdmin->id, 'payment_received', 'Payment Received', 'League registration payment of $150.00 received from James Rodriguez.', null],
            [$playerUsers[2]->id, 'waiver_reminder', 'Sign Your Waiver', 'Please sign the Liability Waiver before your first game to be eligible to play.', null],
            [$refereeUsers[0]->id, 'assignment_accepted', 'Assignment Confirmed', 'You have been confirmed as referee for Thunder Hawks vs Night Wolves.', null],
            [$playerUsers[12]->id, 'camp_registration', 'Camp Registration Confirmed', 'You are registered for the Summer Hoops Intensive starting next month.', null],
        ];
        foreach ($notificationData as [$userId, $type, $title, $message, $data]) {
            Notification::create([
                'user_id' => $userId, 'type' => $type, 'title' => $title, 'message' => $message,
                'data' => $data, 'channel' => 'in_app',
                'read_at' => rand(0, 1) ? now()->subHours(rand(1, 48)) : null,
                'created_at' => now()->subHours(rand(1, 72)),
            ]);
        }
    }
}
