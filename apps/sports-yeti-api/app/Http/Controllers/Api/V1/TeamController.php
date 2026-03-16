<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Models\Team;
use App\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TeamController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Team::with([
            'league:id,name',
            'captain.user:id,name,avatar_url',
        ])->withCount('players');

        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        $perPage = min($request->get('per_page', 15), 100);
        $teams = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $teams->items(),
            'meta' => [
                'current_page' => $teams->currentPage(),
                'last_page' => $teams->lastPage(),
                'per_page' => $teams->perPage(),
                'total' => $teams->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
            'description' => ['nullable', 'string'],
            'max_roster_size' => ['nullable', 'integer', 'min:5', 'max:30'],
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

        // Get the player profile of the current user
        $player = Player::where('user_id', auth()->id())->first();
        if (! $player) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You must have a player profile to create a team.',
            ], 400);
        }

        $team = Team::create([
            'name' => $request->name,
            'league_id' => $request->league_id,
            'captain_id' => $player->id,
            'description' => $request->description,
            'max_roster_size' => $request->max_roster_size ?? 15,
            'status' => 'pending',
        ]);

        // Add the captain as a team member
        TeamMember::create([
            'team_id' => $team->id,
            'player_id' => $player->id,
            'role' => 'captain',
            'joined_at' => now(),
        ]);

        $team->load([
            'league:id,name',
            'captain.user:id,name,avatar_url',
        ]);

        return response()->json([
            'data' => $team,
        ], 201);
    }

    public function show(Team $team): JsonResponse
    {
        $team->load([
            'league:id,name',
            'captain.user:id,name,avatar_url',
            'players.user:id,name,avatar_url',
        ]);

        return response()->json([
            'data' => $team,
        ]);
    }

    public function update(Request $request, Team $team): JsonResponse
    {
        $this->authorize('update', $team);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'url'],
            'max_roster_size' => ['nullable', 'integer', 'min:5', 'max:30'],
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

        $team->update($request->only([
            'name',
            'description',
            'logo_url',
            'max_roster_size',
        ]));

        $team->load([
            'league:id,name',
            'captain.user:id,name,avatar_url',
        ]);

        return response()->json([
            'data' => $team,
        ]);
    }

    public function destroy(Team $team): JsonResponse
    {
        $this->authorize('delete', $team);

        $team->delete();

        return response()->json(null, 204);
    }

    public function addMember(Request $request, Team $team): JsonResponse
    {
        $this->authorize('update', $team);

        $validator = Validator::make($request->all(), [
            'player_id' => ['required', 'uuid', 'exists:players,id'],
            'role' => ['nullable', 'string', 'in:player,co-captain'],
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

        // Check roster size
        if ($team->players()->count() >= $team->max_roster_size) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Team roster is full.',
            ], 400);
        }

        // Check if already a member
        if ($team->players()->where('player_id', $request->player_id)->exists()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Player is already a member of this team.',
            ], 400);
        }

        TeamMember::create([
            'team_id' => $team->id,
            'player_id' => $request->player_id,
            'role' => $request->role ?? 'player',
            'joined_at' => now(),
        ]);

        $team->load('players.user:id,name,avatar_url');

        return response()->json([
            'data' => $team,
        ]);
    }

    public function removeMember(Team $team, Player $player): JsonResponse
    {
        $this->authorize('update', $team);

        // Cannot remove the captain
        if ($team->captain_id === $player->id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Cannot remove the team captain.',
            ], 400);
        }

        TeamMember::where('team_id', $team->id)
            ->where('player_id', $player->id)
            ->delete();

        return response()->json(null, 204);
    }
}
