<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Player $player;

    private League $league;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');

        $this->player = Player::create([
            'user_id' => $this->user->id,
            'bio' => 'Test player',
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $this->league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);
    }

    public function test_user_can_list_teams(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/teams');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'league_id'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_user_can_filter_teams_by_league(): void
    {
        Team::create([
            'name' => 'Team A',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $otherLeague = League::create([
            'name' => 'Other League',
            'admin_id' => $this->user->id,
            'sport_type' => 'soccer',
            'is_active' => true,
        ]);

        Team::create([
            'name' => 'Team B',
            'league_id' => $otherLeague->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/teams?league_id={$this->league->id}");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Team A', $response->json('data.0.name'));
    }

    public function test_user_can_search_teams(): void
    {
        Team::create([
            'name' => 'Thunder Hawks',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        Team::create([
            'name' => 'Lightning Bolts',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/teams?search=Thunder');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_user_can_create_team(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/teams', [
                'name' => 'New Team',
                'league_id' => $this->league->id,
                'description' => 'A competitive team',
                'max_roster_size' => 12,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'league_id', 'captain_id'],
            ]);

        $this->assertDatabaseHas('teams', [
            'name' => 'New Team',
            'captain_id' => $this->player->id,
        ]);

        // Captain should be added as team member
        $teamId = $response->json('data.id');
        $this->assertDatabaseHas('team_members', [
            'team_id' => $teamId,
            'player_id' => $this->player->id,
            'role' => 'captain',
        ]);
    }

    public function test_create_team_requires_name_and_league(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/teams', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'league_id']);
    }

    public function test_create_team_requires_valid_league_id(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/teams', [
                'name' => 'Team',
                'league_id' => '00000000-0000-0000-0000-000000000000',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['league_id']);
    }

    public function test_user_can_view_team(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/teams/{$team->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $team->id,
                    'name' => 'Test Team',
                ],
            ]);
    }

    public function test_captain_can_update_team(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/teams/{$team->id}", [
                'name' => 'Updated Team',
                'description' => 'Updated description',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'name' => 'Updated Team',
                ],
            ]);
    }

    public function test_non_captain_cannot_update_team(): void
    {
        $otherUser = User::factory()->create();
        $otherUser->assignRole('player');
        $otherPlayer = Player::create([
            'user_id' => $otherUser->id,
            'experience_level' => 'beginner',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $otherPlayer->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/teams/{$team->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertStatus(403);
    }

    public function test_captain_can_add_member(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $newUser = User::factory()->create();
        $newPlayer = Player::create([
            'user_id' => $newUser->id,
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/teams/{$team->id}/members", [
                'player_id' => $newPlayer->id,
                'role' => 'player',
            ]);

        $response->assertOk();

        $this->assertDatabaseHas('team_members', [
            'team_id' => $team->id,
            'player_id' => $newPlayer->id,
            'role' => 'player',
        ]);
    }

    public function test_cannot_add_duplicate_member(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $newUser = User::factory()->create();
        $newPlayer = Player::create([
            'user_id' => $newUser->id,
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        // Add once
        TeamMember::create([
            'team_id' => $team->id,
            'player_id' => $newPlayer->id,
            'role' => 'player',
            'joined_at' => now(),
        ]);

        // Try to add again
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/teams/{$team->id}/members", [
                'player_id' => $newPlayer->id,
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'Player is already a member of this team.',
            ]);
    }

    public function test_cannot_exceed_roster_limit(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 2,
        ]);

        // Add captain as member
        TeamMember::create([
            'team_id' => $team->id,
            'player_id' => $this->player->id,
            'role' => 'captain',
            'joined_at' => now(),
        ]);

        // Add second member
        $player2 = Player::create([
            'user_id' => User::factory()->create()->id,
            'experience_level' => 'beginner',
            'availability_status' => 'available',
            'is_private' => false,
        ]);
        TeamMember::create([
            'team_id' => $team->id,
            'player_id' => $player2->id,
            'role' => 'player',
            'joined_at' => now(),
        ]);

        // Try to add third member — should fail
        $player3 = Player::create([
            'user_id' => User::factory()->create()->id,
            'experience_level' => 'beginner',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/teams/{$team->id}/members", [
                'player_id' => $player3->id,
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'Team roster is full.',
            ]);
    }

    public function test_captain_can_remove_member(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $memberUser = User::factory()->create();
        $memberPlayer = Player::create([
            'user_id' => $memberUser->id,
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        TeamMember::create([
            'team_id' => $team->id,
            'player_id' => $memberPlayer->id,
            'role' => 'player',
            'joined_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/teams/{$team->id}/members/{$memberPlayer->id}");

        $response->assertStatus(204);

        $this->assertSoftDeleted('team_members', [
            'team_id' => $team->id,
            'player_id' => $memberPlayer->id,
        ]);
    }

    public function test_cannot_remove_captain(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/teams/{$team->id}/members/{$this->player->id}");

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'Cannot remove the team captain.',
            ]);
    }

    public function test_captain_can_delete_team(): void
    {
        $team = Team::create([
            'name' => 'Test Team',
            'league_id' => $this->league->id,
            'captain_id' => $this->player->id,
            'status' => 'active',
            'max_roster_size' => 15,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/teams/{$team->id}");

        $response->assertStatus(204);
    }

    public function test_unauthenticated_user_cannot_access_teams(): void
    {
        $response = $this->getJson('/api/v1/teams');
        $response->assertStatus(401);
    }
}
