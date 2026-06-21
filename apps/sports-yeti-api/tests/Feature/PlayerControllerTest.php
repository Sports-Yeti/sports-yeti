<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlayerControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private Player $player;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');

        $this->player = Player::create([
            'user_id' => $this->user->id,
            'bio' => 'Test bio',
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
            'is_private' => false,
            'position' => 'point_guard',
        ]);
    }

    public function test_user_can_list_public_players(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/players');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'user_id', 'experience_level'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_private_players_are_not_listed(): void
    {
        $privateUser = User::factory()->create();
        Player::create([
            'user_id' => $privateUser->id,
            'experience_level' => 'advanced',
            'availability_status' => 'available',
            'is_private' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/players');

        $response->assertOk();
        $data = $response->json('data');

        // Only the public player should be listed
        foreach ($data as $player) {
            $this->assertNotEquals($privateUser->id, $player['user_id']);
        }
    }

    public function test_user_can_filter_players_by_experience_level(): void
    {
        $advancedUser = User::factory()->create();
        Player::create([
            'user_id' => $advancedUser->id,
            'experience_level' => 'advanced',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/players?experience_level=advanced');

        $response->assertOk();
        $data = $response->json('data');

        foreach ($data as $player) {
            $this->assertEquals('advanced', $player['experience_level']);
        }
    }

    public function test_user_can_filter_players_by_availability(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/players?availability_status=available');

        $response->assertOk();
        $data = $response->json('data');

        foreach ($data as $player) {
            $this->assertEquals('available', $player['availability_status']);
        }
    }

    public function test_user_can_search_players_by_name(): void
    {
        $searchUser = User::factory()->create(['name' => 'Michael Jordan']);
        Player::create([
            'user_id' => $searchUser->id,
            'experience_level' => 'pro',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/players?search=Michael');

        $response->assertOk();
        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_user_can_get_own_profile(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/players/me');

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $this->player->id,
                    'user_id' => $this->user->id,
                    'bio' => 'Test bio',
                ],
            ]);
    }

    public function test_user_can_view_public_player_profile(): void
    {
        $otherUser = User::factory()->create();
        $otherPlayer = Player::create([
            'user_id' => $otherUser->id,
            'bio' => 'Other player bio',
            'experience_level' => 'advanced',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/players/{$otherPlayer->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $otherPlayer->id,
                    'bio' => 'Other player bio',
                ],
            ]);
    }

    public function test_user_cannot_view_private_player_profile(): void
    {
        $otherUser = User::factory()->create();
        $otherPlayer = Player::create([
            'user_id' => $otherUser->id,
            'experience_level' => 'advanced',
            'availability_status' => 'available',
            'is_private' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/players/{$otherPlayer->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_view_own_private_profile(): void
    {
        $this->player->update(['is_private' => true]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/players/{$this->player->id}");

        $response->assertOk();
    }

    public function test_user_can_update_own_profile(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/players/{$this->player->id}", [
                'bio' => 'Updated bio',
                'experience_level' => 'advanced',
                'position' => 'center',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'bio' => 'Updated bio',
                    'experience_level' => 'advanced',
                    'position' => 'center',
                ],
            ]);
    }

    public function test_user_cannot_update_other_players_profile(): void
    {
        $otherUser = User::factory()->create();
        $otherPlayer = Player::create([
            'user_id' => $otherUser->id,
            'experience_level' => 'beginner',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/players/{$otherPlayer->id}", [
                'bio' => 'Hacked bio',
            ]);

        $response->assertStatus(403);
    }

    public function test_update_validates_experience_level(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/players/{$this->player->id}", [
                'experience_level' => 'invalid_level',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['experience_level']);
    }

    public function test_update_validates_availability_status(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/players/{$this->player->id}", [
                'availability_status' => 'invalid_status',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['availability_status']);
    }

    public function test_user_can_toggle_privacy(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/players/{$this->player->id}", [
                'is_private' => true,
            ]);

        $response->assertOk();
        $this->assertTrue($this->player->fresh()->is_private);
    }

    public function test_unauthenticated_user_cannot_access_players(): void
    {
        $response = $this->getJson('/api/v1/players');
        $response->assertStatus(401);
    }
}
