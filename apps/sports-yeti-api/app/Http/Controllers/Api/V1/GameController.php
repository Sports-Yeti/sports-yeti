<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Game;
use App\Models\GameParticipant;
use App\Models\Player;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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
            'league_id' => ['nullable', 'uuid', 'exists:leagues,id'],
            'team1_id' => ['nullable', 'uuid', 'exists:teams,id'],
            'team2_id' => ['nullable', 'uuid', 'exists:teams,id', 'different:team1_id'],
            'facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
            'space_id' => ['nullable', 'uuid', 'exists:spaces,id'],
            'scheduled_at' => ['required', 'date', 'after:now'],
            'game_type' => ['nullable', 'string', 'in:regular,playoff,friendly'],
            'season_number' => ['nullable', 'integer'],
            'week_number' => ['nullable', 'integer'],
            'max_players' => ['nullable', 'integer', 'min:2', 'max:50'],
            'referee_required' => ['nullable', 'boolean'],
            'is_open_play' => ['nullable', 'boolean'],
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
            'max_players' => $request->max_players,
            'referee_required' => $request->boolean('referee_required'),
            'is_open_play' => $request->boolean('is_open_play'),
            'is_published' => true,
            'status' => 'scheduled',
        ]);

        if ($game->team1_id && $game->team2_id) {
            Chat::create([
                'game_id' => $game->id,
                'league_id' => $game->league_id,
                'type' => 'game',
                'name' => $game->team1->name.' vs '.$game->team2->name,
                'is_active' => true,
            ]);
        }

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

        if (! $participant) {
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

    public function stats(Game $game): JsonResponse
    {
        $participants = GameParticipant::where('game_id', $game->id)
            ->whereNotNull('stats')
            ->with(['player.user:id,name,avatar_url', 'team:id,name'])
            ->get()
            ->map(fn ($p) => [
                'player' => $p->player,
                'team' => $p->team,
                'stats' => $p->stats,
            ]);

        return response()->json([
            'data' => [
                'game_id' => $game->id,
                'participants' => $participants,
            ],
        ]);
    }

    public function storeStats(Request $request, Game $game): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'stats' => ['required', 'array', 'min:1'],
            'stats.*.player_id' => ['required', 'uuid', 'exists:players,id'],
            'stats.*.points' => ['nullable', 'integer', 'min:0'],
            'stats.*.rebounds' => ['nullable', 'integer', 'min:0'],
            'stats.*.assists' => ['nullable', 'integer', 'min:0'],
            'stats.*.steals' => ['nullable', 'integer', 'min:0'],
            'stats.*.blocks' => ['nullable', 'integer', 'min:0'],
            'stats.*.turnovers' => ['nullable', 'integer', 'min:0'],
            'stats.*.fouls' => ['nullable', 'integer', 'min:0'],
            'stats.*.minutes_played' => ['nullable', 'integer', 'min:0'],
            'stats.*.goals' => ['nullable', 'integer', 'min:0'],
            'stats.*.yellow_cards' => ['nullable', 'integer', 'min:0'],
            'stats.*.red_cards' => ['nullable', 'integer', 'min:0'],
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

        $updated = [];
        foreach ($request->stats as $stat) {
            $participant = GameParticipant::where('game_id', $game->id)
                ->where('player_id', $stat['player_id'])
                ->first();

            if ($participant) {
                $statData = collect($stat)->except('player_id')->toArray();
                $participant->update(['stats' => $statData]);
                $updated[] = $participant;
            }
        }

        return response()->json([
            'data' => $updated,
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
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

        $file = $request->file('file');
        $rows = array_map('str_getcsv', file($file->getRealPath()));
        $headers = array_map('strtolower', array_map('trim', array_shift($rows)));

        $created = [];
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2;

                if (count($row) !== count($headers)) {
                    $errors[] = ['row' => $rowNumber, 'error' => 'Column count mismatch'];

                    continue;
                }

                $data = array_combine($headers, $row);

                $rowValidator = Validator::make($data, [
                    'team1_id' => [
                        'required',
                        'uuid',
                        Rule::exists('teams', 'id')->where('league_id', $request->league_id),
                    ],
                    'team2_id' => [
                        'required',
                        'uuid',
                        'different:team1_id',
                        Rule::exists('teams', 'id')->where('league_id', $request->league_id),
                    ],
                    'facility_id' => ['nullable', 'uuid', 'exists:facilities,id'],
                    'space_id' => ['nullable', 'uuid', 'exists:spaces,id'],
                    'scheduled_at' => ['required', 'date'],
                    'game_type' => ['nullable', 'string', 'in:regular,playoff,friendly'],
                    'season_number' => ['nullable', 'integer'],
                    'week_number' => ['nullable', 'integer'],
                ]);

                if ($rowValidator->fails()) {
                    $errors[] = [
                        'row' => $rowNumber,
                        'error' => 'Validation failed',
                        'details' => $rowValidator->errors()->toArray(),
                    ];

                    continue;
                }

                $game = Game::create([
                    'league_id' => $request->league_id,
                    'team1_id' => $data['team1_id'] ?? null,
                    'team2_id' => $data['team2_id'] ?? null,
                    'facility_id' => $data['facility_id'] ?? null,
                    'space_id' => $data['space_id'] ?? null,
                    'scheduled_at' => $data['scheduled_at'] ?? null,
                    'game_type' => $data['game_type'] ?? 'regular',
                    'season_number' => $data['season_number'] ?? null,
                    'week_number' => $data['week_number'] ?? null,
                    'status' => 'scheduled',
                ]);

                $created[] = $game;
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Import Failed',
                'status' => 400,
                'detail' => 'Failed to import games: '.$e->getMessage(),
            ], 400);
        }

        return response()->json([
            'data' => [
                'imported' => count($created),
                'errors' => $errors,
                'games' => $created,
            ],
        ], 201);
    }

    public function join(Game $game): JsonResponse
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

        if ($game->max_players) {
            $current = GameParticipant::where('game_id', $game->id)->count();
            if ($current >= $game->max_players) {
                return response()->json([
                    'type' => 'https://httpstatuses.io/409',
                    'title' => 'Game Full',
                    'status' => 409,
                    'detail' => 'This game has reached its maximum number of players.',
                ], 409);
            }
        }

        $existing = GameParticipant::where('game_id', $game->id)
            ->where('player_id', $player->id)
            ->first();

        if ($existing) {
            return response()->json(['data' => $existing]);
        }

        $participant = GameParticipant::create([
            'game_id' => $game->id,
            'player_id' => $player->id,
            'team_id' => $game->team1_id,
            'attendance_confirmed' => true,
            'attendance_response' => 'yes',
        ]);

        return response()->json(['data' => $participant], 201);
    }

    public function publishSchedule(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
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

        $query = Game::withoutGlobalScopes()
            ->where('league_id', $request->league_id)
            ->where('is_published', false);

        if ($request->season_number) {
            $query->where('season_number', $request->season_number);
        }
        if ($request->week_number) {
            $query->where('week_number', $request->week_number);
        }

        $games = $query->with(['team1.captain.user', 'team2.captain.user'])->get();
        $count = $games->count();

        $notif = app(NotificationService::class);

        foreach ($games as $game) {
            $game->update(['is_published' => true]);

            $userIds = collect();
            if ($game->team1?->captain?->user) {
                $userIds->push($game->team1->captain->user->id);
            }
            if ($game->team2?->captain?->user) {
                $userIds->push($game->team2->captain->user->id);
            }

            foreach ($userIds->unique() as $userId) {
                $user = User::find($userId);
                if ($user) {
                    $notif->send(
                        $user,
                        'schedule_published',
                        'Schedule Published',
                        'Game schedule has been published. Check your upcoming games.',
                        ['game_id' => $game->id],
                        "/games/{$game->id}"
                    );
                }
            }
        }

        return response()->json([
            'data' => ['published_count' => $count],
        ]);
    }
}
