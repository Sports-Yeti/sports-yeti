<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\League;
use App\Models\Player;
use App\Models\Post;
use App\Models\PostLike;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $adminUser;

    private League $league;

    private Team $team;

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

        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('super-admin');

        $this->league = League::create([
            'name' => 'Test League',
            'admin_id' => $this->adminUser->id,
            'sport_type' => 'basketball',
            'is_active' => true,
        ]);

        $this->team = Team::create([
            'league_id' => $this->league->id,
            'name' => 'Test Team',
            'captain_id' => $player->id,
            'status' => 'active',
        ]);
    }

    public function test_user_can_list_posts(): void
    {
        Post::create([
            'user_id' => $this->user->id,
            'content' => 'First test post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        Post::create([
            'user_id' => $this->user->id,
            'content' => 'Second test post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/posts');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'content',
                        'post_type',
                        'visibility',
                        'user',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                ],
            ]);

        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_user_can_filter_posts_by_league(): void
    {
        Post::create([
            'user_id' => $this->user->id,
            'league_id' => $this->league->id,
            'content' => 'League post',
            'post_type' => 'post',
            'visibility' => 'league',
        ]);

        Post::create([
            'user_id' => $this->user->id,
            'content' => 'Public post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/posts?league_id={$this->league->id}");

        $response->assertOk();
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_user_can_create_post(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/posts', [
                'content' => 'This is a new post',
                'post_type' => 'post',
                'visibility' => 'public',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'content',
                    'post_type',
                    'visibility',
                    'user',
                ],
            ]);

        $this->assertDatabaseHas('posts', [
            'user_id' => $this->user->id,
            'content' => 'This is a new post',
        ]);
    }

    public function test_user_can_create_post_with_media(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/posts', [
                'content' => 'Post with images',
                'media_urls' => [
                    'https://example.com/image1.jpg',
                    'https://example.com/image2.jpg',
                ],
            ]);

        $response->assertStatus(201);
        $this->assertCount(2, $response->json('data.media_urls'));
    }

    public function test_post_content_is_required(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/posts', [
                'post_type' => 'post',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_user_can_view_post_details(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Test post content',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/posts/{$post->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $post->id,
                    'content' => 'Test post content',
                ],
            ]);
    }

    public function test_user_can_update_own_post(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Original content',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/posts/{$post->id}", [
                'content' => 'Updated content',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'content' => 'Updated content',
                ],
            ]);

        $this->assertDatabaseHas('posts', [
            'id' => $post->id,
            'content' => 'Updated content',
        ]);
    }

    public function test_user_cannot_update_others_post(): void
    {
        $otherUser = User::factory()->create();

        $post = Post::create([
            'user_id' => $otherUser->id,
            'content' => 'Other user post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/posts/{$post->id}", [
                'content' => 'Hacked content',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_any_post(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Original content',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->adminUser, 'api')
            ->putJson("/api/v1/posts/{$post->id}", [
                'content' => 'Admin updated content',
            ]);

        $response->assertOk();
    }

    public function test_user_can_delete_own_post(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Post to delete',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('posts', ['id' => $post->id]);
    }

    public function test_user_cannot_delete_others_post(): void
    {
        $otherUser = User::factory()->create();

        $post = Post::create([
            'user_id' => $otherUser->id,
            'content' => 'Other user post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/posts/{$post->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_like_post(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Likeable post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/posts/{$post->id}/like");

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'liked' => true,
                    'likes_count' => 1,
                ],
            ]);

        $this->assertDatabaseHas('post_likes', [
            'post_id' => $post->id,
            'user_id' => $this->user->id,
        ]);
    }

    public function test_user_cannot_like_post_twice(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Likeable post',
            'post_type' => 'post',
            'visibility' => 'public',
            'likes_count' => 1,
        ]);

        PostLike::create([
            'post_id' => $post->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/posts/{$post->id}/like");

        $response->assertStatus(409);
    }

    public function test_user_can_unlike_post(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Unlikeable post',
            'post_type' => 'post',
            'visibility' => 'public',
            'likes_count' => 1,
        ]);

        PostLike::create([
            'post_id' => $post->id,
            'user_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/posts/{$post->id}/like");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'liked' => false,
                    'likes_count' => 0,
                ],
            ]);

        $this->assertDatabaseMissing('post_likes', [
            'post_id' => $post->id,
            'user_id' => $this->user->id,
        ]);
    }

    public function test_user_cannot_unlike_post_not_liked(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Not liked post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/posts/{$post->id}/like");

        $response->assertStatus(404);
    }

    public function test_user_can_get_post_comments(): void
    {
        $post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Post with comments',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        Comment::create([
            'post_id' => $post->id,
            'user_id' => $this->user->id,
            'content' => 'First comment',
        ]);

        Comment::create([
            'post_id' => $post->id,
            'user_id' => $this->user->id,
            'content' => 'Second comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/posts/{$post->id}/comments");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'content',
                        'user',
                    ],
                ],
                'meta',
            ]);

        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_pinned_posts_appear_first(): void
    {
        $regularPost = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Regular post',
            'post_type' => 'post',
            'visibility' => 'public',
            'is_pinned' => false,
        ]);

        $pinnedPost = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Pinned post',
            'post_type' => 'post',
            'visibility' => 'public',
            'is_pinned' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/posts');

        $response->assertOk();
        $data = $response->json('data');

        $this->assertEquals($pinnedPost->id, $data[0]['id']);
    }
}
