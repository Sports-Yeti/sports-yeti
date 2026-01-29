<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('players', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->uuid('league_id')->nullable();
            $table->text('bio')->nullable();
            $table->string('experience_level')->default('beginner'); // beginner, intermediate, advanced, pro
            $table->string('availability_status')->default('available'); // available, looking_for_team, unavailable
            $table->boolean('is_private')->default(false);
            $table->string('position')->nullable();
            $table->integer('height_inches')->nullable();
            $table->integer('weight_lbs')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->json('stats')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('league_id')->references('id')->on('leagues')->onDelete('set null');
            $table->unique('user_id');
            $table->index('league_id');
            $table->index('experience_level');
            $table->index('availability_status');
            $table->index('is_private');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
