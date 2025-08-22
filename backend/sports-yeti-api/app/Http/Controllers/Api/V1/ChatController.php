<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use App\Models\Game;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatPoll;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Get or create game chat
     */
    public function gameChat(Game $game): JsonResponse
    {
        Gate::authorize('view', $game);
        
        $chat = $game->chat()->firstOrCreate([
            'type' => 'game'
        ]);

        $messages = $chat->messages()
            ->with(['user', 'poll'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse()
            ->values();

        return response()->json([
            'data' => [
                'chat' => $chat,
                'messages' => $messages,
            ]
        ]);
    }

    /**
     * Send a message to game chat
     */
    public function sendMessage(Request $request, Game $game): JsonResponse
    {
        Gate::authorize('participate', $game);
        
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'message_type' => 'in:text,media,poll',
            'media_url' => 'nullable|url',
            'poll_data' => 'nullable|array',
            'poll_data.question' => 'required_with:poll_data|string|max:255',
            'poll_data.options' => 'required_with:poll_data|array|min:2|max:5',
            'poll_data.options.*' => 'string|max:100',
        ]);

        $chat = $game->chat()->firstOrCreate([
            'type' => 'game'
        ]);

        $message = $chat->messages()->create([
            'user_id' => auth()->id(),
            'message' => $validated['message'],
            'message_type' => $validated['message_type'] ?? 'text',
            'media_url' => $validated['media_url'] ?? null,
        ]);

        // Create poll if specified
        if (isset($validated['poll_data'])) {
            $poll = $chat->polls()->create([
                'question' => $validated['poll_data']['question'],
                'options' => $validated['poll_data']['options'],
                'votes' => [],
            ]);
            $message->update(['poll_id' => $poll->id]);
        }

        // Broadcast to SSE streams (stored in cache for real-time delivery)
        $this->broadcastMessage($chat->id, $message->load(['user', 'poll']));

        return response()->json([
            'data' => $message->load(['user', 'poll']),
            'message' => 'Message sent successfully'
        ], 201);
    }

    /**
     * Stream chat messages via SSE
     */
    public function streamChat(Request $request, Game $game): StreamedResponse
    {
        Gate::authorize('participate', $game);
        
        $chat = $game->chat()->firstOrCreate(['type' => 'game']);
        $lastEventId = $request->header('Last-Event-ID');
        
        return response()->stream(function () use ($chat, $lastEventId) {
            // Set no-buffering headers for SSE
            echo "retry: 10000\n\n";
            
            // Send heartbeat every 20 seconds
            $lastHeartbeat = time();
            $heartbeatInterval = 20;
            
            while (true) {
                // Send heartbeat if needed
                if (time() - $lastHeartbeat >= $heartbeatInterval) {
                    $this->sendSSEEvent('heartbeat', ['timestamp' => now()->toISOString()]);
                    $lastHeartbeat = time();
                }
                
                // Check for new messages
                $query = $chat->messages()->with(['user', 'poll']);
                
                if ($lastEventId) {
                    $query->where('id', '>', $lastEventId);
                }
                
                $newMessages = $query->orderBy('created_at')->get();
                
                foreach ($newMessages as $message) {
                    $this->sendSSEEvent('message', $message->toArray(), $message->id);
                    $lastEventId = $message->id;
                }
                
                // Check for connection close
                if (connection_aborted()) {
                    break;
                }
                
                sleep(1); // Poll every second
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no', // Disable nginx buffering
        ]);
    }

    /**
     * Vote on a chat poll
     */
    public function voteOnPoll(Request $request, ChatPoll $poll): JsonResponse
    {
        $validated = $request->validate([
            'option_index' => 'required|integer|min:0',
        ]);

        $optionIndex = $validated['option_index'];
        
        if ($optionIndex >= count($poll->options)) {
            return response()->json([
                'type' => 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
                'title' => 'Invalid Option',
                'status' => 400,
                'detail' => 'The selected option does not exist.',
                'instance' => $request->getUri(),
            ], 400, ['Content-Type' => 'application/problem+json']);
        }

        // Update or create vote
        $poll->votes()->updateOrCreate(
            ['user_id' => auth()->id()],
            ['option_id' => $optionIndex]
        );

        // Update vote counts
        $votes = $poll->votes;
        $poll->update(['votes' => $votes]);

        // Broadcast poll update
        $this->broadcastMessage($poll->chat_id, [
            'type' => 'poll_update',
            'poll' => $poll->fresh(),
        ]);

        return response()->json([
            'data' => $poll->fresh(),
            'message' => 'Vote recorded successfully'
        ]);
    }

    private function sendSSEEvent(string $event, array $data, ?string $id = null): void
    {
        if ($id) {
            echo "id: {$id}\n";
        }
        echo "event: {$event}\n";
        echo "data: " . json_encode($data) . "\n\n";
        
        if (ob_get_level()) {
            ob_flush();
        }
        flush();
    }

    private function broadcastMessage(int $chatId, $data): void
    {
        // Store message in cache for SSE streams to pick up
        $key = "chat:{$chatId}:messages";
        $messages = cache()->get($key, []);
        $messages[] = [
            'id' => Str::uuid(),
            'data' => $data,
            'timestamp' => now()->toISOString(),
        ];
        
        // Keep only last 100 messages in cache
        if (count($messages) > 100) {
            $messages = array_slice($messages, -100);
        }
        
        cache()->put($key, $messages, 300); // 5 minutes TTL
    }
}
