<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Game;
use App\Models\GameParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GameController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Game::with([
            'league:id,name',
            'team1:id,name',
            'team2:id,name',
            'facility:id,name',
        ]);

        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->has('team_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('team1_id', $request->team_id)
                    ->orWhere('team2_id', $request->team_id);
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('upcoming')) {
            $query->where('scheduled_at', '>', now())
                ->where('status', 'scheduled');
        }

        $perPage = min($request->get('per_page', 15), 100);
        $games = $query->orderBy('scheduled_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $games->items(),
            'meta' => [
                'current_page' => $games->currentPage(),
                'last_page' => $games->lastPage(),
                'per_page' => $games->perPage(),
                'total' => $games->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
            'team1_id' => ['required', 'uuid', 'exists:teams,id'],
            'team2_id' => ['required', 'uuid', 'exists:teams,id', 'different:team1_id'],
            'facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
            'space_id' => ['nullable', 'uuid', 'exists:spaces,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'game_type' => ['nullable', 'string', 'in:regular,playoff,friendly'],
            'season_number' => ['nullable', 'integer'],
            'week_number' => ['nullable', 'integer'],
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

        $game = Game::create([
            'league_id' => $request->league_id,
            'team1_id' => $request->team1_id,
            'team2_id' => $request->team2_id,
            'facility_id' => $request->facility_id,
            'space_id' => $request->space_id,
            'scheduled_at' => $request->scheduled_at,
            'game_type' => $request->game_type ?? 'regular',
            'season_number' => $request->season_number,
            'week_number' => $request->week_number,
            'status' => 'scheduled',
        ]);

        // Create game chat
        Chat::create([
            'game_id' => $game->id,
            'league_id' => $game->league_id,
            'type' => 'game',
            'name' => $game->team1->name . ' vs ' . $game->team2->name,
            'is_active' => true,
        ]);

        $game->load([
            'league:id,name',
            'team1:id,name',
            'team2:id,name',
            'facility:id,name',
        ]);

        return response()->json([
            'data' => $game,
        ], 201);
    }

    public function show(Game $game): JsonResponse
    {
        $game->load([
            'league:id,name',
            'team1:id,name',
            'team2:id,name',
            'facility:id,name,address,city',
            'space:id,name',
            'participants.player.user:id,name,avatar_url',
            'chat',
        ]);

        return response()->json([
            'data' => $game,
        ]);
    }

    public function update(Request $request, Game $game): JsonResponse
    {
        $this->authorize('update', $game);

        $validator = Validator::make($request->all(), [
            'scheduled_at' => ['sometimes', 'date'],
            'status' => ['sometimes', 'string', 'in:scheduled,in_progress,completed,cancelled,postponed'],
            'team1_score' => ['nullable', 'integer', 'min:0'],
            'team2_score' => ['nullable', 'integer', 'min:0'],
            'winner_team_id' => ['nullable', 'uuid', 'exists:teams,id'],
            'notes' => ['nullable', 'string'],
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

        $game->update($request->all());
        $game->load([
            'league:id,name',
            'team1:id,name',
            'team2:id,name',
        ]);

        return response()->json([
            'data' => $game,
        ]);
    }

    public function destroy(Game $game): JsonResponse
    {
        $this->authorize('delete', $game);

        $game->delete();

        return response()->json(null, 204);
    }

    public function respondAttendance(Request $request, Game $game): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'response' => ['required', 'string', 'in:yes,no,maybe'],
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

        $participant = GameParticipant::where('game_id', $game->id)
            ->whereHas('player', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->first();

        if (!$participant) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'You are not a participant in this game.',
            ], 404);
        }

        $participant->update([
            'attendance_response' => $request->response,
            'attendance_confirmed' => $request->response === 'yes',
        ]);

        return response()->json([
            'data' => $participant,
        ]);
    }
}
