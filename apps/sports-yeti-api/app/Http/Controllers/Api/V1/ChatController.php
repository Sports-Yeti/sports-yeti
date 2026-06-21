<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatPoll;
use App\Models\ChatPollVote;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    public function show(Chat $chat): JsonResponse
    {
        $chat->load([
            'game:id,team1_id,team2_id,scheduled_at',
            'team:id,name',
            'league:id,name',
        ]);

        return response()->json([
            'data' => $chat,
        ]);
    }

    public function messages(Request $request, Chat $chat): JsonResponse
    {
        $query = ChatMessage::with(['user:id,name,avatar_url'])
            ->where('chat_id', $chat->id)
            ->orderBy('created_at', 'desc');

        $perPage = min($request->get('per_page', 50), 100);
        $messages = $query->paginate($perPage);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    public function sendMessage(Request $request, Chat $chat): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => ['required', 'string', 'max:5000'],
            'message_type' => ['nullable', 'string', 'in:text'],
            'reply_to_id' => ['nullable', 'uuid', 'exists:chat_messages,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'user_id' => auth()->id(),
            'message' => $request->message,
            'message_type' => $request->message_type ?? 'text',
            'media_url' => null,
            'reply_to_id' => $request->reply_to_id,
        ]);

        $message->load('user:id,name,avatar_url');

        $chat->load('game.team1.players.user', 'game.team2.players.user', 'team.players.user', 'league.players.user');

        $recipientIds = collect();
        if ($chat->game) {
            foreach (['team1', 'team2'] as $key) {
                if ($chat->game->{$key}) {
                    foreach ($chat->game->{$key}->players ?? [] as $p) {
                        if ($p->user) {
                            $recipientIds->push($p->user->id);
                        }
                    }
                }
            }
        } elseif ($chat->team) {
            foreach ($chat->team->players ?? [] as $p) {
                if ($p->user) {
                    $recipientIds->push($p->user->id);
                }
            }
        }

        $senderUser = auth()->user();
        $senderName = $senderUser?->name ?? 'Someone';
        $preview = mb_substr($request->message ?? '', 0, 100);

        $notif = app(NotificationService::class);
        foreach ($recipientIds->unique()->reject(fn ($id) => $id === auth()->id()) as $userId) {
            $user = User::find($userId);
            if ($user) {
                $notif->sendChatMessage($user, $chat->id, $senderName, $preview);
            }
        }

        return response()->json([
            'data' => $message,
        ], 201);
    }

    public function deleteMessage(Chat $chat, ChatMessage $message): JsonResponse
    {
        // Only message author can delete
        if ($message->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You can only delete your own messages.',
            ], 403);
        }

        $message->delete();

        return response()->json(null, 204);
    }

    public function createPoll(Request $request, Chat $chat): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'question' => ['required', 'string', 'max:500'],
            'options' => ['required', 'array', 'min:2', 'max:10'],
            'options.*' => ['required', 'string', 'max:200'],
            'poll_type' => ['nullable', 'string', 'in:attendance,general,decision'],
            'is_anonymous' => ['nullable', 'boolean'],
            'allows_multiple' => ['nullable', 'boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Create poll message
        $message = ChatMessage::create([
            'chat_id' => $chat->id,
            'user_id' => auth()->id(),
            'message' => $request->question,
            'message_type' => 'poll',
        ]);

        $poll = ChatPoll::create([
            'chat_id' => $chat->id,
            'message_id' => $message->id,
            'created_by' => auth()->id(),
            'question' => $request->question,
            'options' => $request->options,
            'poll_type' => $request->poll_type ?? 'general',
            'is_anonymous' => $request->is_anonymous ?? false,
            'allows_multiple' => $request->allows_multiple ?? false,
            'expires_at' => $request->expires_at,
        ]);

        $poll->load('creator:id,name');

        return response()->json([
            'data' => [
                'message' => $message,
                'poll' => $poll,
            ],
        ], 201);
    }

    public function votePoll(Request $request, Chat $chat, ChatPoll $poll): JsonResponse
    {
        if ($poll->is_closed) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'This poll is closed.',
            ], 400);
        }

        if ($poll->expires_at && $poll->expires_at->isPast()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'This poll has expired.',
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'option_index' => ['required', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/422',
                'title' => 'Validation Error',
                'status' => 422,
                'detail' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $optionIndex = $request->option_index;

        if ($optionIndex >= count($poll->options)) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Invalid option index.',
            ], 400);
        }

        // Check if already voted (and not allows_multiple)
        if (! $poll->allows_multiple) {
            $existingVote = ChatPollVote::where('poll_id', $poll->id)
                ->where('user_id', auth()->id())
                ->first();

            if ($existingVote) {
                // Update existing vote
                $existingVote->update(['option_index' => $optionIndex]);

                return response()->json([
                    'data' => [
                        'poll' => $poll,
                        'vote_counts' => $poll->getVoteCounts(),
                    ],
                ]);
            }
        }

        ChatPollVote::create([
            'poll_id' => $poll->id,
            'user_id' => auth()->id(),
            'option_index' => $optionIndex,
        ]);

        return response()->json([
            'data' => [
                'poll' => $poll,
                'vote_counts' => $poll->getVoteCounts(),
            ],
        ]);
    }

    public function closePoll(Chat $chat, ChatPoll $poll): JsonResponse
    {
        // Only creator can close
        if ($poll->created_by !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'Only the poll creator can close it.',
            ], 403);
        }

        $poll->update(['is_closed' => true]);

        return response()->json([
            'data' => [
                'poll' => $poll,
                'vote_counts' => $poll->getVoteCounts(),
            ],
        ]);
    }

    public function polls(Chat $chat): JsonResponse
    {
        $polls = ChatPoll::with(['creator:id,name', 'message'])
            ->where('chat_id', $chat->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($poll) {
                return [
                    'poll' => $poll,
                    'vote_counts' => $poll->getVoteCounts(),
                    'total_votes' => $poll->votes()->count(),
                ];
            });

        return response()->json([
            'data' => $polls,
        ]);
    }

    /**
     * SSE endpoint for real-time chat updates
     *
     * @return StreamedResponse
     */
    public function stream(Request $request, Chat $chat)
    {
        $lastMessageId = $request->header('Last-Event-ID');
        $lastTimestamp = $lastMessageId ? ChatMessage::find($lastMessageId)?->created_at : now();

        return response()->stream(function () use ($chat, $lastTimestamp) {
            // Disable output buffering for real-time streaming
            if (ob_get_level()) {
                ob_end_clean();
            }

            // Send headers to prevent buffering
            header('X-Accel-Buffering: no');
            header('Cache-Control: no-cache');

            $heartbeatInterval = 15; // seconds
            $lastHeartbeat = time();
            $checkInterval = 2; // seconds

            while (true) {
                // Check for connection abort
                if (connection_aborted()) {
                    break;
                }

                // Fetch new messages since last timestamp
                $newMessages = ChatMessage::with(['user:id,name,avatar_url'])
                    ->where('chat_id', $chat->id)
                    ->where('created_at', '>', $lastTimestamp)
                    ->orderBy('created_at', 'asc')
                    ->get();

                foreach ($newMessages as $message) {
                    $this->sendSseEvent('message', [
                        'id' => $message->id,
                        'user_id' => $message->user_id,
                        'user' => $message->user,
                        'message' => $message->message,
                        'message_type' => $message->message_type,
                        'created_at' => $message->created_at->toIso8601String(),
                    ], $message->id);

                    $lastTimestamp = $message->created_at;
                }

                // Check for poll updates
                $activePollUpdates = ChatPoll::where('chat_id', $chat->id)
                    ->where('is_closed', false)
                    ->where('updated_at', '>', $lastTimestamp)
                    ->get();

                foreach ($activePollUpdates as $poll) {
                    $this->sendSseEvent('poll_update', [
                        'id' => $poll->id,
                        'question' => $poll->question,
                        'options' => $poll->options,
                        'vote_counts' => $poll->getVoteCounts(),
                        'is_closed' => $poll->is_closed,
                    ], 'poll-'.$poll->id);
                }

                // Send heartbeat to keep connection alive
                if (time() - $lastHeartbeat >= $heartbeatInterval) {
                    $this->sendSseEvent('heartbeat', [
                        'timestamp' => now()->toIso8601String(),
                    ]);
                    $lastHeartbeat = time();
                }

                // Flush output
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();

                // Sleep before next check
                sleep($checkInterval);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Send an SSE event
     */
    private function sendSseEvent(string $event, array $data, ?string $id = null): void
    {
        if ($id) {
            echo "id: {$id}\n";
        }
        echo "event: {$event}\n";
        echo 'data: '.json_encode($data)."\n\n";
    }
}
