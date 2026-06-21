<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlayerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Player::with(['user:id,name,email,avatar_url'])
            ->where('is_private', false);

        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->has('experience_level')) {
            $query->where('experience_level', $request->experience_level);
        }

        if ($request->has('availability_status')) {
            $query->where('availability_status', $request->availability_status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', '%'.$search.'%');
            });
        }

        $perPage = min($request->get('per_page', 15), 100);
        $players = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $players->items(),
            'meta' => [
                'current_page' => $players->currentPage(),
                'last_page' => $players->lastPage(),
                'per_page' => $players->perPage(),
                'total' => $players->total(),
            ],
        ]);
    }

    public function show(Player $player): JsonResponse
    {
        // Check if profile is private and user is not the owner
        if ($player->is_private && auth()->id() !== $player->user_id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'This profile is private.',
            ], 403);
        }

        $player->load([
            'user:id,name,email,avatar_url',
            'league:id,name',
            'teams:id,name,league_id',
        ]);

        return response()->json([
            'data' => $player,
        ]);
    }

    public function update(Request $request, Player $player): JsonResponse
    {
        // Only the owner can update their profile
        if (auth()->id() !== $player->user_id) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You can only update your own profile.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'bio' => ['nullable', 'string', 'max:1000'],
            'experience_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced,pro'],
            'availability_status' => ['nullable', 'string', 'in:available,looking_for_team,unavailable'],
            'is_private' => ['nullable', 'boolean'],
            'position' => ['nullable', 'string', 'max:50'],
            'height_inches' => ['nullable', 'integer', 'min:48', 'max:96'],
            'weight_lbs' => ['nullable', 'integer', 'min:80', 'max:400'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
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

        $player->update($request->only([
            'bio',
            'experience_level',
            'availability_status',
            'is_private',
            'position',
            'height_inches',
            'weight_lbs',
            'date_of_birth',
        ]));

        $player->load('user:id,name,email,avatar_url');

        return response()->json([
            'data' => $player,
        ]);
    }

    public function me(): JsonResponse
    {
        $player = Player::where('user_id', auth()->id())->first();

        if (! $player) {
            $player = Player::create([
                'user_id' => auth()->id(),
                'experience_level' => 'beginner',
                'availability_status' => 'available',
            ]);
        }

        $player->load([
            'user:id,name,email,avatar_url',
            'league:id,name',
            'teams:id,name,league_id',
        ]);

        return response()->json([
            'data' => $player,
        ]);
    }
}
