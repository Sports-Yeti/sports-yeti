<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response('Sports Yeti API', 200);
});


