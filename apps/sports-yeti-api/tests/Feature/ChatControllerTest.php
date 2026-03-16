<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatPoll;
use App\Models\ChatPollVote;
use App\Models\League;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private League $league;
    private Chat $chat;

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

        $this->chat = Chat::create([
            'league_id' => $this->league->id,
            'type' => 'league',
            'name' => 'Test Chat',
            'is_active' => true,
        ]);
    }

    public function test_user_can_view_chat(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/chats/{$this->chat->id}");

        $response->assertOk()
            ->assertJson([
                'data' => [
                    'id' => $this->chat->id,
                    'name' => 'Test Chat',
                ],
            ]);
    }

    public function test_user_can_list_messages(): void
    {
        ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Hello world!',
            'message_type' => 'text',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/chats/{$this->chat->id}/messages");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'chat_id', 'user_id', 'message', 'message_type'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_user_can_send_message(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/messages", [
                'message' => 'Hello from test!',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'chat_id', 'user_id', 'message', 'message_type'],
            ]);

        $this->assertDatabaseHas('chat_messages', [
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Hello from test!',
        ]);
    }

    public function test_send_message_requires_content(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/messages", []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_message_max_length_enforced(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/messages", [
                'message' => str_repeat('a', 2001),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_user_can_send_reply(): void
    {
        $original = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Original message',
            'message_type' => 'text',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/messages", [
                'message' => 'Reply message',
                'reply_to_id' => $original->id,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('chat_messages', [
            'message' => 'Reply message',
            'reply_to_id' => $original->id,
        ]);
    }

    public function test_user_can_delete_own_message(): void
    {
        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'To be deleted',
            'message_type' => 'text',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/chats/{$this->chat->id}/messages/{$message->id}");

        $response->assertStatus(204);
    }

    public function test_user_cannot_delete_other_users_message(): void
    {
        $otherUser = User::factory()->create();

        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $otherUser->id,
            'message' => 'Other user message',
            'message_type' => 'text',
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->deleteJson("/api/v1/chats/{$this->chat->id}/messages/{$message->id}");

        $response->assertStatus(403);
    }

    // Poll Tests

    public function test_user_can_create_poll(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls", [
                'question' => 'Who is attending Saturday?',
                'options' => ['Yes', 'No', 'Maybe'],
                'poll_type' => 'attendance',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'message' => ['id', 'message_type'],
                    'poll' => ['id', 'question', 'options'],
                ],
            ]);

        $this->assertDatabaseHas('chat_polls', [
            'chat_id' => $this->chat->id,
            'question' => 'Who is attending Saturday?',
        ]);
    }

    public function test_create_poll_requires_minimum_options(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls", [
                'question' => 'Bad poll',
                'options' => ['Only one'],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['options']);
    }

    public function test_create_poll_requires_question(): void
    {
        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls", [
                'options' => ['Yes', 'No'],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['question']);
    }

    public function test_user_can_vote_on_poll(): void
    {
        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Poll question',
            'message_type' => 'poll',
        ]);

        $poll = ChatPoll::create([
            'chat_id' => $this->chat->id,
            'message_id' => $message->id,
            'created_by' => $this->user->id,
            'question' => 'Attending?',
            'options' => ['Yes', 'No', 'Maybe'],
            'poll_type' => 'attendance',
            'is_anonymous' => false,
            'allows_multiple' => false,
            'is_closed' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls/{$poll->id}/vote", [
                'option_index' => 0,
            ]);

        $response->assertOk()
            ->assertJsonStructure([
                'data' => ['poll', 'vote_counts'],
            ]);

        $this->assertDatabaseHas('chat_poll_votes', [
            'poll_id' => $poll->id,
            'user_id' => $this->user->id,
            'option_index' => 0,
        ]);
    }

    public function test_cannot_vote_on_closed_poll(): void
    {
        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Closed poll',
            'message_type' => 'poll',
        ]);

        $poll = ChatPoll::create([
            'chat_id' => $this->chat->id,
            'message_id' => $message->id,
            'created_by' => $this->user->id,
            'question' => 'Closed question',
            'options' => ['Yes', 'No'],
            'poll_type' => 'general',
            'is_closed' => true,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls/{$poll->id}/vote", [
                'option_index' => 0,
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'This poll is closed.',
            ]);
    }

    public function test_cannot_vote_with_invalid_option(): void
    {
        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Poll',
            'message_type' => 'poll',
        ]);

        $poll = ChatPoll::create([
            'chat_id' => $this->chat->id,
            'message_id' => $message->id,
            'created_by' => $this->user->id,
            'question' => 'Question',
            'options' => ['Yes', 'No'],
            'poll_type' => 'general',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls/{$poll->id}/vote", [
                'option_index' => 5,
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'detail' => 'Invalid option index.',
            ]);
    }

    public function test_creator_can_close_poll(): void
    {
        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Poll',
            'message_type' => 'poll',
        ]);

        $poll = ChatPoll::create([
            'chat_id' => $this->chat->id,
            'message_id' => $message->id,
            'created_by' => $this->user->id,
            'question' => 'Question',
            'options' => ['Yes', 'No'],
            'poll_type' => 'general',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls/{$poll->id}/close");

        $response->assertOk();
        $this->assertTrue($poll->fresh()->is_closed);
    }

    public function test_non_creator_cannot_close_poll(): void
    {
        $otherUser = User::factory()->create();
        $otherUser->assignRole('player');

        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $otherUser->id,
            'message' => 'Poll',
            'message_type' => 'poll',
        ]);

        $poll = ChatPoll::create([
            'chat_id' => $this->chat->id,
            'message_id' => $message->id,
            'created_by' => $otherUser->id,
            'question' => 'Question',
            'options' => ['Yes', 'No'],
            'poll_type' => 'general',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->postJson("/api/v1/chats/{$this->chat->id}/polls/{$poll->id}/close");

        $response->assertStatus(403);
    }

    public function test_user_can_list_polls(): void
    {
        $message = ChatMessage::create([
            'chat_id' => $this->chat->id,
            'user_id' => $this->user->id,
            'message' => 'Poll',
            'message_type' => 'poll',
        ]);

        ChatPoll::create([
            'chat_id' => $this->chat->id,
            'message_id' => $message->id,
            'created_by' => $this->user->id,
            'question' => 'Test poll',
            'options' => ['Yes', 'No'],
            'poll_type' => 'general',
            'is_closed' => false,
        ]);

        $response = $this->actingAs($this->user, 'api')
            ->getJson("/api/v1/chats/{$this->chat->id}/polls");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['poll', 'vote_counts', 'total_votes'],
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_chat(): void
    {
        $response = $this->getJson("/api/v1/chats/{$this->chat->id}");
        $response->assertStatus(401);
    }
}
