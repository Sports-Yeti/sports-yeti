<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(Request $request, int $leagueId)
    {
        $perPage = min((int) $request->query('limit', 25), 100);
        $query = Team::query()->where('league_id', $leagueId)->orderBy('id');
        $teams = $query->cursorPaginate($perPage)->withQueryString();
        return response()->json([
            'data' => $teams->items(),
            'next_cursor' => $teams->nextCursor()?->encode(),
            'prev_cursor' => $teams->previousCursor()?->encode(),
        ]);
    }

    public function store(Request $request, int $leagueId)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $team = Team::create(['name' => $data['name'], 'league_id' => $leagueId]);
        return response()->json($team, 201);
    }
}


