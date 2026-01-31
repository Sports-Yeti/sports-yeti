<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\League;
use App\Models\LeagueAdmin;
use App\Models\LeagueNews;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeagueNewsControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $leagueAdminUser;
    private User $adminUser;
    private League $league;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles and permissions
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');

        Player::create([
            'user_id' => $this->user->id,
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
        ]);

        $this->leagueAdminUser = User::factory()->create();
        $this->leagueAdminUser->assignRole('league-admin');

        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('super-admin');

        $this->league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->leagueAdminUser->id,
            'sport' => 'basketball',
            'status' => 'active',
        ]);

        // Make leagueAdminUser an admin of this league
        LeagueAdmin::create([
            'league_id' => $this->league->id,
            'user_id' => $this->leagueAdminUser->id,
            'role' => 'admin',
        ]);
    }

    public function test_user_can_list_published_news(): void
    {
        LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Published News',
            'content' => 'Published content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Draft News',
            'content' => 'Draft content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/leagues/{$this->league->id}/news");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'content',
                        'is_published',
                        'author',
                    ],
                ],
                'meta',
            ]);

        // Regular users should only see published news
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_league_admin_can_see_all_news(): void
    {
        LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Published News',
            'content' => 'Published content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Draft News',
            'content' => 'Draft content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->getJson("/api/v1/leagues/{$this->league->id}/news");

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_league_admin_can_create_news(): void
    {
        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news", [
                'title' => 'New League Announcement',
                'content' => 'This is important news for the league.',
                'is_published' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'title',
                    'content',
                    'is_published',
                    'author',
                ],
            ]);

        $this->assertDatabaseHas('league_news', [
            'league_id' => $this->league->id,
            'title' => 'New League Announcement',
            'is_published' => true,
        ]);
    }

    public function test_regular_user_cannot_create_news(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news", [
                'title' => 'Unauthorized News',
                'content' => 'Should not be allowed.',
            ]);

        $response->assertStatus(403);
    }

    public function test_news_title_and_content_required(): void
    {
        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'content']);
    }

    public function test_user_can_view_published_news_details(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Published News',
            'content' => 'Published content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $news->id,
                    'title' => 'Published News',
                ],
            ]);
    }

    public function test_user_cannot_view_unpublished_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Draft News',
            'content' => 'Draft content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}");

        $response->assertStatus(404);
    }

    public function test_league_admin_can_view_unpublished_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Draft News',
            'content' => 'Draft content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->getJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}");

        $response->assertOk();
    }

    public function test_league_admin_can_update_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Original Title',
            'content' => 'Original content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->putJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}", [
                'title' => 'Updated Title',
                'content' => 'Updated content',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'title' => 'Updated Title',
                    'content' => 'Updated content',
                ],
            ]);

        $this->assertDatabaseHas('league_news', [
            'id' => $news->id,
            'title' => 'Updated Title',
        ]);
    }

    public function test_regular_user_cannot_update_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'News Title',
            'content' => 'News content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}", [
                'title' => 'Hacked Title',
            ]);

        $response->assertStatus(403);
    }

    public function test_league_admin_can_delete_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'News to delete',
            'content' => 'Content to delete',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->deleteJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('league_news', ['id' => $news->id]);
    }

    public function test_regular_user_cannot_delete_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'News Title',
            'content' => 'News content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}");

        $response->assertStatus(403);
    }

    public function test_league_admin_can_publish_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Draft News',
            'content' => 'Draft content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}/publish");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'is_published' => true,
                ],
            ]);

        $this->assertNotNull($news->fresh()->published_at);
    }

    public function test_cannot_publish_already_published_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Published News',
            'content' => 'Published content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}/publish");

        $response->assertStatus(409);
    }

    public function test_league_admin_can_unpublish_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Published News',
            'content' => 'Published content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}/unpublish");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'is_published' => false,
                ],
            ]);
    }

    public function test_cannot_unpublish_already_unpublished_news(): void
    {
        $news = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Draft News',
            'content' => 'Draft content',
            'is_published' => false,
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}/unpublish");

        $response->assertStatus(409);
    }

    public function test_pinned_news_appears_first(): void
    {
        LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Regular News',
            'content' => 'Regular content',
            'is_published' => true,
            'is_pinned' => false,
            'published_at' => now(),
        ]);

        $pinnedNews = LeagueNews::create([
            'league_id' => $this->league->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Pinned News',
            'content' => 'Pinned content',
            'is_published' => true,
            'is_pinned' => true,
            'published_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/leagues/{$this->league->id}/news");

        $response->assertOk();
        $data = $response->json('data');

        $this->assertEquals($pinnedNews->id, $data[0]['id']);
    }

    public function test_news_must_belong_to_correct_league(): void
    {
        $otherLeague = League::create([
            'name' => 'Other League',
            'admin_id' => $this->leagueAdminUser->id,
            'sport' => 'soccer',
            'status' => 'active',
        ]);

        $news = LeagueNews::create([
            'league_id' => $otherLeague->id,
            'author_id' => $this->leagueAdminUser->id,
            'title' => 'Other League News',
            'content' => 'Other league content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->actingAs($this->leagueAdminUser, 'api')
            ->getJson("/api/v1/leagues/{$this->league->id}/news/{$news->id}");

        $response->assertStatus(404);
    }

    public function test_super_admin_can_manage_any_league_news(): void
    {
        $response = $this->actingAs($this->adminUser, 'api')
            ->postJson("/api/v1/leagues/{$this->league->id}/news", [
                'title' => 'Super Admin News',
                'content' => 'Created by super admin.',
                'is_published' => true,
            ]);

        $response->assertStatus(201);
    }
}
