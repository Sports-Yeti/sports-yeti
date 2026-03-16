<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FacilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Facility::with(['league:id,name'])
            ->withCount('spaces')
            ->where('is_active', true);

        if ($request->has('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->has('city')) {
            $query->where('city', 'like', '%'.$request->city.'%');
        }

        $perPage = min($request->get('per_page', 15), 100);
        $facilities = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $facilities->items(),
            'meta' => [
                'current_page' => $facilities->currentPage(),
                'last_page' => $facilities->lastPage(),
                'per_page' => $facilities->perPage(),
                'total' => $facilities->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'league_id' => ['required', 'uuid', 'exists:leagues,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:50'],
            'zip_code' => ['required', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:50'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'operating_hours' => ['nullable', 'array'],
            'amenities' => ['nullable', 'array'],
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

        $facility = Facility::create($request->all());
        $facility->load('league:id,name');

        return response()->json([
            'data' => $facility,
        ], 201);
    }

    public function show(Facility $facility): JsonResponse
    {
        $facility->load([
            'league:id,name',
            'spaces',
        ]);

        return response()->json([
            'data' => $facility,
        ]);
    }

    public function update(Request $request, Facility $facility): JsonResponse
    {
        $this->authorize('update', $facility);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['sometimes', 'string', 'max:255'],
            'city' => ['sometimes', 'string', 'max:100'],
            'state' => ['sometimes', 'string', 'max:50'],
            'zip_code' => ['sometimes', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'operating_hours' => ['nullable', 'array'],
            'amenities' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
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

        $facility->update($request->all());
        $facility->load('league:id,name');

        return response()->json([
            'data' => $facility,
        ]);
    }

    public function destroy(Facility $facility): JsonResponse
    {
        $this->authorize('delete', $facility);

        $facility->delete();

        return response()->json(null, 204);
    }
}
