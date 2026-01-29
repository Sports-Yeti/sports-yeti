<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camp_registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('camp_id');
            $table->uuid('player_id');
            $table->string('payment_status')->default('pending'); // pending, paid, refunded, waived
            $table->string('attendance_status')->default('registered'); // registered, attended, no_show, cancelled
            $table->uuid('payment_id')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('camp_id')->references('id')->on('camps')->onDelete('cascade');
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
            $table->unique(['camp_id', 'player_id']);
            $table->index('payment_status');
            $table->index('attendance_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camp_registrations');
    }
};
