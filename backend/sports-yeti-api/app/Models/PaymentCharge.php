<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentCharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'league_id', 'user_id', 'amount', 'currency', 'status', 'idempotency_key', 'external_id', 'metadata'
    ];
    protected $casts = [
        'metadata' => 'array',
    ];
}


