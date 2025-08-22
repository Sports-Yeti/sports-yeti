<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function index(Request $request, int $leagueId)
    {
        $perPage = min((int) $request->query('limit', 25), 100);
        $query = Player::query()->where('league_id', $leagueId)->orderBy('id');
        $players = $query->cursorPaginate($perPage)->withQueryString();
        return response()->json([
            'data' => $players->items(),
            'next_cursor' => $players->nextCursor()?->encode(),
            'prev_cursor' => $players->previousCursor()?->encode(),
        ]);
    }

    public function store(Request $request, int $leagueId)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email'],
            'team_id' => ['nullable', 'integer'],
        ]);
        $player = Player::create([
            'league_id' => $leagueId,
            'team_id' => $data['team_id'] ?? null,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
        ]);
        return response()->json($player, 201);
    }
}


