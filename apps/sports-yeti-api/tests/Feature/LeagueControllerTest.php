<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\League;
use App\Models\Team;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeagueControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');
    }

    public function test_user_can_list_leagues(): void
    {
        League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/leagues');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'sport_type'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_user_can_filter_leagues_by_sport_type(): void
    {
        League::create([
            'name' => 'Basketball League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        League::create([
            'name' => 'Soccer League',
            'admin_id' => $this->user->id,
            'sport_type' => 'soccer',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/leagues?sport_type=basketball');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Basketball League', $data[0]['name']);
    }

    public function test_user_can_create_league(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/leagues', [
                'name' => 'New League',
                'description' => 'A new basketball league',
                'sport_type' => 'basketball',
                'location' => 'New York, NY',
                'registration_fee' => 100.00,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'sport_type', 'location'],
            ]);

        $this->assertDatabaseHas('leagues', [
            'name' => 'New League',
            'admin_id' => $this->user->id,
        ]);

        // Verify league admin record was created
        $this->assertDatabaseHas('league_admins', [
            'user_id' => $this->user->id,
            'role' => 'owner',
        ]);
    }

    public function test_create_league_requires_name(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/leagues', [
                'sport_type' => 'basketball',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_user_can_view_league(): void
    {
        $league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/leagues/{$league->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $league->id,
                    'name' => 'Test League',
                ],
            ]);
    }

    public function test_league_owner_can_update_league(): void
    {
        $league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/leagues/{$league->id}", [
                'name' => 'Updated League Name',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'name' => 'Updated League Name',
                ],
            ]);
    }

    public function test_non_owner_cannot_update_league(): void
    {
        $otherUser = User::factory()->create();
        $otherUser->assignRole('player');

        $league = League::create([
            'name' => 'Test League',
            'admin_id' => $otherUser->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/leagues/{$league->id}", [
                'name' => 'Hacked Name',
            ]);

        $response->assertStatus(403);
    }

    public function test_league_owner_can_delete_league(): void
    {
        $league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/leagues/{$league->id}");

        $response->assertStatus(204);
    }

    public function test_non_owner_cannot_delete_league(): void
    {
        $otherUser = User::factory()->create();

        $league = League::create([
            'name' => 'Test League',
            'admin_id' => $otherUser->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/leagues/{$league->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_get_league_stats(): void
    {
        $league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/leagues/{$league->id}/stats");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'teams_count',
                    'players_count',
                    'facilities_count',
                    'camps_count',
                    'games_count',
                    'completed_games',
                    'upcoming_games',
                ],
            ]);
    }

    public function test_inactive_leagues_are_not_listed(): void
    {
        League::create([
            'name' => 'Active League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        League::create([
            'name' => 'Inactive League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/leagues');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Active League', $data[0]['name']);
    }

    public function test_unauthenticated_user_cannot_access_leagues(): void
    {
        $response = $this->getJson('/api/v1/leagues');
        $response->assertStatus(401);
    }

    public function test_league_list_supports_pagination(): void
    {
        for ($i = 0; $i < 20; $i++) {
            League::create([
                'name' => "League {$i}",
                'admin_id' => $this->user->id,
                'sport_type' => 'basketball',
                'is_active' => true,
            ]);
        }

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/leagues?per_page=5');

        $response->assertOk();
        $this->assertCount(5, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
        $this->assertEquals(4, $response->json('meta.last_page'));
    }
}
