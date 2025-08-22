<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'league_id', 'facility_id', 'user_id', 'start_at', 'end_at', 'status', 'idempotency_key', 'qr_code'
    ];
    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];
}


