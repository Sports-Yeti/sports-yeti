<?php

namespace App\Http\Controllers;

use App\Models\PaymentCharge;
use App\Models\PaymentRefund;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function createCharge(Request $request, int $leagueId)
    {
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['nullable', 'string', 'size:3'],
            'metadata' => ['nullable', 'array'],
        ]);

        $idempotencyKey = $request->header('Idempotency-Key');
        if ($idempotencyKey) {
            $existing = PaymentCharge::query()
                ->where('league_id', $leagueId)
                ->where('idempotency_key', $idempotencyKey)
                ->first();
            if ($existing) {
                return response()->json($existing, 200, ['Idempotent-Replay' => 'true']);
            }
        }

        $charge = PaymentCharge::create([
            'league_id' => $leagueId,
            'user_id' => $request->user()->id,
            'amount' => $data['amount'],
            'currency' => strtolower($data['currency'] ?? 'usd'),
            'status' => 'succeeded',
            'idempotency_key' => $idempotencyKey,
            'external_id' => null,
            'metadata' => $data['metadata'] ?? null,
        ]);

        return response()->json($charge, 201);
    }

    public function refund(Request $request, int $leagueId, int $chargeId)
    {
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $refund = PaymentRefund::create([
            'league_id' => $leagueId,
            'charge_id' => $chargeId,
            'amount' => $data['amount'],
            'status' => 'succeeded',
        ]);

        return response()->json($refund, 201);
    }

    public function webhook(Request $request)
    {
        // Placeholder: record event only
        $payload = $request->getContent();
        return response()->json(['received' => true]);
    }
}


