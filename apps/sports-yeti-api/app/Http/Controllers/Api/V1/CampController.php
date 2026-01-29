<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Camp;
use App\Models\CampRegistration;
use App\Models\Player;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CampController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Camp::with(['league:id,name'])
            ->withCount('registrations');

        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('skill_level')) {
            $query->whereIn('skill_level', [$request->skill_level, 'all']);
        }

        if ($request->has('upcoming')) {
            $query->where('start_date', '>', now());
        }

        $perPage = min($request->get('per_page', 15), 100);
        $camps = $query->orderBy('start_date', 'asc')->paginate($perPage);

        return response()->json([
            'data' => $camps->items(),
            'meta' => [
                'current_page' => $camps->currentPage(),
                'last_page' => $camps->lastPage(),
                'per_page' => $camps->perPage(),
                'total' => $camps->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date', 'after:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
            'skill_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced,all'],
            'age_group' => ['nullable', 'string'],
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

        $camp = Camp::create([
            'league_id' => $request->league_id,
            'name' => $request->name,
            'description' => $request->description,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'registration_fee' => $request->registration_fee ?? 0,
            'max_participants' => $request->max_participants ?? 50,
            'skill_level' => $request->skill_level ?? 'all',
            'age_group' => $request->age_group,
            'status' => 'draft',
        ]);

        $camp->load('league:id,name');

        return response()->json([
            'data' => $camp,
        ], 201);
    }

    public function show(Camp $camp): JsonResponse
    {
        $camp->load([
            'league:id,name',
            'sessions.facility:id,name',
            'sessions.space:id,name',
        ]);
        $camp->loadCount('registrations');

        return response()->json([
            'data' => $camp,
        ]);
    }

    public function update(Request $request, Camp $camp): JsonResponse
    {
        $this->authorize('update', $camp);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date'],
            'registration_fee' => ['nullable', 'numeric', 'min:0'],
            'max_participants' => ['nullable', 'integer', 'min:1'],
            'skill_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced,all'],
            'status' => ['nullable', 'string', 'in:draft,open,closed,completed,cancelled'],
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

        $camp->update($request->all());
        $camp->load('league:id,name');

        return response()->json([
            'data' => $camp,
        ]);
    }

    public function destroy(Camp $camp): JsonResponse
    {
        $this->authorize('delete', $camp);

        $camp->delete();

        return response()->json(null, 204);
    }

    public function register(Request $request, Camp $camp): JsonResponse
    {
        $player = Player::where('user_id', auth()->id())->first();
        if (!$player) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You must have a player profile to register.',
            ], 400);
        }

        if ($camp->status !== 'open') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Registration is not open for this camp.',
            ], 400);
        }

        if (!$camp->hasAvailableSpots()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'This camp is full.',
            ], 400);
        }

        // Check if already registered
        $existingRegistration = CampRegistration::where('camp_id', $camp->id)
            ->where('player_id', $player->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You are already registered for this camp.',
            ], 400);
        }

        $registration = CampRegistration::create([
            'camp_id' => $camp->id,
            'player_id' => $player->id,
            'payment_status' => $camp->registration_fee > 0 ? 'pending' : 'waived',
            'attendance_status' => 'registered',
        ]);

        $registration->load([
            'camp:id,name,start_date,end_date',
            'player.user:id,name',
        ]);

        return response()->json([
            'data' => $registration,
        ], 201);
    }

    public function unregister(Camp $camp): JsonResponse
    {
        $player = Player::where('user_id', auth()->id())->first();
        if (!$player) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Player profile not found.',
            ], 400);
        }

        $registration = CampRegistration::where('camp_id', $camp->id)
            ->where('player_id', $player->id)
            ->first();

        if (!$registration) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Registration not found.',
            ], 404);
        }

        $registration->update(['attendance_status' => 'cancelled']);

        return response()->json(null, 204);
    }
}
