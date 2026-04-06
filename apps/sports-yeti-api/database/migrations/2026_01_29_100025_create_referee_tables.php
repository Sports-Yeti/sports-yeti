<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referees', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('league_id')->nullable();
            $table->foreign('league_id')->references('id')->on('leagues')->nullOnDelete();
            $table->json('sport_types');
            $table->string('experience_level');
            $table->string('certification')->nullable();
            $table->decimal('hourly_rate', 10, 2);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_games')->default(0);
            $table->boolean('is_available')->default(true);
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        Schema::create('referee_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('referee_id');
            $table->foreign('referee_id')->references('id')->on('referees')->cascadeOnDelete();
            $table->uuid('game_id');
            $table->foreign('game_id')->references('id')->on('games')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->decimal('assigned_rate', 10, 2);
            $table->boolean('is_bidding')->default(false);
            $table->decimal('bid_amount', 10, 2)->nullable();
            $table->boolean('admin_approved')->default(false);
            $table->text('report')->nullable();
            $table->decimal('rating_given', 3, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referee_assignments');
        Schema::dropIfExists('referees');
    }
};
