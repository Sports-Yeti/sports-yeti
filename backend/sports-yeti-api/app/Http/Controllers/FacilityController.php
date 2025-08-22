<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index(Request $request, int $leagueId)
    {
        $perPage = min((int) $request->query('limit', 25), 100);
        $query = Facility::query()->where('league_id', $leagueId)->orderBy('id');
        $facilities = $query->cursorPaginate($perPage)->withQueryString();
        return response()->json([
            'data' => $facilities->items(),
            'next_cursor' => $facilities->nextCursor()?->encode(),
            'prev_cursor' => $facilities->previousCursor()?->encode(),
        ]);
    }

    public function store(Request $request, int $leagueId)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'availability' => ['nullable', 'array'],
        ]);
        $facility = Facility::create([
            'league_id' => $leagueId,
            'name' => $data['name'],
            'location' => $data['location'] ?? null,
            'availability' => $data['availability'] ?? null,
        ]);
        return response()->json($facility, 201);
    }
}


