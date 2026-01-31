<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\League;
use App\Models\LeagueAdmin;
use App\Models\Player;
use App\Models\Team;
use App\Models\User;
use App\Scopes\TenantScope;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantScopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
    }

    protected function tearDown(): void
    {
        // Clear tenant context after each test
        if (app()->bound('current_league_id')) {
            app()->forgetInstance('current_league_id');
        }
        if (app()->bound('current_league')) {
            app()->forgetInstance('current_league');
        }
        
        parent::tearDown();
    }

    public function test_tenant_scope_filters_teams_by_league_id(): void
    {
        // Create two leagues with teams
        $league1 = League::factory()->create();
        $league2 = League::factory()->create();

        $team1 = Team::factory()->create(['league_id' => $league1->id]);
        $team2 = Team::factory()->create(['league_id' => $league1->id]);
        $team3 = Team::factory()->create(['league_id' => $league2->id]);

        // Without tenant scope, should see all teams
        $this->assertCount(3, Team::withoutGlobalScope(TenantScope::class)->get());

        // Set tenant context to league1
        app()->instance('current_league_id', $league1->id);

        // With tenant scope, should only see league1's teams
        $teams = Team::all();
        $this->assertCount(2, $teams);
        $this->assertTrue($teams->contains($team1));
        $this->assertTrue($teams->contains($team2));
        $this->assertFalse($teams->contains($team3));
    }

    public function test_tenant_middleware_sets_league_from_header_on_audit_route(): void
    {
        $user = User::factory()->create();
        $league = League::factory()->create();

        // Make user a league admin so they have access
        LeagueAdmin::create([
            'league_id' => $league->id,
            'user_id' => $user->id,
            'role' => 'admin',
        ]);
        $user->assignRole('league-admin');

        // The audit route uses the tenant middleware
        $response = $this->actingAs($user, 'api')
            ->withHeader('X-League-ID', $league->id)
            ->getJson('/api/v1/audit');

        $response->assertOk();
    }

    public function test_tenant_middleware_rejects_invalid_league_id(): void
    {
        $user = User::factory()->create();
        $user->assignRole('league-admin');

        // The audit route uses the tenant middleware
        $response = $this->actingAs($user, 'api')
            ->withHeader('X-League-ID', 'non-existent-league-id')
            ->getJson('/api/v1/audit');

        $response->assertStatus(404)
            ->assertJson([
                'title' => 'League Not Found',
            ]);
    }

    public function test_tenant_middleware_allows_super_admin_access_to_any_league(): void
    {
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole('super-admin');

        $league = League::factory()->create();

        $response = $this->actingAs($superAdmin, 'api')
            ->withHeader('X-League-ID', $league->id)
            ->getJson('/api/v1/audit');

        $response->assertOk();
    }

    public function test_tenant_middleware_denies_access_to_private_league(): void
    {
        $user = User::factory()->create();
        $user->assignRole('league-admin');

        // Create a private league
        $league = League::factory()->create([
            'settings' => ['private' => true],
        ]);

        $response = $this->actingAs($user, 'api')
            ->withHeader('X-League-ID', $league->id)
            ->getJson('/api/v1/audit');

        $response->assertStatus(403)
            ->assertJson([
                'title' => 'Access Denied',
            ]);
    }

    public function test_tenant_middleware_allows_league_admin_access(): void
    {
        $user = User::factory()->create();
        $user->assignRole('league-admin');

        $league = League::factory()->create([
            'settings' => ['private' => true],
        ]);

        // Create league admin role for this user
        LeagueAdmin::create([
            'league_id' => $league->id,
            'user_id' => $user->id,
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user, 'api')
            ->withHeader('X-League-ID', $league->id)
            ->getJson('/api/v1/audit');

        $response->assertOk();
    }

    public function test_scope_for_league_method_works(): void
    {
        $league1 = League::factory()->create();
        $league2 = League::factory()->create();

        Team::factory()->create(['league_id' => $league1->id]);
        Team::factory()->create(['league_id' => $league2->id]);

        // Use scopeForLeague to filter
        $teams = Team::withoutGlobalScope(TenantScope::class)
            ->forLeague($league1->id)
            ->get();

        $this->assertCount(1, $teams);
        $this->assertEquals($league1->id, $teams->first()->league_id);
    }

    public function test_without_tenant_scope_method_works(): void
    {
        $league1 = League::factory()->create();
        $league2 = League::factory()->create();

        Team::factory()->create(['league_id' => $league1->id]);
        Team::factory()->create(['league_id' => $league2->id]);

        // Set tenant context
        app()->instance('current_league_id', $league1->id);

        // With tenant scope, should see only 1 team
        $this->assertCount(1, Team::all());

        // Without tenant scope, should see all teams
        $teams = Team::withoutTenantScope()->get();
        $this->assertCount(2, $teams);
    }

    public function test_tenant_auto_assigns_league_id_on_create(): void
    {
        $league = League::factory()->create();
        $player = Player::factory()->create();
        
        // Set tenant context
        app()->instance('current_league_id', $league->id);

        // Create team without explicitly setting league_id
        $team = Team::withoutGlobalScope(TenantScope::class)->create([
            'name' => 'Test Team',
            'captain_id' => $player->id,
            'status' => 'active',
        ]);

        $this->assertEquals($league->id, $team->league_id);
    }
}
