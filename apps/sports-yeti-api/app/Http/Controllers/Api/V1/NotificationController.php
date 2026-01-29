<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc');

        if ($request->has('unread')) {
            $query->whereNull('read_at');
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $notifications = $query->paginate($perPage);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'unread_count' => Notification::where('user_id', auth()->id())
                    ->whereNull('read_at')
                    ->count(),
            ],
        ]);
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot modify this notification.',
            ], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'data' => $notification,
        ]);
    }

    public function markAllAsRead(): JsonResponse
    {
        Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    public function destroy(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== auth()->id()) {
            return response()->json([
                'type' => 'https://httpstatuses.io/403',
                'title' => 'Forbidden',
                'status' => 403,
                'detail' => 'You cannot delete this notification.',
            ], 403);
        }

        $notification->delete();

        return response()->json(null, 204);
    }

    public function clearAll(): JsonResponse
    {
        Notification::where('user_id', auth()->id())->delete();

        return response()->json([
            'message' => 'All notifications cleared.',
        ]);
    }

    public function updatePushToken(Request $request): JsonResponse
    {
        $request->validate([
            'expo_push_token' => ['required', 'string'],
        ]);

        auth()->user()->update([
            'expo_push_token' => $request->expo_push_token,
        ]);

        return response()->json([
            'message' => 'Push token updated successfully.',
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $request->validate([
            'preferences' => ['required', 'array'],
            'preferences.game_reminders' => ['nullable', 'boolean'],
            'preferences.payment_confirmations' => ['nullable', 'boolean'],
            'preferences.chat_messages' => ['nullable', 'boolean'],
            'preferences.league_updates' => ['nullable', 'boolean'],
            'preferences.email_notifications' => ['nullable', 'boolean'],
            'preferences.push_notifications' => ['nullable', 'boolean'],
        ]);

        $currentPreferences = auth()->user()->notification_preferences ?? [];
        $newPreferences = array_merge($currentPreferences, $request->preferences);

        auth()->user()->update([
            'notification_preferences' => $newPreferences,
        ]);

        return response()->json([
            'data' => $newPreferences,
        ]);
    }
}
