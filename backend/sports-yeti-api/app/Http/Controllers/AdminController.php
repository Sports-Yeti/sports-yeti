<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Facility;
use App\Models\League;

class AdminController extends Controller
{
    public function index()
    {
        $leagues = League::query()->orderBy('id')->get();
        $facilities = Facility::query()->orderBy('id')->limit(20)->get();
        $bookings = Booking::query()->orderByDesc('id')->limit(20)->get();

        return view('admin.dashboard', [
            'leagues' => $leagues,
            'facilities' => $facilities,
            'bookings' => $bookings,
        ]);
    }
}


