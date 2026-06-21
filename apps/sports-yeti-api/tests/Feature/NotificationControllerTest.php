<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationControllerTest extends TestCase
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

    public function test_user_can_list_notifications(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Game Tomorrow',
            'message' => 'You have a game tomorrow at 7pm.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/notifications');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'type', 'title', 'message'],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'unread_count',
                ],
            ]);
    }

    public function test_user_only_sees_own_notifications(): void
    {
        $otherUser = User::factory()->create();

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'My Notification',
            'message' => 'This is mine.',
        ]);

        Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'game_reminder',
            'title' => 'Other Notification',
            'message' => 'This is theirs.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/notifications');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('My Notification', $response->json('data.0.title'));
    }

    public function test_user_can_filter_unread_notifications(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Unread',
            'message' => 'Unread notification.',
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'payment',
            'title' => 'Read',
            'message' => 'Already read.',
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/notifications?unread=1');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Unread', $response->json('data.0.title'));
    }

    public function test_user_can_filter_by_type(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Game',
            'message' => 'Game reminder.',
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'payment',
            'title' => 'Payment',
            'message' => 'Payment received.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/notifications?type=payment');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Payment', $response->json('data.0.title'));
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Unread',
            'message' => 'Mark me read.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_other_users_notification_as_read(): void
    {
        $otherUser = User::factory()->create();

        $notification = Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'game_reminder',
            'title' => 'Not mine',
            'message' => 'Not my notification.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(403);
    }

    public function test_user_can_mark_all_as_read(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Notification 1',
            'message' => 'Message 1.',
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'payment',
            'title' => 'Notification 2',
            'message' => 'Message 2.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson('/api/v1/notifications/mark-all-read');

        $response->assertOk();

        $unreadCount = Notification::where('user_id', $this->user->id)
            ->whereNull('read_at')
            ->count();
        $this->assertEquals(0, $unreadCount);
    }

    public function test_user_can_delete_notification(): void
    {
        $notification = Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Delete me',
            'message' => 'To be deleted.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_user_cannot_delete_other_users_notification(): void
    {
        $otherUser = User::factory()->create();

        $notification = Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'game_reminder',
            'title' => 'Not mine',
            'message' => 'Not my notification.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertStatus(403);
    }

    public function test_user_can_clear_all_notifications(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Notification 1',
            'message' => 'Message 1.',
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'payment',
            'title' => 'Notification 2',
            'message' => 'Message 2.',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson('/api/v1/notifications/clear');

        $response->assertOk();

        $count = Notification::where('user_id', $this->user->id)->count();
        $this->assertEquals(0, $count);
    }

    public function test_user_can_update_push_token(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson('/api/v1/notifications/push-token', [
                'expo_push_token' => 'ExponentPushToken[xxxxxxxxxxxxxx]',
            ]);

        $response->assertOk();

        $this->assertEquals(
            'ExponentPushToken[xxxxxxxxxxxxxx]',
            $this->user->fresh()->expo_push_token
        );
    }

    public function test_push_token_requires_value(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson('/api/v1/notifications/push-token', []);

        $response->assertStatus(422);
    }

    public function test_user_can_update_preferences(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson('/api/v1/notifications/preferences', [
                'preferences' => [
                    'game_reminders' => true,
                    'payment_confirmations' => true,
                    'chat_messages' => false,
                    'push_notifications' => true,
                ],
            ]);

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'game_reminders' => true,
                    'chat_messages' => false,
                ],
            ]);
    }

    public function test_update_preferences_requires_array(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->putJson('/api/v1/notifications/preferences', []);

        $response->assertStatus(422);
    }

    public function test_meta_includes_unread_count(): void
    {
        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Unread 1',
            'message' => 'Unread.',
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'game_reminder',
            'title' => 'Unread 2',
            'message' => 'Also unread.',
        ]);

        Notification::create([
            'user_id' => $this->user->id,
            'type' => 'payment',
            'title' => 'Read',
            'message' => 'Already read.',
            'read_at' => now(),
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson('/api/v1/notifications');

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.unread_count'));
    }

    public function test_unauthenticated_user_cannot_access_notifications(): void
    {
        $response = $this->getJson('/api/v1/notifications');
        $response->assertStatus(401);
    }
}
