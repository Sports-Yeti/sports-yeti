<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Highlight;
use App\Models\HighlightClip;
use App\Models\League;
use App\Models\Payment;
use App\Models\Player;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HighlightControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('player');

        Player::create([
            'user_id' => $this->user->id,
            'experience_level' => 'intermediate',
            'availability_status' => 'available',
        ]);

        $this->otherUser = User::factory()->create();
        $this->otherUser->assignRole('player');

        Player::create([
            'user_id' => $this->otherUser->id,
            'experience_level' => 'beginner',
            'availability_status' => 'available',
        ]);
    }

    public function test_user_can_list_own_highlights(): void
    {
        Highlight::create([
            'user_id' => $this->user->id,
            'status' => 'completed',
            'source_video_path' => 'highlights/uploads/test.mp4',
            'completed_at' => now(),
        ]);

        Highlight::create([
            'user_id' => $this->otherUser->id,
            'status' => 'completed',
            'source_video_path' => 'highlights/uploads/other.mp4',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/highlights');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_user_can_view_own_highlight(): void
    {
        $highlight = Highlight::create([
            'user_id' => $this->user->id,
            'status' => 'completed',
            'source_video_path' => 'highlights/uploads/test.mp4',
            'analysis' => ['summary' => 'Great game!', 'highlights' => []],
            'completed_at' => now(),
        ]);

        HighlightClip::create([
            'highlight_id' => $highlight->id,
            'clip_path' => 'highlights/clips/clip_01.mp4',
            'title' => 'Amazing Goal',
            'description' => 'A spectacular goal.',
            'start_time' => 10.0,
            'end_time' => 18.0,
            'excitement_score' => 9,
            'sort_order' => 0,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/highlights/{$highlight->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $highlight->id)
            ->assertJsonPath('data.analysis.summary', 'Great game!')
            ->assertJsonCount(1, 'data.clips');
    }

    public function test_user_cannot_view_other_users_highlight(): void
    {
        $highlight = Highlight::create([
            'user_id' => $this->otherUser->id,
            'status' => 'completed',
            'source_video_path' => 'highlights/uploads/other.mp4',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/highlights/{$highlight->id}");

        $response->assertForbidden();
    }

    public function test_upload_video_validates_file_type(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/highlights/upload', ['video' => $file]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('video');
    }

    public function test_upload_video_succeeds_with_valid_file(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('game.mp4', 5120, 'video/mp4');

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/highlights/upload', ['video' => $file]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['video_path', 'price', 'currency'],
            ]);
    }

    public function test_generate_requires_completed_payment(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/highlights/generate', [
                'video_path' => 'highlights/uploads/test.mp4',
                'payment_intent_id' => 'pi_nonexistent',
            ]);

        $response->assertStatus(402);
    }

    public function test_generate_validates_video_path_exists(): void
    {
        Storage::fake('public');

        $payment = Payment::create([
            'user_id' => $this->user->id,
            'amount' => 1.99,
            'fee_amount' => 0.15,
            'net_amount' => 1.84,
            'type' => 'highlight_generation',
            'status' => 'completed',
            'stripe_payment_intent_id' => 'pi_test_123',
            'paid_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/highlights/generate', [
                'video_path' => 'highlights/uploads/nonexistent.mp4',
                'payment_intent_id' => 'pi_test_123',
            ]);

        $response->assertNotFound();
    }

    public function test_user_can_delete_own_highlight(): void
    {
        $highlight = Highlight::create([
            'user_id' => $this->user->id,
            'status' => 'completed',
            'source_video_path' => 'highlights/uploads/test.mp4',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/highlights/{$highlight->id}");

        $response->assertNoContent();
        $this->assertSoftDeleted('highlights', ['id' => $highlight->id]);
    }

    public function test_user_cannot_delete_other_users_highlight(): void
    {
        $highlight = Highlight::create([
            'user_id' => $this->otherUser->id,
            'status' => 'completed',
            'source_video_path' => 'highlights/uploads/other.mp4',
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/highlights/{$highlight->id}");

        $response->assertForbidden();
    }

    public function test_share_to_feed_creates_post(): void
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);

        Storage::fake('public');

        $highlight = Highlight::create([
            'user_id' => $this->user->id,
            'status' => 'completed',
            'source_video_path' => 'highlights/uploads/test.mp4',
            'analysis' => ['summary' => 'Exciting match!', 'highlights' => []],
            'completed_at' => now(),
        ]);

        $clip = HighlightClip::create([
            'highlight_id' => $highlight->id,
            'clip_path' => 'highlights/clips/clip_01.mp4',
            'title' => 'Winning Goal',
            'description' => 'The winning goal at 89th minute.',
            'start_time' => 80.0,
            'end_time' => 90.0,
            'excitement_score' => 10,
            'sort_order' => 0,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/highlights/{$highlight->id}/share", [
                'clip_ids' => [$clip->id],
                'caption' => 'What a game!',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.content', 'What a game!');

        $this->assertDatabaseHas('posts', [
            'user_id' => $this->user->id,
            'content' => 'What a game!',
        ]);

        $highlight->refresh();
        $this->assertNotNull($highlight->post_id);
    }

    public function test_share_requires_completed_highlight(): void
    {
        $highlight = Highlight::create([
            'user_id' => $this->user->id,
            'status' => 'processing',
            'source_video_path' => 'highlights/uploads/test.mp4',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/highlights/{$highlight->id}/share", [
                'clip_ids' => ['some-id'],
            ]);

        $response->assertBadRequest();
    }

    public function test_unauthenticated_user_cannot_access_highlights(): void
    {
        $response = $this->getJson('/api/v1/highlights');
        $response->assertUnauthorized();
    }
}
