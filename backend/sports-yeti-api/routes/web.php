<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response('Sports Yeti API', 200);
});

Route::get('/admin', [App\Http\Controllers\AdminController::class, 'index']);


