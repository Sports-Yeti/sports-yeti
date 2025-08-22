<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        return response()->json([
            'ok' => true,
            'service' => 'sports-yeti-api',
            'time' => now()->toISOString(),
        ]);
    });

    Route::prefix('auth')->group(function () {
        Route::post('/register', [App\Http\Controllers\AuthController::class, 'register']);
        Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);
        Route::post('/refresh', [App\Http\Controllers\AuthController::class, 'refresh']);
        Route::middleware('auth:api')->group(function () {
            Route::get('/me', [App\Http\Controllers\AuthController::class, 'me']);
            Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout']);
        });
    });

    Route::middleware('auth:api')->group(function () {
        Route::get('/leagues', [App\Http\Controllers\LeagueController::class, 'index']);
        Route::post('/leagues', [App\Http\Controllers\LeagueController::class, 'store']);

        Route::get('/leagues/{leagueId}/teams', [App\Http\Controllers\TeamController::class, 'index']);
        Route::post('/leagues/{leagueId}/teams', [App\Http\Controllers\TeamController::class, 'store']);

        Route::get('/leagues/{leagueId}/players', [App\Http\Controllers\PlayerController::class, 'index']);
        Route::post('/leagues/{leagueId}/players', [App\Http\Controllers\PlayerController::class, 'store']);
    });
});


