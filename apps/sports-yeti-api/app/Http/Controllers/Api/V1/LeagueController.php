<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Models\LeagueAdmin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeagueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = League::with(['admin:id,name,email'])
            ->where('is_active', true);

        if ($request->has('sport_type')) {
            $query->where('sport_type', $request->sport_type);
        }

        if ($request->has('location')) {
            $query->where('location', 'like', '%'.$request->location.'%');
        }

        $perPage = min($request->get('per_page', 15), 100);
        $leagues = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $leagues->items(),
            'meta' => [
                'current_page' => $leagues->currentPage(),
                'last_page' => $leagues->lastPage(),
                'per_page' => $leagues->perPage(),
                'total' => $leagues->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sport_type' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
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

        $league = League::create([
            'name' => $request->name,
            'description' => $request->description,
            'admin_id' => auth()->id(),
            'sport_type' => $request->sport_type ?? 'basketball',
            'location' => $request->location,
            'timezone' => $request->timezone ?? 'America/New_York',
            'registration_fee' => $request->registration_fee ?? 0,
        ]);

        // Add creator as league admin
        LeagueAdmin::create([
            'league_id' => $league->id,
            'user_id' => auth()->id(),
            'role' => 'owner',
        ]);

        $league->load('admin:id,name,email');

        return response()->json([
            'data' => $league,
        ], 201);
    }

    public function show(League $league): JsonResponse
    {
        $league->load([
            'admin:id,name,email',
            'admins.user:id,name,email',
        ]);

        $league->loadCount(['teams', 'players', 'facilities', 'camps', 'games']);

        return response()->json([
            'data' => $league,
        ]);
    }

    public function update(Request $request, League $league): JsonResponse
    {
        $this->authorize('update', $league);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'sport_type' => ['nullable', 'string', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'settings' => ['nullable', 'array'],
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

        $league->update($request->only([
            'name',
            'description',
            'sport_type',
            'location',
            'timezone',
            'registration_fee',
            'is_active',
            'settings',
        ]));

        $league->load('admin:id,name,email');

        return response()->json([
            'data' => $league,
        ]);
    }

    public function destroy(League $league): JsonResponse
    {
        $this->authorize('delete', $league);

        $league->delete();

        return response()->json(null, 204);
    }

    public function stats(League $league): JsonResponse
    {
        $stats = [
            'teams_count' => $league->teams()->count(),
            'players_count' => $league->players()->count(),
            'facilities_count' => $league->facilities()->count(),
            'camps_count' => $league->camps()->count(),
            'games_count' => $league->games()->count(),
            'completed_games' => $league->games()->where('status', 'completed')->count(),
            'upcoming_games' => $league->games()
                ->where('status', 'scheduled')
                ->where('scheduled_at', '>', now())
                ->count(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
