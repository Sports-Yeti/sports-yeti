<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\GameParticipant;
use App\Models\Player;
use App\Models\SubRequest;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubRequestController extends Controller
{
    public function store(Request $request, Game $game): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'team_id' => ['required', 'uuid', 'exists:teams,id'],
            'position' => ['nullable', 'string', 'max:100'],
            'message' => ['nullable', 'string', 'max:500'],
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

        $subRequest = SubRequest::create([
            'game_id' => $game->id,
            'team_id' => $request->team_id,
            'requested_by' => auth()->id(),
            'position' => $request->position,
            'message' => $request->message,
            'status' => 'open',
        ]);

        $availablePlayers = Player::whereNotNull('stats')
            ->get()
            ->filter(fn ($p) => ($p->stats['available_to_sub'] ?? false) === true);

        $notificationService = app(NotificationService::class);
        foreach ($availablePlayers as $player) {
            if ($player->user) {
                $notificationService->send(
                    $player->user,
                    'sub_request',
                    'Sub Needed',
                    "A team needs a substitute".($request->position ? " ({$request->position})" : '').' for an upcoming game.',
                    ['sub_request_id' => $subRequest->id, 'game_id' => $game->id],
                    "/games/{$game->id}"
                );
            }
        }

        $subRequest->load(['game', 'team:id,name', 'requester:id,name']);

        return response()->json(['data' => $subRequest], 201);
    }

    public function index(Game $game): JsonResponse
    {
        $subRequests = SubRequest::where('game_id', $game->id)
            ->with(['team:id,name', 'requester:id,name', 'filler.user:id,name'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $subRequests]);
    }

    public function available(Request $request): JsonResponse
    {
        $query = SubRequest::where('status', 'open')
            ->with([
                'game' => fn ($q) => $q->with(['team1:id,name', 'team2:id,name', 'facility:id,name']),
                'team:id,name',
                'requester:id,name',
            ])
            ->whereHas('game', fn ($q) => $q->where('scheduled_at', '>', now()))
            ->orderBy('created_at', 'desc');

        $perPage = min($request->get('per_page', 15), 100);
        $results = $query->paginate($perPage);

        return response()->json([
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
            ],
        ]);
    }

    public function accept(SubRequest $subRequest): JsonResponse
    {
        if ($subRequest->status !== 'open') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'This sub request is no longer open.',
            ], 400);
        }

        $player = Player::where('user_id', auth()->id())->first();
        if (! $player) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'Player profile required.',
            ], 403);
        }

        $subRequest->update([
            'status' => 'filled',
            'filled_by' => $player->id,
        ]);

        GameParticipant::create([
            'game_id' => $subRequest->game_id,
            'player_id' => $player->id,
            'team_id' => $subRequest->team_id,
            'attendance_confirmed' => true,
            'attendance_response' => 'yes',
        ]);

        $requester = \App\Models\User::find($subRequest->requested_by);
        if ($requester) {
            app(NotificationService::class)->send(
                $requester,
                'sub_filled',
                'Sub Request Filled',
                auth()->user()->name.' has accepted your sub request.',
                ['sub_request_id' => $subRequest->id, 'game_id' => $subRequest->game_id]
            );
        }

        $subRequest->load(['filler.user:id,name']);

        return response()->json(['data' => $subRequest]);
    }
}
