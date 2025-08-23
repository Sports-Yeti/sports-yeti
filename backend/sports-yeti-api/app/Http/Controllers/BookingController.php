<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function index(Request $request, int $leagueId)
    {
        $perPage = min((int) $request->query('limit', 25), 100);
        $query = Booking::query()->where('league_id', $leagueId)->orderBy('id');
        $bookings = $query->cursorPaginate($perPage)->withQueryString();
        return response()->json([
            'data' => $bookings->items(),
            'next_cursor' => $bookings->nextCursor()?->encode(),
            'prev_cursor' => $bookings->previousCursor()?->encode(),
        ]);
    }

    public function store(Request $request, int $leagueId)
    {
        $data = $request->validate([
            'facility_id' => ['required', 'integer'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
        ]);

        $idempotencyKey = $request->header('Idempotency-Key');
        $userId = $request->user()->id;

        return DB::transaction(function () use ($leagueId, $data, $idempotencyKey, $userId) {
            if ($idempotencyKey) {
                $existing = Booking::query()
                    ->where('league_id', $leagueId)
                    ->where('idempotency_key', $idempotencyKey)
                    ->first();
                if ($existing) {
                    return response()->json($existing, 200, ['Idempotent-Replay' => 'true']);
                }
            }

            $conflict = Booking::query()
                ->where('facility_id', $data['facility_id'])
                ->where(function ($q) use ($data) {
                    $q->whereBetween('start_at', [$data['start_at'], $data['end_at']])
                      ->orWhereBetween('end_at', [$data['start_at'], $data['end_at']])
                      ->orWhere(function ($q2) use ($data) {
                          $q2->where('start_at', '<=', $data['start_at'])
                             ->where('end_at', '>=', $data['end_at']);
                      });
                })
                ->lockForUpdate()
                ->exists();
            if ($conflict) {
                return response()->json([
                    'type' => 'about:blank',
                    'title' => 'Conflict',
                    'status' => 409,
                    'detail' => 'Time slot is unavailable',
                ], 409, ['Content-Type' => 'application/problem+json']);
            }

            $booking = Booking::create([
                'league_id' => $leagueId,
                'facility_id' => $data['facility_id'],
                'user_id' => $userId,
                'start_at' => $data['start_at'],
                'end_at' => $data['end_at'],
                'status' => 'confirmed',
                'idempotency_key' => $idempotencyKey,
                'qr_code' => Str::uuid()->toString(),
            ]);

            return response()->json($booking, 201);
        });
    }

    public function checkIn(Request $request, int $leagueId, int $bookingId)
    {
        $data = $request->validate([
            'qr_code' => ['required', 'string'],
        ]);

        $booking = Booking::query()
            ->where('league_id', $leagueId)
            ->where('id', $bookingId)
            ->first();

        if (! $booking) {
            return response()->json([
                'type' => 'about:blank',
                'title' => 'Not Found',
                'status' => 404,
                'detail' => 'Booking not found',
            ], 404, ['Content-Type' => 'application/problem+json']);
        }

        if ($booking->qr_code !== $data['qr_code']) {
            return response()->json([
                'type' => 'about:blank',
                'title' => 'Unauthorized',
                'status' => 401,
                'detail' => 'Invalid QR code',
            ], 401, ['Content-Type' => 'application/problem+json']);
        }

        $booking->status = 'checked_in';
        $booking->save();

        return response()->json($booking);
    }
}


