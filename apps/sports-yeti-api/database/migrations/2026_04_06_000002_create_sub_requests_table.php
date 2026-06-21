<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sub_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('game_id');
            $table->uuid('team_id');
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->string('position')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('open');
            $table->uuid('filled_by')->nullable();
            $table->timestamps();

            $table->foreign('game_id')->references('id')->on('games')->cascadeOnDelete();
            $table->foreign('team_id')->references('id')->on('teams')->cascadeOnDelete();
            $table->foreign('filled_by')->references('id')->on('players')->nullOnDelete();
            $table->index(['game_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sub_requests');
    }
};
