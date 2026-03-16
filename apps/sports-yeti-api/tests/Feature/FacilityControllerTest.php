<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Facility;
use App\Models\League;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FacilityControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private League $league;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');

        $this->league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->user->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);
    }

    public function test_user_can_list_facilities(): void
    {
        Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Test Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/facilities');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'city', 'state'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_user_can_filter_facilities_by_league(): void
    {
        Facility::create([
            'league_id' => $this->league->id,
            'name' => 'League Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        $otherLeague = League::create([
            'name' => 'Other League',
            'admin_id' => $this->user->id,
            'sport_type' => 'soccer',
            'is_active' => true,
        ]);

        Facility::create([
            'league_id' => $otherLeague->id,
            'name' => 'Other Facility',
            'address' => '456 Other St',
            'city' => 'Other City',
            'state' => 'OT',
            'zip_code' => '67890',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/facilities?league_id={$this->league->id}");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('League Facility', $response->json('data.0.name'));
    }

    public function test_user_can_filter_facilities_by_city(): void
    {
        Facility::create([
            'league_id' => $this->league->id,
            'name' => 'NYC Facility',
            'address' => '123 Broadway',
            'city' => 'New York',
            'state' => 'NY',
            'zip_code' => '10001',
            'status' => 'active',
        ]);

        Facility::create([
            'league_id' => $this->league->id,
            'name' => 'LA Facility',
            'address' => '456 Sunset Blvd',
            'city' => 'Los Angeles',
            'state' => 'CA',
            'zip_code' => '90001',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/facilities?city=New York');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_user_can_create_facility(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/facilities', [
                'league_id' => $this->league->id,
                'name' => 'New Facility',
                'address' => '789 New St',
                'city' => 'New City',
                'state' => 'NC',
                'zip_code' => '11111',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'address', 'city', 'state'],
            ]);

        $this->assertDatabaseHas('facilities', [
            'name' => 'New Facility',
            'league_id' => $this->league->id,
        ]);
    }

    public function test_create_facility_requires_fields(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/facilities', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['league_id', 'name', 'address', 'city', 'state', 'zip_code']);
    }

    public function test_create_facility_validates_league_exists(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/facilities', [
                'league_id' => '00000000-0000-0000-0000-000000000000',
                'name' => 'Facility',
                'address' => '123 St',
                'city' => 'City',
                'state' => 'ST',
                'zip_code' => '12345',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['league_id']);
    }

    public function test_user_can_view_facility(): void
    {
        $facility = Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Test Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/facilities/{$facility->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $facility->id,
                    'name' => 'Test Facility',
                ],
            ]);
    }

    public function test_facility_show_includes_spaces(): void
    {
        $facility = Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Test Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        \App\Models\Space::create([
            'facility_id' => $facility->id,
            'name' => 'Court 1',
            'sport_type' => 'basketball_court',
            'capacity' => 20,
            'hourly_rate' => 50.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/facilities/{$facility->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'spaces' => [
                        '*' => ['id', 'name', 'sport_type', 'capacity', 'hourly_rate'],
                    ],
                ],
            ]);
    }

    public function test_owner_can_update_facility(): void
    {
        $facility = Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Test Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/facilities/{$facility->id}", [
                'name' => 'Updated Facility',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'name' => 'Updated Facility',
                ],
            ]);
    }

    public function test_owner_can_delete_facility(): void
    {
        $facility = Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Test Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/facilities/{$facility->id}");

        $response->assertStatus(204);
    }

    public function test_inactive_facilities_are_not_listed(): void
    {
        Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Active Facility',
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'active',
        ]);

        Facility::create([
            'league_id' => $this->league->id,
            'name' => 'Inactive Facility',
            'address' => '456 Test St',
            'city' => 'Test City',
            'state' => 'TS',
            'zip_code' => '12345',
            'status' => 'inactive',
            'is_active' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/facilities');

        $response->assertOk();
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Active Facility', $data[0]['name']);
    }

    public function test_unauthenticated_user_cannot_access_facilities(): void
    {
        $response = $this->getJson('/api/v1/facilities');
        $response->assertStatus(401);
    }
}
