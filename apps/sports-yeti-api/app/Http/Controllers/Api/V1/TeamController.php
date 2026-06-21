<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Models\Payment;
use App\Models\Player;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\TeamMember;
use App\Services\NotificationService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

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

    public function updateStatus(Request $request, Team $team): JsonResponse
    {
        $this->authorize('update', $team);

        $validator = Validator::make($request->all(), [
            'status' => ['required', 'string', 'in:pending,approved,rejected,inactive'],
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

        $team->update(['status' => $request->status]);
        $team->load(['league:id,name', 'captain.user:id,name']);

        $captain = $team->captain;
        if ($captain && $captain->user) {
            app(NotificationService::class)->send(
                $captain->user,
                'team_status_update',
                'Team Application '.ucfirst($request->status),
                "Your team \"{$team->name}\" has been {$request->status}.",
                ['team_id' => $team->id, 'status' => $request->status],
                "/teams/{$team->id}"
            );
        }

        return response()->json([
            'data' => $team,
        ]);
    }

    public function invitations(Request $request, Team $team): JsonResponse
    {
        $invitations = TeamInvitation::where('team_id', $team->id)
            ->with(['player.user:id,name,email', 'inviter:id,name'])
            ->orderByDesc('created_at')
            ->paginate(min($request->get('per_page', 15), 100));

        return response()->json([
            'data' => $invitations->items(),
            'meta' => [
                'current_page' => $invitations->currentPage(),
                'last_page' => $invitations->lastPage(),
                'per_page' => $invitations->perPage(),
                'total' => $invitations->total(),
            ],
        ]);
    }

    public function invite(Request $request, Team $team): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'player_id' => ['required', 'uuid', 'exists:players,id'],
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

        $existing = TeamInvitation::where('team_id', $team->id)
            ->where('player_id', $request->player_id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'type' => 'https://httpstatuses.io/409',
                'title' => 'Conflict',
                'status' => 409,
                'detail' => 'An invitation is already pending for this player.',
            ], 409);
        }

        $invitation = TeamInvitation::create([
            'team_id' => $team->id,
            'player_id' => $request->player_id,
            'invited_by' => auth()->id(),
            'message' => $request->message,
            'status' => 'pending',
        ]);

        $player = Player::find($request->player_id);
        if ($player?->user) {
            app(NotificationService::class)->sendTeamInvitation(
                $player->user,
                $team->id,
                $team->name,
                auth()->user()->name
            );
        }

        $invitation->load(['player.user:id,name', 'inviter:id,name']);

        return response()->json(['data' => $invitation], 201);
    }

    public function respondToInvitation(Request $request, Team $team, string $invitationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'response' => ['required', 'string', 'in:accepted,declined'],
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

        $invitation = TeamInvitation::where('id', $invitationId)
            ->where('team_id', $team->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $invitation->update(['status' => $request->response]);

        if ($request->response === 'accepted') {
            TeamMember::create([
                'team_id' => $team->id,
                'player_id' => $invitation->player_id,
                'role' => 'player',
                'payment_status' => 'pending',
                'waiver_signed' => false,
                'joined_at' => now(),
            ]);
        }

        return response()->json(['data' => $invitation]);
    }

    public function createPaymentIntent(Request $request, Team $team): JsonResponse
    {
        $player = Player::where('user_id', auth()->id())->first();
        if (! $player) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'Player profile required.',
            ], 403);
        }

        $member = TeamMember::where('team_id', $team->id)
            ->where('player_id', $player->id)
            ->first();

        if (! $member) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'You are not a member of this team.',
            ], 404);
        }

        if ($member->payment_status === 'paid') {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You have already paid.',
            ], 400);
        }

        $league = League::find($team->league_id);
        $rosterSize = TeamMember::where('team_id', $team->id)->count();
        $perPlayerAmount = $rosterSize > 0 ? round((float) ($league->registration_fee ?? 0) / $rosterSize, 2) : 0;

        $paymentService = app(PaymentService::class);
        $user = auth()->user();
        $intent = $paymentService->createPaymentIntent($user, (int) ($perPlayerAmount * 100), 'usd', [
            'type' => 'league_registration',
            'team_id' => $team->id,
            'player_id' => $player->id,
            'league_id' => $team->league_id,
        ]);

        $payment = Payment::create([
            'user_id' => auth()->id(),
            'league_id' => $team->league_id,
            'amount' => $perPlayerAmount,
            'fee_amount' => round($perPlayerAmount * 0.029 + 0.30, 2),
            'net_amount' => round($perPlayerAmount - ($perPlayerAmount * 0.029 + 0.30), 2),
            'currency' => 'USD',
            'type' => 'league_registration',
            'status' => 'pending',
            'payable_type' => 'App\\Models\\Team',
            'payable_id' => $team->id,
            'stripe_payment_intent_id' => $intent->id,
            'metadata' => ['team_member_id' => $member->id, 'player_id' => $player->id],
        ]);

        return response()->json([
            'data' => [
                'payment' => $payment,
                'client_secret' => $intent->client_secret,
                'amount' => $perPlayerAmount,
                'roster_size' => $rosterSize,
                'total_fee' => (float) ($league->registration_fee ?? 0),
            ],
        ]);
    }

    public function paymentIntent(Request $request, Team $team): JsonResponse
    {
        $userId = auth()->id();
        $player = Player::where('user_id', $userId)->first();

        if (! $player) {
            return response()->json([
                'type' => 'https://httpstatuses.io/404',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Player profile not found.',
            ], 404);
        }

        $teamMember = TeamMember::where('team_id', $team->id)
            ->where('player_id', $player->id)
            ->first();

        if (! $teamMember) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You are not a member of this team.',
            ], 403);
        }

        if ($teamMember->payment_status === 'paid') {
            return response()->json([
                'type' => 'https://httpstatuses.io/409',
                'title' => 'Already Paid',
                'status' => 409,
                'detail' => 'You have already paid for this team.',
            ], 409);
        }

        $league = $team->league;
        $rosterCount = TeamMember::where('team_id', $team->id)->count();
        $perPlayerShare = $rosterCount > 0
            ? round((float) $league->registration_fee / $rosterCount, 2)
            : (float) $league->registration_fee;

        $payment = Payment::create([
            'user_id' => $userId,
            'league_id' => $team->league_id,
            'amount' => $perPlayerShare,
            'fee_amount' => 0,
            'net_amount' => $perPlayerShare,
            'currency' => 'USD',
            'type' => 'league_registration',
            'status' => 'pending',
            'payable_type' => Team::class,
            'payable_id' => $team->id,
            'description' => "League registration share for {$team->name}",
            'metadata' => [
                'team_id' => $team->id,
                'team_member_id' => $teamMember->id,
                'per_player_share' => $perPlayerShare,
            ],
        ]);

        // Demo mock intent. Production should delegate to PaymentService::createPaymentIntent.
        return response()->json([
            'data' => [
                'payment' => $payment,
                'client_secret' => 'pi_demo_'.Str::random(24).'_secret_'.Str::random(16),
                'amount' => $perPlayerShare,
                'currency' => 'USD',
            ],
        ], 201);
    }

    public function paymentSummary(Team $team): JsonResponse
    {
        $members = TeamMember::where('team_id', $team->id)
            ->with('player.user:id,name,avatar_url')
            ->get();

        $league = $team->league;
        $rosterCount = $members->count();
        $totalFee = (float) ($league->registration_fee ?? 0);
        $perPlayerShare = $rosterCount > 0
            ? round($totalFee / $rosterCount, 2)
            : $totalFee;

        $paidCount = $members->where('payment_status', 'paid')->count();
        $pendingCount = $members->where('payment_status', '!=', 'paid')->count();

        return response()->json([
            'data' => [
                'team_id' => $team->id,
                'team_name' => $team->name,
                'league_name' => $league?->name,
                'total_fee' => $totalFee,
                'per_player_share' => $perPlayerShare,
                'roster_count' => $rosterCount,
                'paid_count' => $paidCount,
                'pending_count' => $pendingCount,
                'is_complete' => $rosterCount > 0 && $paidCount === $rosterCount,
                'members' => $members->map(fn ($m) => [
                    'id' => $m->id,
                    'player_id' => $m->player_id,
                    'name' => $m->player?->user?->name ?? 'Unknown',
                    'avatar_url' => $m->player?->user?->avatar_url,
                    'payment_status' => $m->payment_status,
                    'role' => $m->role,
                ]),
            ],
        ]);
    }
}
