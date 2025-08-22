<?php

namespace App\Http\Controllers;

use App\Models\League;
use Illuminate\Http\Request;

class LeagueController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min((int) $request->query('limit', 25), 100);
        $query = League::query()->orderBy('id');
        $leagues = $query->cursorPaginate($perPage)->withQueryString();
        return response()->json([
            'data' => $leagues->items(),
            'next_cursor' => $leagues->nextCursor()?->encode(),
            'prev_cursor' => $leagues->previousCursor()?->encode(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:255']]);
        $league = League::create($data);
        return response()->json($league, 201);
    }
}


