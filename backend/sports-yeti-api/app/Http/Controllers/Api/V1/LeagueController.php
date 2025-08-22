<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\League;
use App\Models\Team;
use App\Models\Player;
use Illuminate\Support\Facades\Gate;

class LeagueController extends Controller
{
    /**
     * Display a listing of leagues with cursor pagination
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'limit' => 'integer|min:1|max:100',
            'cursor' => 'nullable|string',
            'sport_type' => 'nullable|string',
            'location' => 'nullable|string',
        ]);

        $query = League::query();
        
        // Apply filters
        if (isset($validated['sport_type'])) {
            $query->where('sport_type', $validated['sport_type']);
        }
        
        if (isset($validated['location'])) {
            $query->where('location', 'like', '%' . $validated['location'] . '%');
        }

        // Apply tenant filtering
        $allowedLeagueIds = $request->input('_allowed_league_ids', []);
        if (!in_array('*', $allowedLeagueIds)) {
            $query->whereIn('id', $allowedLeagueIds);
        }

        // Cursor pagination
        $limit = $validated['limit'] ?? 20;
        if (isset($validated['cursor'])) {
            $query->where('id', '>', base64_decode($validated['cursor']));
        }
        
        $leagues = $query->limit($limit + 1)->with(['admin'])->get();
        
        $hasMore = $leagues->count() > $limit;
        if ($hasMore) {
            $leagues->pop();
        }
        
        $nextCursor = $hasMore ? base64_encode($leagues->last()->id) : null;

        return response()->json([
            'data' => $leagues,
            'pagination' => [
                'limit' => $limit,
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
            ]
        ]);
    }

    /**
     * Display the specified league
     */
    public function show(League $league): JsonResponse
    {
        Gate::authorize('view', $league);
        
        return response()->json([
            'data' => [
                'id' => $league->id,
                'name' => $league->name,
                'description' => $league->description,
                'sport_type' => $league->sport_type,
                'location' => $league->location,
                'stats' => $league->stats,
                'created_at' => $league->created_at,
                'updated_at' => $league->updated_at,
            ]
        ]);
    }

    /**
     * Store a newly created league
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', League::class);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sport_type' => 'required|string|max:50',
            'location' => 'required|string|max:255',
            'settings' => 'nullable|array',
        ]);

        $league = League::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'admin_id' => auth()->id(),
            'sport_type' => $validated['sport_type'],
            'location' => $validated['location'],
            'settings' => $validated['settings'] ?? [],
        ]);

        return response()->json([
            'data' => $league->load('admin'),
            'message' => 'League created successfully'
        ], 201);
    }

    /**
     * Update the specified league
     */
    public function update(Request $request, League $league): JsonResponse
    {
        Gate::authorize('update', $league);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'sport_type' => 'sometimes|string|max:50',
            'location' => 'sometimes|string|max:255',
            'settings' => 'nullable|array',
        ]);

        $league->update($validated);

        return response()->json([
            'data' => $league->fresh()->load('admin'),
            'message' => 'League updated successfully'
        ]);
    }

    /**
     * Remove the specified league
     */
    public function destroy(League $league): JsonResponse
    {
        Gate::authorize('delete', $league);
        
        $league->delete();

        return response()->json([
            'message' => 'League deleted successfully'
        ]);
    }

    /**
     * Create a team in the league
     */
    public function createTeam(Request $request, League $league): JsonResponse
    {
        Gate::authorize('update', $league);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'captain_id' => 'required|exists:players,id',
            'players' => 'array',
            'players.*' => 'exists:players,id',
        ]);

        $team = $league->teams()->create([
            'name' => $validated['name'],
            'captain_id' => $validated['captain_id'],
        ]);

        // Add players to team
        if (isset($validated['players'])) {
            $team->players()->attach($validated['players']);
        }

        return response()->json([
            'data' => $team->load(['players.user', 'captain.user']),
            'message' => 'Team created successfully'
        ], 201);
    }

    /**
     * Get teams in the league
     */
    public function teams(Request $request, League $league): JsonResponse
    {
        Gate::authorize('view', $league);
        
        $validated = $request->validate([
            'limit' => 'integer|min:1|max:100',
            'cursor' => 'nullable|string',
        ]);

        $query = $league->teams()->with(['captain.user', 'players.user']);
        
        // Cursor pagination
        $limit = $validated['limit'] ?? 20;
        if (isset($validated['cursor'])) {
            $query->where('id', '>', base64_decode($validated['cursor']));
        }
        
        $teams = $query->limit($limit + 1)->get();
        
        $hasMore = $teams->count() > $limit;
        if ($hasMore) {
            $teams->pop();
        }
        
        $nextCursor = $hasMore ? base64_encode($teams->last()->id) : null;

        return response()->json([
            'data' => $teams,
            'pagination' => [
                'limit' => $limit,
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
            ]
        ]);
    }

    /**
     * Get players in the league
     */
    public function players(Request $request, League $league): JsonResponse
    {
        Gate::authorize('view', $league);
        
        $validated = $request->validate([
            'limit' => 'integer|min:1|max:100',
            'cursor' => 'nullable|string',
            'experience_level' => 'nullable|string',
            'availability_status' => 'nullable|string',
            'search' => 'nullable|string|max:255',
        ]);

        $query = $league->players()->with('user');
        
        // Apply privacy filter (only show public players unless admin)
        if (!auth()->user()->hasRole(\App\UserRole::LEAGUE_ADMIN)) {
            $query->public();
        }
        
        // Apply filters
        if (isset($validated['experience_level'])) {
            $query->where('experience_level', $validated['experience_level']);
        }
        
        if (isset($validated['availability_status'])) {
            $query->where('availability_status', $validated['availability_status']);
        }
        
        if (isset($validated['search'])) {
            $query->whereHas('user', function ($q) use ($validated) {
                $q->where('name', 'like', '%' . $validated['search'] . '%');
            });
        }

        // Cursor pagination
        $limit = $validated['limit'] ?? 20;
        if (isset($validated['cursor'])) {
            $query->where('id', '>', base64_decode($validated['cursor']));
        }
        
        $players = $query->limit($limit + 1)->get();
        
        $hasMore = $players->count() > $limit;
        if ($hasMore) {
            $players->pop();
        }
        
        $nextCursor = $hasMore ? base64_encode($players->last()->id) : null;

        return response()->json([
            'data' => $players,
            'pagination' => [
                'limit' => $limit,
                'next_cursor' => $nextCursor,
                'has_more' => $hasMore,
            ]
        ]);
    }

    private function createRefreshToken(User $user): string
    {
        return base64_encode($user->id . ':' . now()->addDays(7)->timestamp . ':' . bin2hex(random_bytes(16)));
    }
}
