<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\Activitylog\Models\Activity;

/**
 * Controller for accessing audit logs (activity logs).
 *
 * Provides endpoints to view and filter activity logs for league admins
 * and super admins. Supports filtering by user, action, date range, and entity.
 */
class AuditController extends Controller
{
    /**
     * Get paginated audit log entries.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Activity::class);

        $validator = Validator::make($request->all(), [
            'user_id' => ['nullable', 'uuid'],
            'subject_type' => ['nullable', 'string', 'max:255'],
            'subject_id' => ['nullable', 'uuid'],
            'event' => ['nullable', 'string', 'in:created,updated,deleted'],
            'log_name' => ['nullable', 'string', 'max:50'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string', 'max:255'],
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

        $query = Activity::with(['causer:id,name,email', 'subject'])
            ->orderBy('created_at', 'desc');

        // Apply league filter if in tenant context
        if (app()->bound('current_league_id')) {
            $leagueId = app('current_league_id');
            $query->where(function ($q) use ($leagueId) {
                // Filter by subject's league_id (stored in properties)
                $q->whereJsonContains('properties->attributes->league_id', $leagueId)
                    ->orWhereJsonContains('properties->old->league_id', $leagueId)
                    // Or filter by subjects that belong to the league
                    ->orWhere(function ($subQ) {
                        $subQ->whereNotNull('subject_type')
                            ->whereNotNull('subject_id');
                    });
            });
        }

        // Filter by causer (user who performed the action)
        if ($request->filled('user_id')) {
            $query->where('causer_id', $request->user_id)
                ->where('causer_type', 'App\\Models\\User');
        }

        // Filter by subject type (entity type)
        if ($request->filled('subject_type')) {
            $subjectType = $this->resolveSubjectType($request->subject_type);
            $query->where('subject_type', $subjectType);
        }

        // Filter by subject ID (specific entity)
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by event type (created, updated, deleted)
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Filter by log name
        if ($request->filled('log_name')) {
            $query->where('log_name', $request->log_name);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search in description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%");
            });
        }

        $perPage = min($request->get('per_page', 25), 100);
        $activities = $query->paginate($perPage);

        return response()->json([
            'data' => $activities->items(),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total(),
            ],
        ]);
    }

    /**
     * Get a specific audit log entry.
     */
    public function show(Activity $activity): JsonResponse
    {
        $this->authorize('view', $activity);

        $activity->load(['causer:id,name,email', 'subject']);

        return response()->json([
            'data' => [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'subject' => $activity->subject,
                'causer_type' => $activity->causer_type,
                'causer_id' => $activity->causer_id,
                'causer' => $activity->causer,
                'properties' => $activity->properties,
                'batch_uuid' => $activity->batch_uuid,
                'created_at' => $activity->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get activity statistics/summary.
     */
    public function stats(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Activity::class);

        $validator = Validator::make($request->all(), [
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
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

        $baseQuery = Activity::query();

        if ($request->filled('date_from')) {
            $baseQuery->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $baseQuery->whereDate('created_at', '<=', $request->date_to);
        }

        // Events by type
        $eventCounts = (clone $baseQuery)
            ->selectRaw('event, COUNT(*) as count')
            ->groupBy('event')
            ->pluck('count', 'event')
            ->toArray();

        // Events by subject type
        $subjectCounts = (clone $baseQuery)
            ->selectRaw('subject_type, COUNT(*) as count')
            ->whereNotNull('subject_type')
            ->groupBy('subject_type')
            ->pluck('count', 'subject_type')
            ->mapWithKeys(fn ($count, $type) => [$this->simplifySubjectType($type) => $count])
            ->toArray();

        // Most active users
        $activeUsers = (clone $baseQuery)
            ->selectRaw('causer_id, COUNT(*) as count')
            ->where('causer_type', 'App\\Models\\User')
            ->whereNotNull('causer_id')
            ->groupBy('causer_id')
            ->orderByDesc('count')
            ->limit(10)
            ->with('causer:id,name,email')
            ->get()
            ->map(fn ($item) => [
                'user_id' => $item->causer_id,
                'user' => $item->causer,
                'action_count' => $item->count,
            ]);

        // Activity over time (last 30 days)
        $activityTimeline = (clone $baseQuery)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date')
            ->toArray();

        return response()->json([
            'data' => [
                'total_events' => $baseQuery->count(),
                'events_by_type' => $eventCounts,
                'events_by_subject' => $subjectCounts,
                'most_active_users' => $activeUsers,
                'activity_timeline' => $activityTimeline,
            ],
        ]);
    }

    /**
     * Get available subject types for filtering.
     */
    public function subjectTypes(): JsonResponse
    {
        $types = Activity::selectRaw('DISTINCT subject_type')
            ->whereNotNull('subject_type')
            ->pluck('subject_type')
            ->map(fn ($type) => [
                'value' => $type,
                'label' => $this->simplifySubjectType($type),
            ]);

        return response()->json([
            'data' => $types,
        ]);
    }

    /**
     * Resolve a simplified subject type to the full class name.
     */
    protected function resolveSubjectType(string $type): string
    {
        $typeMap = [
            'user' => 'App\\Models\\User',
            'player' => 'App\\Models\\Player',
            'team' => 'App\\Models\\Team',
            'league' => 'App\\Models\\League',
            'game' => 'App\\Models\\Game',
            'booking' => 'App\\Models\\Booking',
            'payment' => 'App\\Models\\Payment',
            'facility' => 'App\\Models\\Facility',
            'camp' => 'App\\Models\\Camp',
            'chat' => 'App\\Models\\Chat',
            'notification' => 'App\\Models\\Notification',
        ];

        return $typeMap[strtolower($type)] ?? $type;
    }

    /**
     * Simplify a full class name to a readable type.
     */
    protected function simplifySubjectType(string $type): string
    {
        // Extract just the class name from the full path
        $parts = explode('\\', $type);

        return strtolower(end($parts));
    }
}
