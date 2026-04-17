<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuditController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\CampController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\FacilityController;
use App\Http\Controllers\Api\V1\GameController;
use App\Http\Controllers\Api\V1\HighlightController;
use App\Http\Controllers\Api\V1\LeagueController;
use App\Http\Controllers\Api\V1\LeagueNewsController;
use App\Http\Controllers\Api\V1\MetricsController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PlayerController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\RefereeController;
use App\Http\Controllers\Api\V1\SubRequestController;
use App\Http\Controllers\Api\V1\TeamController;
use App\Http\Controllers\Api\V1\WaiverController;
use App\Http\Controllers\Api\V1\WebhookController;
use App\Http\Middleware\PrometheusMetrics;
use App\Http\Middleware\TraceRequest;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Metrics Endpoint (Public)
|--------------------------------------------------------------------------
|
| Prometheus metrics endpoint - excluded from auth and rate limiting.
|
*/

Route::get('/metrics', MetricsController::class)->withoutMiddleware([
    TraceRequest::class,
    PrometheusMetrics::class,
]);

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Sports Yeti API v1
|
*/

Route::prefix('v1')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'version' => 'v1',
        ]);
    });

    // Authentication routes (public) with strict rate limiting
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/refresh', [AuthController::class, 'refresh']);

        Route::middleware('auth:api')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    // Protected routes
    Route::middleware('auth:api')->group(function () {
        // Players
        Route::prefix('players')->group(function () {
            Route::get('/', [PlayerController::class, 'index']);
            Route::get('/me', [PlayerController::class, 'me']);
            Route::get('/{player}', [PlayerController::class, 'show']);
            Route::put('/{player}', [PlayerController::class, 'update']);
        });

        // Leagues
        Route::prefix('leagues')->group(function () {
            Route::get('/', [LeagueController::class, 'index']);
            Route::post('/', [LeagueController::class, 'store']);
            Route::get('/{league}', [LeagueController::class, 'show']);
            Route::put('/{league}', [LeagueController::class, 'update']);
            Route::delete('/{league}', [LeagueController::class, 'destroy']);
            Route::get('/{league}/stats', [LeagueController::class, 'stats']);
        });

        // Teams
        Route::prefix('teams')->group(function () {
            Route::get('/', [TeamController::class, 'index']);
            Route::post('/', [TeamController::class, 'store']);
            Route::get('/{team}', [TeamController::class, 'show']);
            Route::put('/{team}', [TeamController::class, 'update']);
            Route::delete('/{team}', [TeamController::class, 'destroy']);
            Route::post('/{team}/members', [TeamController::class, 'addMember']);
            Route::delete('/{team}/members/{player}', [TeamController::class, 'removeMember']);
            Route::patch('/{team}/status', [TeamController::class, 'updateStatus']);
            Route::get('/{team}/invitations', [TeamController::class, 'invitations']);
            Route::post('/{team}/invitations', [TeamController::class, 'invite']);
            Route::post('/{team}/invitations/{invitation}/respond', [TeamController::class, 'respondToInvitation']);
            Route::post('/{team}/payment', [TeamController::class, 'createPaymentIntent']);
            Route::get('/{team}/payment-summary', [TeamController::class, 'paymentSummary']);
            Route::post('/{team}/payment-intent', [TeamController::class, 'paymentIntent']);
        });

        // Facilities
        Route::prefix('facilities')->group(function () {
            Route::get('/', [FacilityController::class, 'index']);
            Route::post('/', [FacilityController::class, 'store']);
            Route::get('/{facility}', [FacilityController::class, 'show']);
            Route::put('/{facility}', [FacilityController::class, 'update']);
            Route::delete('/{facility}', [FacilityController::class, 'destroy']);
        });

        // Facility Spaces
        Route::prefix('facilities/{facility}/spaces')->group(function () {
            Route::get('/', [FacilityController::class, 'spaces']);
            Route::post('/', [FacilityController::class, 'storeSpace']);
            Route::put('/{space}', [FacilityController::class, 'updateSpace']);
            Route::delete('/{space}', [FacilityController::class, 'destroySpace']);
        });

        // Bookings
        Route::prefix('bookings')->group(function () {
            Route::get('/', [BookingController::class, 'index']);
            Route::post('/', [BookingController::class, 'store']);
            Route::get('/{booking}', [BookingController::class, 'show']);
            Route::post('/{booking}/cancel', [BookingController::class, 'cancel']);
            Route::post('/check-in', [BookingController::class, 'checkIn']);
            Route::put('/{booking}', [BookingController::class, 'update']);
        });

        // Camps
        Route::prefix('camps')->group(function () {
            Route::get('/', [CampController::class, 'index']);
            Route::post('/', [CampController::class, 'store']);
            Route::get('/{camp}', [CampController::class, 'show']);
            Route::put('/{camp}', [CampController::class, 'update']);
            Route::delete('/{camp}', [CampController::class, 'destroy']);
            Route::post('/{camp}/register', [CampController::class, 'register']);
            Route::delete('/{camp}/register', [CampController::class, 'unregister']);
        });

        // Games
        Route::prefix('games')->group(function () {
            Route::get('/', [GameController::class, 'index']);
            Route::post('/', [GameController::class, 'store']);
            Route::post('/import', [GameController::class, 'import']);
            Route::post('/publish', [GameController::class, 'publishSchedule']);
            Route::get('/{game}', [GameController::class, 'show']);
            Route::put('/{game}', [GameController::class, 'update']);
            Route::delete('/{game}', [GameController::class, 'destroy']);
            Route::post('/{game}/attendance', [GameController::class, 'respondAttendance']);
            Route::get('/{game}/stats', [GameController::class, 'stats']);
            Route::post('/{game}/stats', [GameController::class, 'storeStats']);
            Route::post('/{game}/join', [GameController::class, 'join']);
            Route::post('/{game}/sub-requests', [SubRequestController::class, 'store']);
            Route::get('/{game}/sub-requests', [SubRequestController::class, 'index']);
        });

        // Referees
        Route::prefix('referees')->group(function () {
            Route::get('/', [RefereeController::class, 'index']);
            Route::post('/', [RefereeController::class, 'store']);
            Route::get('/me/assignments', [RefereeController::class, 'myAssignments']);
            Route::get('/me/earnings', [RefereeController::class, 'earnings']);
            Route::get('/available-games', [RefereeController::class, 'availableGames']);
            Route::get('/{referee}', [RefereeController::class, 'show']);
            Route::put('/{referee}', [RefereeController::class, 'update']);
            Route::post('/assignments/{assignment}/accept', [RefereeController::class, 'acceptAssignment']);
            Route::post('/assignments/{assignment}/decline', [RefereeController::class, 'declineAssignment']);
            Route::post('/assignments/{assignment}/select-bid', [RefereeController::class, 'selectBid']);
            Route::post('/assign', [RefereeController::class, 'directAssign']);
            Route::post('/games/{game}/bid', [RefereeController::class, 'submitBid']);
            Route::post('/assignments/{assignment}/report', [RefereeController::class, 'submitReport']);
        });

        // Waivers
        Route::prefix('waivers')->group(function () {
            Route::get('/', [WaiverController::class, 'index']);
            Route::post('/', [WaiverController::class, 'store']);
            Route::get('/{waiver}', [WaiverController::class, 'show']);
            Route::post('/{waiver}/sign', [WaiverController::class, 'sign']);
            Route::get('/{waiver}/signatures', [WaiverController::class, 'signatures']);
        });

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', [AnalyticsController::class, 'dashboard']);
            Route::get('/revenue', [AnalyticsController::class, 'revenue']);
            Route::get('/registrations', [AnalyticsController::class, 'registrations']);
            Route::get('/facility-utilization', [AnalyticsController::class, 'facilityUtilization']);
        });

        // Sub Requests
        Route::get('/sub-requests/available', [SubRequestController::class, 'available']);
        Route::post('/sub-requests/{subRequest}/accept', [SubRequestController::class, 'accept']);

        // Chats
        Route::prefix('chats')->group(function () {
            Route::get('/{chat}', [ChatController::class, 'show']);
            Route::get('/{chat}/messages', [ChatController::class, 'messages']);
            Route::post('/{chat}/messages', [ChatController::class, 'sendMessage']);
            Route::delete('/{chat}/messages/{message}', [ChatController::class, 'deleteMessage']);
            Route::get('/{chat}/polls', [ChatController::class, 'polls']);
            Route::post('/{chat}/polls', [ChatController::class, 'createPoll']);
            Route::post('/{chat}/polls/{poll}/vote', [ChatController::class, 'votePoll']);
            Route::post('/{chat}/polls/{poll}/close', [ChatController::class, 'closePoll']);
            // SSE endpoint for real-time updates
            Route::get('/{chat}/stream', [ChatController::class, 'stream']);
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
            Route::delete('/clear', [NotificationController::class, 'clearAll']);
            Route::put('/push-token', [NotificationController::class, 'updatePushToken']);
            Route::put('/preferences', [NotificationController::class, 'updatePreferences']);
            Route::post('/{notification}/read', [NotificationController::class, 'markAsRead']);
            Route::delete('/{notification}', [NotificationController::class, 'destroy']);
        });

        // Payments with stricter rate limiting
        Route::prefix('payments')->middleware('throttle:payments')->group(function () {
            Route::get('/', [PaymentController::class, 'index']);
            Route::get('/{payment}', [PaymentController::class, 'show']);
            Route::post('/intent', [PaymentController::class, 'createIntent']);
            Route::post('/{payment}/confirm', [PaymentController::class, 'confirm']);
            Route::post('/{payment}/refund', [PaymentController::class, 'refund'])->middleware('permission:payments.refund');
        });

        // Audit logs (league-admin and super-admin only)
        Route::prefix('audit')->middleware('tenant')->group(function () {
            Route::get('/', [AuditController::class, 'index']);
            Route::get('/stats', [AuditController::class, 'stats']);
            Route::get('/subject-types', [AuditController::class, 'subjectTypes']);
            Route::get('/{activity}', [AuditController::class, 'show']);
        });

        // Posts (Social Feed)
        Route::prefix('posts')->group(function () {
            Route::get('/', [PostController::class, 'index']);
            Route::post('/', [PostController::class, 'store']);
            Route::get('/{post}', [PostController::class, 'show']);
            Route::put('/{post}', [PostController::class, 'update']);
            Route::delete('/{post}', [PostController::class, 'destroy']);
            Route::post('/{post}/like', [PostController::class, 'like']);
            Route::delete('/{post}/like', [PostController::class, 'unlike']);
            Route::get('/{post}/comments', [PostController::class, 'comments']);
        });

        // Comments
        Route::prefix('comments')->group(function () {
            Route::get('/', [CommentController::class, 'index']);
            Route::post('/', [CommentController::class, 'store']);
            Route::get('/{comment}', [CommentController::class, 'show']);
            Route::put('/{comment}', [CommentController::class, 'update']);
            Route::delete('/{comment}', [CommentController::class, 'destroy']);
            Route::get('/{comment}/replies', [CommentController::class, 'replies']);
        });

        // Highlights Studio
        Route::prefix('highlights')->group(function () {
            Route::get('/', [HighlightController::class, 'index']);
            Route::post('/upload', [HighlightController::class, 'uploadVideo']);
            Route::post('/generate', [HighlightController::class, 'generate']);
            Route::get('/{highlight}', [HighlightController::class, 'show']);
            Route::get('/{highlight}/clips/{clip}/download', [HighlightController::class, 'downloadClip']);
            Route::post('/{highlight}/share', [HighlightController::class, 'shareToFeed']);
            Route::delete('/{highlight}', [HighlightController::class, 'destroy']);
        });

        // League News (nested under leagues)
        Route::prefix('leagues/{league}/news')->group(function () {
            Route::get('/', [LeagueNewsController::class, 'index']);
            Route::post('/', [LeagueNewsController::class, 'store']);
            Route::get('/{news}', [LeagueNewsController::class, 'show']);
            Route::put('/{news}', [LeagueNewsController::class, 'update']);
            Route::delete('/{news}', [LeagueNewsController::class, 'destroy']);
            Route::post('/{news}/publish', [LeagueNewsController::class, 'publish']);
            Route::post('/{news}/unpublish', [LeagueNewsController::class, 'unpublish']);
        });
    });

    // Webhooks (no auth required - called by external services)
    Route::prefix('webhooks')->middleware('throttle:webhooks')->group(function () {
        Route::post('/stripe', [WebhookController::class, 'handleStripe']);
    });
});
