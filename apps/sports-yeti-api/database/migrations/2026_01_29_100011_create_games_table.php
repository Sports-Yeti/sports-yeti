<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('games', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('league_id');
            $table->uuid('team1_id');
            $table->uuid('team2_id');
            $table->uuid('facility_id')->nullable();
            $table->uuid('space_id')->nullable();
            $table->dateTime('scheduled_at');
            $table->string('status')->default('scheduled'); // scheduled, in_progress, completed, cancelled, postponed
            $table->integer('team1_score')->nullable();
            $table->integer('team2_score')->nullable();
            $table->uuid('winner_team_id')->nullable();
            $table->string('game_type')->default('regular'); // regular, playoff, friendly
            $table->integer('season_number')->nullable();
            $table->integer('week_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('league_id')->references('id')->on('leagues')->onDelete('cascade');
            $table->foreign('team1_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('team2_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('set null');
            $table->foreign('space_id')->references('id')->on('spaces')->onDelete('set null');
            $table->foreign('winner_team_id')->references('id')->on('teams')->onDelete('set null');
            $table->index('league_id');
            $table->index('status');
            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
