<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Referee;
use App\Models\RefereeAssignment;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RefereeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Referee::with(['user:id,name,avatar_url']);

        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->has('sport_type')) {
            $query->whereJsonContains('sport_types', $request->sport_type);
        }

        if ($request->has('is_available')) {
            $query->where('is_available', filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('min_rating')) {
            $query->where('rating', '>=', (float) $request->min_rating);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $referees = $query->orderBy('rating', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $referees->items(),
            'meta' => [
                'current_page' => $referees->currentPage(),
                'last_page' => $referees->lastPage(),
                'per_page' => $referees->perPage(),
                'total' => $referees->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sport_types' => ['required', 'array', 'min:1'],
            'sport_types.*' => ['string'],
            'experience_level' => ['required', 'string', 'in:beginner,intermediate,advanced,pro'],
            'certification' => ['nullable', 'string', 'max:255'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'league_id' => ['nullable', 'uuid', 'exists:leagues,id'],
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

        $existing = Referee::where('user_id', auth()->id())->first();
        if ($existing) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You already have a referee profile.',
            ], 400);
        }

        $referee = Referee::create([
            'user_id' => auth()->id(),
            'league_id' => $request->league_id,
            'sport_types' => $request->sport_types,
            'experience_level' => $request->experience_level,
            'certification' => $request->certification,
            'hourly_rate' => $request->hourly_rate,
            'bio' => $request->bio,
        ]);

        $referee->load('user:id,name,avatar_url');

        return response()->json([
            'data' => $referee,
        ], 201);
    }

    public function show(Referee $referee): JsonResponse
    {
        $referee->load([
            'user:id,name,avatar_url',
            'league:id,name',
            'assignments' => fn ($q) => $q->with('game:id,scheduled_at,status')
                ->latest()
                ->limit(10),
        ]);

        return response()->json([
            'data' => $referee,
        ]);
    }

    public function update(Request $request, Referee $referee): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sport_types' => ['sometimes', 'array', 'min:1'],
            'sport_types.*' => ['string'],
            'experience_level' => ['sometimes', 'string', 'in:beginner,intermediate,advanced,pro'],
            'certification' => ['nullable', 'string', 'max:255'],
            'hourly_rate' => ['sometimes', 'numeric', 'min:0'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'is_available' => ['sometimes', 'boolean'],
            'league_id' => ['nullable', 'uuid', 'exists:leagues,id'],
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

        $referee->update($request->all());
        $referee->load('user:id,name,avatar_url');

        return response()->json([
            'data' => $referee,
        ]);
    }

    public function availableGames(Request $request): JsonResponse
    {
        $query = Game::where('status', 'scheduled')
            ->where('scheduled_at', '>', now())
            ->whereDoesntHave('refereeAssignments', fn ($q) => $q->where('status', 'accepted'));

        if ($request->has('sport_type')) {
            $query->whereHas('league', fn ($q) => $q->where('sport_type', $request->sport_type));
        }

        if ($request->has('date_from')) {
            $query->where('scheduled_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('scheduled_at', '<=', $request->date_to);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $games = $query->with([
            'league:id,name,sport_type',
            'team1:id,name',
            'team2:id,name',
            'facility:id,name,address,city',
        ])->orderBy('scheduled_at')->paginate($perPage);

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

    public function acceptAssignment(Request $request, RefereeAssignment $assignment): JsonResponse
    {
        if ($assignment->status !== 'pending') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'This assignment is no longer pending.',
            ], 400);
        }

        $assignment->update(['status' => 'accepted']);
        $assignment->load(['referee.user:id,name', 'game:id,scheduled_at,status']);

        return response()->json([
            'data' => $assignment,
        ]);
    }

    public function submitBid(Request $request, Game $game): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bid_amount' => ['required', 'numeric', 'min:0'],
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

        $referee = Referee::where('user_id', auth()->id())->first();
        if (! $referee) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You must have a referee profile to submit a bid.',
            ], 400);
        }

        $existingBid = RefereeAssignment::where('referee_id', $referee->id)
            ->where('game_id', $game->id)
            ->first();

        if ($existingBid) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You have already submitted a bid for this game.',
            ], 400);
        }

        $assignment = RefereeAssignment::create([
            'referee_id' => $referee->id,
            'game_id' => $game->id,
            'status' => 'pending',
            'assigned_rate' => $request->bid_amount,
            'is_bidding' => true,
            'bid_amount' => $request->bid_amount,
        ]);

        $assignment->load(['referee.user:id,name', 'game:id,scheduled_at,status']);

        return response()->json([
            'data' => $assignment,
        ], 201);
    }

    public function myAssignments(Request $request): JsonResponse
    {
        $referee = Referee::where('user_id', auth()->id())->first();
        if (! $referee) {
            return response()->json([
                'data' => [],
                'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0],
            ]);
        }

        $query = RefereeAssignment::where('referee_id', $referee->id)
            ->with([
                'game' => fn ($q) => $q->with([
                    'league:id,name',
                    'team1:id,name',
                    'team2:id,name',
                    'facility:id,name,address',
                ]),
            ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 15), 100);
        $assignments = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $assignments->items(),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ],
        ]);
    }

    public function earnings(Request $request): JsonResponse
    {
        $referee = Referee::where('user_id', auth()->id())->first();
        if (! $referee) {
            return response()->json([
                'data' => [
                    'total_earned' => '0.00',
                    'pending_payouts' => '0.00',
                    'completed_games' => 0,
                    'average_rating' => '0.00',
                ],
            ]);
        }

        $completedAssignments = RefereeAssignment::where('referee_id', $referee->id)
            ->where('status', 'completed');

        $pendingAssignments = RefereeAssignment::where('referee_id', $referee->id)
            ->where('status', 'accepted');

        return response()->json([
            'data' => [
                'total_earned' => number_format((float) (clone $completedAssignments)->sum('assigned_rate'), 2, '.', ''),
                'pending_payouts' => number_format((float) (clone $pendingAssignments)->sum('assigned_rate'), 2, '.', ''),
                'completed_games' => (clone $completedAssignments)->count(),
                'average_rating' => number_format((float) $referee->rating, 2, '.', ''),
            ],
        ]);
    }

    public function declineAssignment(RefereeAssignment $assignment): JsonResponse
    {
        $assignment->update(['status' => 'rejected']);

        return response()->json(['data' => $assignment]);
    }

    public function directAssign(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'game_id' => ['required', 'uuid', 'exists:games,id'],
            'referee_id' => ['required', 'uuid', 'exists:referees,id'],
            'rate' => ['required', 'numeric', 'min:0'],
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

        $assignment = RefereeAssignment::create([
            'referee_id' => $request->referee_id,
            'game_id' => $request->game_id,
            'status' => 'pending',
            'assigned_rate' => $request->rate,
            'is_bidding' => false,
            'admin_approved' => true,
        ]);

        $referee = Referee::with('user')->find($request->referee_id);
        $game = Game::withoutGlobalScopes()->find($request->game_id);
        if ($referee?->user && $game) {
            app(NotificationService::class)->send(
                $referee->user,
                'referee_assignment',
                'New Referee Assignment',
                "You have been assigned to officiate a game on {$game->scheduled_at->format('M j, g:i A')}.",
                ['game_id' => $game->id, 'assignment_id' => $assignment->id, 'rate' => $request->rate],
                "/referee/assignments/{$assignment->id}"
            );
        }

        return response()->json(['data' => $assignment], 201);
    }

    public function selectBid(RefereeAssignment $assignment): JsonResponse
    {
        if (! $assignment->is_bidding) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'This assignment is not a bid.',
            ], 400);
        }

        $assignment->update([
            'status' => 'accepted',
            'admin_approved' => true,
            'assigned_rate' => $assignment->bid_amount,
        ]);

        // Reject other bids on the same game.
        RefereeAssignment::where('game_id', $assignment->game_id)
            ->where('id', '!=', $assignment->id)
            ->where('is_bidding', true)
            ->update(['status' => 'rejected']);

        $referee = Referee::with('user')->find($assignment->referee_id);
        if ($referee?->user) {
            app(NotificationService::class)->send(
                $referee->user,
                'referee_bid_selected',
                'Bid Selected',
                "Your bid of \${$assignment->assigned_rate} has been selected!",
                ['game_id' => $assignment->game_id, 'assignment_id' => $assignment->id],
                "/referee/assignments/{$assignment->id}"
            );
        }

        return response()->json(['data' => $assignment]);
    }

    public function submitReport(Request $request, RefereeAssignment $assignment): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'report' => ['required', 'string', 'max:5000'],
            'rating_given' => ['nullable', 'numeric', 'min:0', 'max:5'],
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

        if ($assignment->status !== 'accepted') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'Can only submit reports for accepted assignments.',
            ], 400);
        }

        $assignment->update([
            'report' => $request->report,
            'rating_given' => $request->rating_given,
            'status' => 'completed',
        ]);

        $referee = $assignment->referee;
        $referee->increment('total_games');

        if ($request->rating_given) {
            $avgRating = RefereeAssignment::where('referee_id', $referee->id)
                ->whereNotNull('rating_given')
                ->avg('rating_given');
            $referee->update(['rating' => $avgRating]);
        }

        $assignment->load(['referee.user:id,name', 'game:id,scheduled_at,status']);

        return response()->json([
            'data' => $assignment,
        ]);
    }
}
