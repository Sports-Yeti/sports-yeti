<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatPoll;
use App\Models\ChatPollVote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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
            'message' => ['required', 'string', 'max:2000'],
            'message_type' => ['nullable', 'string', 'in:text,image'],
            'media_url' => ['nullable', 'url'],
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
            'media_url' => $request->media_url,
            'reply_to_id' => $request->reply_to_id,
        ]);

        $message->load('user:id,name,avatar_url');

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
        if (!$poll->allows_multiple) {
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
}
