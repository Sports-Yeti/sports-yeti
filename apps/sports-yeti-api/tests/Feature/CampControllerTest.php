<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Camp;
use App\Models\CampRegistration;
use App\Models\League;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CampControllerTest extends TestCase
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

    public function test_user_can_list_camps(): void
    {
        Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Summer Camp',
            'start_date' => now()->addDays(30),
            'end_date' => now()->addDays(37),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/camps');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'start_date', 'end_date', 'status'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_user_can_filter_camps_by_league(): void
    {
        Camp::create([
            'league_id' => $this->league->id,
            'name' => 'League Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        $otherLeague = League::create([
            'name' => 'Other League',
            'admin_id' => $this->user->id,
            'sport_type' => 'soccer',
            'is_active' => true,
        ]);

        Camp::create([
            'league_id' => $otherLeague->id,
            'name' => 'Other Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/camps?league_id={$this->league->id}");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('League Camp', $response->json('data.0.name'));
    }

    public function test_user_can_filter_camps_by_status(): void
    {
        Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Open Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Closed Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/camps?status=open');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_user_can_create_camp(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/camps', [
                'league_id' => $this->league->id,
                'name' => 'New Camp',
                'description' => 'A basketball training camp',
                'start_date' => now()->addDays(30)->format('Y-m-d'),
                'end_date' => now()->addDays(37)->format('Y-m-d'),
                'registration_fee' => 150.00,
                'max_participants' => 30,
                'skill_level' => 'intermediate',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'start_date', 'end_date', 'status'],
            ]);

        $this->assertDatabaseHas('camps', [
            'name' => 'New Camp',
            'league_id' => $this->league->id,
            'status' => 'draft',
        ]);
    }

    public function test_create_camp_requires_fields(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/camps', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['league_id', 'name', 'start_date', 'end_date']);
    }

    public function test_create_camp_validates_dates(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/camps', [
                'league_id' => $this->league->id,
                'name' => 'Camp',
                'start_date' => now()->subDays(5)->format('Y-m-d'),
                'end_date' => now()->subDays(1)->format('Y-m-d'),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    }

    public function test_user_can_view_camp(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Test Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/camps/{$camp->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $camp->id,
                    'name' => 'Test Camp',
                ],
            ]);
    }

    public function test_owner_can_update_camp(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Test Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/camps/{$camp->id}", [
                'name' => 'Updated Camp',
                'status' => 'open',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'name' => 'Updated Camp',
                ],
            ]);
    }

    public function test_owner_can_delete_camp(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Test Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/camps/{$camp->id}");

        $response->assertStatus(204);
    }

    public function test_player_can_register_for_open_camp(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Open Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'registration_fee' => 0,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/camps/{$camp->id}/register");

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'camp_id', 'player_id', 'payment_status'],
            ]);

        $this->assertDatabaseHas('camp_registrations', [
            'camp_id' => $camp->id,
            'player_id' => $this->player->id,
        ]);
    }

    public function test_player_cannot_register_for_closed_camp(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Closed Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/camps/{$camp->id}/register");

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'Registration is not open for this camp.',
            ]);
    }

    public function test_player_cannot_register_for_full_camp(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Full Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 1,
            'status' => 'open',
        ]);

        // Fill the camp
        $otherPlayer = Player::create([
            'user_id' => User::factory()->create()->id,
            'experience_level' => 'beginner',
            'availability_status' => 'available',
            'is_private' => false,
        ]);

        CampRegistration::create([
            'camp_id' => $camp->id,
            'player_id' => $otherPlayer->id,
            'payment_status' => 'waived',
            'attendance_status' => 'registered',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/camps/{$camp->id}/register");

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'This camp is full.',
            ]);
    }

    public function test_player_cannot_register_twice(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Open Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        CampRegistration::create([
            'camp_id' => $camp->id,
            'player_id' => $this->player->id,
            'payment_status' => 'waived',
            'attendance_status' => 'registered',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/camps/{$camp->id}/register");

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'You are already registered for this camp.',
            ]);
    }

    public function test_player_can_unregister_from_camp(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Open Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        CampRegistration::create([
            'camp_id' => $camp->id,
            'player_id' => $this->player->id,
            'payment_status' => 'waived',
            'attendance_status' => 'registered',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/camps/{$camp->id}/register");

        $response->assertStatus(204);

        $this->assertDatabaseHas('camp_registrations', [
            'camp_id' => $camp->id,
            'player_id' => $this->player->id,
            'attendance_status' => 'cancelled',
        ]);
    }

    public function test_unregister_returns_404_when_not_registered(): void
    {
        $camp = Camp::create([
            'league_id' => $this->league->id,
            'name' => 'Open Camp',
            'start_date' => now()->addDays(10),
            'end_date' => now()->addDays(15),
            'max_participants' => 50,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/camps/{$camp->id}/register");

        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_access_camps(): void
    {
        $response = $this->getJson('/api/v1/camps');
        $response->assertStatus(401);
    }
}
