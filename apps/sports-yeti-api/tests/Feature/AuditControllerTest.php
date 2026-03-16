<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\League;
use App\Models\LeagueAdmin;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class AuditControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    public function test_super_admin_can_view_audit_logs(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create some activity by creating a league
        $league = League::factory()->create();

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit');

        $response->assertOk()
            ->assertJsonStructure([
                'data',
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);
    }

    public function test_league_admin_can_view_audit_logs(): void
    {
        $user = User::factory()->create();
        $user->assignRole('league-admin');

        $league = League::factory()->create();
        LeagueAdmin::create([
            'league_id' => $league->id,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);

        $response = $this->actingAs($user, 'api')
            ->withHeader('X-League-ID', $league->id)
            ->getJson('/api/v1/audit');

        $response->assertOk();
    }

    public function test_regular_player_cannot_view_audit_logs(): void
    {
        $player = User::factory()->create();
        $player->assignRole('player');

        $response = $this->actingAs($player, 'api')
            ->getJson('/api/v1/audit');

        $response->assertStatus(403);
    }

    public function test_audit_logs_can_be_filtered_by_event(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create activities
        $league = League::factory()->create();
        $team = Team::factory()->create(['league_id' => $league->id]);
        $team->update(['name' => 'Updated Name']);
        $team->delete();

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit?event=created');

        $response->assertOk();

        // All returned activities should be 'created' events
        $data = $response->json('data');
        foreach ($data as $activity) {
            $this->assertEquals('created', $activity['event']);
        }
    }

    public function test_audit_logs_can_be_filtered_by_subject_type(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create different types of activities
        $league = League::factory()->create();
        $team = Team::factory()->create(['league_id' => $league->id]);

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit?subject_type=team');

        $response->assertOk();

        // All returned activities should be for Team model
        $data = $response->json('data');
        foreach ($data as $activity) {
            $this->assertStringContainsString('Team', $activity['subject_type']);
        }
    }

    public function test_audit_logs_can_be_filtered_by_date_range(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create an activity
        League::factory()->create();

        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson("/api/v1/audit?date_from={$today}&date_to={$tomorrow}");

        $response->assertOk();
    }

    public function test_audit_logs_can_be_searched(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create an activity
        League::factory()->create(['name' => 'Unique Basketball League']);

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit?search=created');

        $response->assertOk();
    }

    public function test_can_view_single_audit_log(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create an activity
        League::factory()->create();

        $activity = Activity::first();

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson("/api/v1/audit/{$activity->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'log_name',
                    'description',
                    'event',
                    'subject_type',
                    'subject_id',
                    'causer_type',
                    'causer_id',
                    'properties',
                    'created_at',
                ],
            ]);
    }

    public function test_can_get_audit_stats(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create various activities
        $league = League::factory()->create();
        $team = Team::factory()->create(['league_id' => $league->id]);
        $team->update(['name' => 'Updated Name']);

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit/stats');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'total_events',
                    'events_by_type',
                    'events_by_subject',
                    'most_active_users',
                    'activity_timeline',
                ],
            ]);
    }

    public function test_can_get_subject_types(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create activities for different models
        $league = League::factory()->create();
        Team::factory()->create(['league_id' => $league->id]);

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit/subject-types');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'value',
                        'label',
                    ],
                ],
            ]);
    }

    public function test_audit_logs_pagination(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // Create many activities
        for ($i = 0; $i < 30; $i++) {
            League::factory()->create();
        }

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit?per_page=10');

        $response->assertOk()
            ->assertJsonPath('meta.per_page', 10);

        // Verify pagination is working (more than 1 page)
        $this->assertGreaterThan(1, $response->json('meta.last_page'));
    }

    public function test_validation_errors_for_invalid_filters(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit?event=invalid_event');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['event']);
    }

    public function test_date_validation_for_date_range(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        // date_to before date_from should fail
        $response = $this->actingAs($superAdmin, 'api')
            ->getJson('/api/v1/audit?date_from=2024-12-31&date_to=2024-01-01');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date_to']);
    }
}
