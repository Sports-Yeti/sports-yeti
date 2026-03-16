<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Facility;
use App\Models\Game;
use App\Models\GameParticipant;
use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GameControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $captainUser;

    private League $league;

    private Team $homeTeam;

    private Team $awayTeam;

    private Facility $facility;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');

        $player = Player::create([
            'user_id' => $this->user->id,
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
        ]);

        $this->captainUser = User::factory()->create();
        $this->captainUser->assignRole('team-captain');

        $captainPlayer = Player::create([
            'user_id' => $this->captainUser->id,
            'experience_level' => 'advanced',
            'availability_status' => 'available',
        ]);

        $adminUser = User::factory()->create();
        $adminUser->assignRole('league-admin');

        $this->league = League::create([
            'name' => 'Test Basketball League',
            'admin_id' => $adminUser->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $this->homeTeam = Team::create([
            'league_id' => $this->league->id,
            'name' => 'Home Team',
            'captain_id' => $captainPlayer->id,
            'status' => 'active',
        ]);

        $awayCaptainUser = User::factory()->create();
        $awayCaptainUser->assignRole('team-captain');
        $awayCaptainPlayer = Player::create([
            'user_id' => $awayCaptainUser->id,
            'experience_level' => 'advanced',
            'availability_status' => 'available',
        ]);

        $this->awayTeam = Team::create([
            'league_id' => $this->league->id,
            'name' => 'Away Team',
            'captain_id' => $awayCaptainPlayer->id,
            'status' => 'active',
        ]);

        $this->facility = Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Test Arena',
            'address' => '123 Sports St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);
    }

    public function test_user_can_list_games(): void
    {
        Game::create([
            'league_id' => $this->league->id,
            'team1_id' => $this->homeTeam->id,
            'team2_id' => $this->awayTeam->id,
            'facility_id' => $this->facility->id,
            'scheduled_at' => now()->addDays(7),
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/games');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'scheduled_at',
                        'status',
                        'team1',
                        'team2',
                    ],
                ],
            ]);
    }

    public function test_user_can_view_game_details(): void
    {
        $game = Game::create([
            'league_id' => $this->league->id,
            'team1_id' => $this->homeTeam->id,
            'team2_id' => $this->awayTeam->id,
            'facility_id' => $this->facility->id,
            'scheduled_at' => now()->addDays(7),
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/games/{$game->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $game->id,
                    'status' => 'scheduled',
                ],
            ]);
    }

    public function test_captain_can_create_game(): void
    {
        $scheduledAt = now()->addDays(14)->format('Y-m-d H:i:s');

        $response = $this->actingAs($this->captainUser, 'api')
            ->postJson('/api/v1/games', [
                'league_id' => $this->league->id,
                'team1_id' => $this->homeTeam->id,
                'team2_id' => $this->awayTeam->id,
                'facility_id' => $this->facility->id,
                'scheduled_at' => $scheduledAt,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'scheduled_at',
                    'status',
                ],
            ]);

        $this->assertDatabaseHas('games', [
            'team1_id' => $this->homeTeam->id,
            'team2_id' => $this->awayTeam->id,
        ]);
    }

    public function test_game_requires_different_home_and_away_teams(): void
    {
        $response = $this->actingAs($this->captainUser, 'api')
            ->postJson('/api/v1/games', [
                'league_id' => $this->league->id,
                'team1_id' => $this->homeTeam->id,
                'team2_id' => $this->homeTeam->id, // Same as home team
                'facility_id' => $this->facility->id,
                'scheduled_at' => now()->addDays(14)->format('Y-m-d H:i:s'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['team2_id']);
    }

    public function test_player_can_respond_to_attendance(): void
    {
        $game = Game::create([
            'league_id' => $this->league->id,
            'team1_id' => $this->homeTeam->id,
            'team2_id' => $this->awayTeam->id,
            'facility_id' => $this->facility->id,
            'scheduled_at' => now()->addDays(7),
            'status' => 'scheduled',
        ]);

        $player = $this->user->player;

        GameParticipant::create([
            'game_id' => $game->id,
            'player_id' => $player->id,
            'team_id' => $this->homeTeam->id,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/games/{$game->id}/attendance", [
                'response' => 'yes',
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('game_participants', [
            'game_id' => $game->id,
            'player_id' => $player->id,
            'attendance_response' => 'yes',
        ]);
    }

    public function test_attendance_response_must_be_valid(): void
    {
        $game = Game::create([
            'league_id' => $this->league->id,
            'team1_id' => $this->homeTeam->id,
            'team2_id' => $this->awayTeam->id,
            'facility_id' => $this->facility->id,
            'scheduled_at' => now()->addDays(7),
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/games/{$game->id}/attendance", [
                'response' => 'invalid_response',
            ]);

        $response->assertStatus(422);
    }

    public function test_games_can_be_filtered_by_status(): void
    {
        Game::create([
            'league_id' => $this->league->id,
            'team1_id' => $this->homeTeam->id,
            'team2_id' => $this->awayTeam->id,
            'facility_id' => $this->facility->id,
            'scheduled_at' => now()->addDays(7),
            'status' => 'scheduled',
        ]);

        Game::create([
            'league_id' => $this->league->id,
            'team1_id' => $this->homeTeam->id,
            'team2_id' => $this->awayTeam->id,
            'facility_id' => $this->facility->id,
            'scheduled_at' => now()->subDays(7),
            'status' => 'completed',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/games?status=scheduled');

        $response->assertOk();

        $games = $response->json('data');
        $this->assertTrue(collect($games)->every(fn ($g) => $g['status'] === 'scheduled'));
    }

    public function test_game_requires_future_scheduled_time(): void
    {
        $response = $this->actingAs($this->captainUser, 'api')
            ->postJson('/api/v1/games', [
                'league_id' => $this->league->id,
                'team1_id' => $this->homeTeam->id,
                'team2_id' => $this->awayTeam->id,
                'facility_id' => $this->facility->id,
                'scheduled_at' => now()->subDay()->format('Y-m-d H:i:s'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['scheduled_at']);
    }
}
