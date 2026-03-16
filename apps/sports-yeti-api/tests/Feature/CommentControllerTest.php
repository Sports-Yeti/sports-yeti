<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Player;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $adminUser;

    private Post $post;

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

        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('super-admin');

        $this->post = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Test post for comments',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);
    }

    public function test_user_can_list_comments(): void
    {
        Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'First comment',
        ]);

        Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Second comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/comments?post_id={$this->post->id}");

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

    public function test_list_comments_requires_post_id(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/comments');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['post_id']);
    }

    public function test_user_can_create_comment(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/comments', [
                'post_id' => $this->post->id,
                'content' => 'This is a comment',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'content',
                    'user',
                ],
            ]);

        $this->assertDatabaseHas('comments', [
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'This is a comment',
        ]);

        // Check post comment count increased
        $this->assertEquals(1, $this->post->fresh()->comments_count);
    }

    public function test_user_can_reply_to_comment(): void
    {
        $parentComment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Parent comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/comments', [
                'post_id' => $this->post->id,
                'parent_id' => $parentComment->id,
                'content' => 'This is a reply',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('comments', [
            'post_id' => $this->post->id,
            'parent_id' => $parentComment->id,
            'content' => 'This is a reply',
        ]);
    }

    public function test_cannot_reply_to_reply(): void
    {
        $parentComment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Parent comment',
        ]);

        $replyComment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'parent_id' => $parentComment->id,
            'content' => 'Reply comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/comments', [
                'post_id' => $this->post->id,
                'parent_id' => $replyComment->id,
                'content' => 'Nested reply',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_parent_comment_must_belong_to_same_post(): void
    {
        $otherPost = Post::create([
            'user_id' => $this->user->id,
            'content' => 'Other post',
            'post_type' => 'post',
            'visibility' => 'public',
        ]);

        $parentComment = Comment::create([
            'post_id' => $otherPost->id,
            'user_id' => $this->user->id,
            'content' => 'Comment on other post',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/comments', [
                'post_id' => $this->post->id,
                'parent_id' => $parentComment->id,
                'content' => 'Invalid reply',
            ]);

        $response->assertStatus(422);
    }

    public function test_comment_content_is_required(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/comments', [
                'post_id' => $this->post->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_user_can_view_comment_details(): void
    {
        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Test comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/comments/{$comment->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $comment->id,
                    'content' => 'Test comment',
                ],
            ]);
    }

    public function test_user_can_update_own_comment(): void
    {
        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Original comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/comments/{$comment->id}", [
                'content' => 'Updated comment',
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'content' => 'Updated comment',
                ],
            ]);

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'content' => 'Updated comment',
        ]);
    }

    public function test_user_cannot_update_others_comment(): void
    {
        $otherUser = User::factory()->create();

        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $otherUser->id,
            'content' => 'Other user comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->putJson("/api/v1/comments/{$comment->id}", [
                'content' => 'Hacked comment',
            ]);

        $response->assertStatus(403);
    }

    public function test_user_can_delete_own_comment(): void
    {
        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Comment to delete',
        ]);

        // Manually increment the comments_count
        $this->post->increment('comments_count');

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('comments', ['id' => $comment->id]);

        // Check post comment count decreased
        $this->assertEquals(0, $this->post->fresh()->comments_count);
    }

    public function test_user_cannot_delete_others_comment(): void
    {
        $otherUser = User::factory()->create();

        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $otherUser->id,
            'content' => 'Other user comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_delete_any_comment(): void
    {
        $comment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'User comment',
        ]);

        $response = $this->actingAs($this->adminUser, 'api')
            ->deleteJson("/api/v1/comments/{$comment->id}");

        $response->assertStatus(204);
    }

    public function test_user_can_get_comment_replies(): void
    {
        $parentComment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Parent comment',
        ]);

        Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'parent_id' => $parentComment->id,
            'content' => 'First reply',
        ]);

        Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'parent_id' => $parentComment->id,
            'content' => 'Second reply',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/comments/{$parentComment->id}/replies");

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

    public function test_cannot_get_replies_for_reply_comment(): void
    {
        $parentComment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'content' => 'Parent comment',
        ]);

        $replyComment = Comment::create([
            'post_id' => $this->post->id,
            'user_id' => $this->user->id,
            'parent_id' => $parentComment->id,
            'content' => 'Reply comment',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/comments/{$replyComment->id}/replies");

        $response->assertStatus(400);
    }
}
