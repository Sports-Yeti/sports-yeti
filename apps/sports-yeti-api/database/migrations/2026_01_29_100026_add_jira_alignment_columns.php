<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leagues', function (Blueprint $table) {
            $table->date('season_start_date')->nullable()->after('timezone');
            $table->date('season_end_date')->nullable()->after('season_start_date');
            $table->date('registration_open_date')->nullable()->after('season_end_date');
            $table->date('registration_close_date')->nullable()->after('registration_open_date');
            $table->integer('max_teams')->nullable()->after('registration_close_date');
            $table->string('status')->default('draft')->after('is_active');
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->string('sport')->nullable()->after('name');
            $table->string('skill_level')->nullable()->after('sport');
        });

        Schema::table('games', function (Blueprint $table) {
            $table->integer('max_players')->nullable()->after('week_number');
            $table->boolean('referee_required')->default(false)->after('max_players');
            $table->boolean('is_open_play')->default(false)->after('referee_required');
            $table->boolean('is_published')->default(true)->after('is_open_play');
        });

        Schema::table('referees', function (Blueprint $table) {
            $table->integer('radius_miles')->nullable()->after('certification');
            $table->json('availability')->nullable()->after('is_available');
        });

        Schema::table('waivers', function (Blueprint $table) {
            $table->string('document_url')->nullable()->after('content');
        });

        // Allow open play games without league/teams.
        DB::statement('ALTER TABLE games ALTER COLUMN league_id DROP NOT NULL');
        DB::statement('ALTER TABLE games ALTER COLUMN team1_id DROP NOT NULL');
        DB::statement('ALTER TABLE games ALTER COLUMN team2_id DROP NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE games ALTER COLUMN league_id SET NOT NULL');
        DB::statement('ALTER TABLE games ALTER COLUMN team1_id SET NOT NULL');
        DB::statement('ALTER TABLE games ALTER COLUMN team2_id SET NOT NULL');

        Schema::table('leagues', function (Blueprint $table) {
            $table->dropColumn(['season_start_date', 'season_end_date', 'registration_open_date', 'registration_close_date', 'max_teams', 'status']);
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn(['sport', 'skill_level']);
        });

        Schema::table('games', function (Blueprint $table) {
            $table->dropColumn(['max_players', 'referee_required', 'is_open_play', 'is_published']);
        });

        Schema::table('referees', function (Blueprint $table) {
            $table->dropColumn(['radius_miles', 'availability']);
        });

        Schema::table('waivers', function (Blueprint $table) {
            $table->dropColumn(['document_url']);
        });
    }
};
