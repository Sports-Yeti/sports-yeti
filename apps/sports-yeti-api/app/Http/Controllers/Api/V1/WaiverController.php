<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Waiver;
use App\Models\WaiverSignature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WaiverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Waiver::with(['league:id,name'])
            ->withCount('signatures');

        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min($request->get('per_page', 15), 100);
        $waivers = $query->latest()->paginate($perPage);

        return response()->json([
            'data' => $waivers->items(),
            'meta' => [
                'current_page' => $waivers->currentPage(),
                'last_page' => $waivers->lastPage(),
                'per_page' => $waivers->perPage(),
                'total' => $waivers->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'is_required' => ['sometimes', 'boolean'],
            'version' => ['nullable', 'string', 'max:50'],
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

        $waiver = Waiver::create([
            'league_id' => $request->league_id,
            'title' => $request->title,
            'content' => $request->content,
            'is_required' => $request->is_required ?? false,
            'is_active' => true,
            'version' => $request->version ?? '1.0',
        ]);

        $waiver->load('league:id,name');

        return response()->json([
            'data' => $waiver,
        ], 201);
    }

    public function show(Waiver $waiver): JsonResponse
    {
        $waiver->load(['league:id,name']);
        $waiver->loadCount('signatures');

        return response()->json([
            'data' => $waiver,
        ]);
    }

    public function sign(Request $request, Waiver $waiver): JsonResponse
    {
        if (! $waiver->is_active) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'This waiver is no longer active.',
            ], 400);
        }

        $existing = WaiverSignature::where('waiver_id', $waiver->id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existing) {
            return response()->json([
                'type' => 'https://httpstatuses.io/400',
                'title' => 'Bad Request',
                'status' => 400,
                'detail' => 'You have already signed this waiver.',
            ], 400);
        }

        $signature = WaiverSignature::create([
            'waiver_id' => $waiver->id,
            'user_id' => auth()->id(),
            'signed_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'signature_hash' => hash('sha256', auth()->id().$waiver->id.now()->toIso8601String()),
        ]);

        $signature->load('user:id,name');

        return response()->json([
            'data' => $signature,
        ], 201);
    }

    public function signatures(Waiver $waiver): JsonResponse
    {
        $signatures = $waiver->signatures()
            ->with('user:id,name,email')
            ->latest('signed_at')
            ->paginate(15);

        return response()->json([
            'data' => $signatures->items(),
            'meta' => [
                'current_page' => $signatures->currentPage(),
                'last_page' => $signatures->lastPage(),
                'per_page' => $signatures->perPage(),
                'total' => $signatures->total(),
            ],
        ]);
    }
}
