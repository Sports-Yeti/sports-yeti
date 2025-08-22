<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Leagues table
        Schema::create('leagues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('admin_id')->constrained('users');
            $table->string('sport_type', 50);
            $table->string('location');
            $table->json('settings')->default('{}');
            $table->timestamps();
            
            $table->index(['sport_type', 'location']);
        });

        // Players table  
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('league_id')->nullable()->constrained('leagues');
            $table->text('bio')->nullable();
            $table->string('experience_level', 50)->default('beginner');
            $table->string('availability_status', 50)->default('available');
            $table->boolean('is_private')->default(false);
            $table->json('sport_preferences')->default('[]');
            $table->integer('point_balance')->default(0);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('league_id');
            $table->index('availability_status');
            $table->index(['league_id', 'experience_level']);
        });

        // Teams table
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('captain_id')->constrained('players');
            $table->foreignId('league_id')->constrained('leagues');
            $table->foreignId('division_id')->nullable()->constrained('divisions');
            $table->json('settings')->default('{}');
            $table->timestamps();
            
            $table->index('league_id');
            $table->index('captain_id');
        });

        // Divisions table
        Schema::create('divisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained('leagues');
            $table->string('name');
            $table->integer('max_teams')->default(10);
            $table->decimal('registration_fee', 10, 2)->default(0);
            $table->json('rules')->default('{}');
            $table->timestamps();
            
            $table->index('league_id');
        });

        // Team members junction table
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('player_id')->constrained('players')->onDelete('cascade');
            $table->string('role')->default('member');
            $table->string('payment_status')->default('pending');
            $table->boolean('waiver_signed')->default(false);
            $table->timestamps();
            
            $table->unique(['team_id', 'player_id']);
            $table->index('team_id');
            $table->index('player_id');
        });

        // Facilities table
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->nullable()->constrained('leagues');
            $table->string('name');
            $table->string('address');
            $table->json('contact_info');
            $table->json('operating_hours');
            $table->text('liability_info')->nullable();
            $table->timestamps();
            
            $table->index('league_id');
        });

        // Spaces table (courts, fields, etc.)
        Schema::create('spaces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->constrained('facilities')->onDelete('cascade');
            $table->string('name');
            $table->string('sport_type', 50);
            $table->integer('capacity');
            $table->json('amenities')->default('[]');
            $table->integer('point_cost')->default(0);
            $table->decimal('cash_cost', 10, 2)->default(0);
            $table->timestamps();
            
            $table->index('facility_id');
            $table->index('sport_type');
        });

        // Equipment table
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facility_id')->constrained('facilities')->onDelete('cascade');
            $table->string('name');
            $table->string('type', 50);
            $table->string('condition', 50)->default('good');
            $table->integer('point_cost')->default(0);
            $table->decimal('cash_cost', 10, 2)->default(0);
            $table->boolean('available')->default(true);
            $table->timestamps();
            
            $table->index('facility_id');
            $table->index(['type', 'available']);
        });

        // Bookings table
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained('spaces');
            $table->foreignId('user_id')->constrained('users');
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->string('status', 50)->default('pending');
            $table->integer('point_cost')->default(0);
            $table->decimal('cash_cost', 10, 2)->default(0);
            $table->string('qr_code', 255)->unique()->nullable();
            $table->string('idempotency_key', 255)->unique()->nullable();
            $table->timestamps();
            
            $table->index(['space_id', 'start_time', 'end_time']);
            $table->index('user_id');
            $table->index('status');
            $table->index('qr_code');
        });

        // Equipment bookings junction table
        Schema::create('equipment_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('equipment_id')->constrained('equipment');
            $table->integer('quantity')->default(1);
            $table->integer('point_cost')->default(0);
            $table->decimal('cash_cost', 10, 2)->default(0);
            $table->timestamps();
            
            $table->index('booking_id');
            $table->index('equipment_id');
        });

        // Games table
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team1_id')->nullable()->constrained('teams');
            $table->foreignId('team2_id')->nullable()->constrained('teams');
            $table->foreignId('facility_id')->nullable()->constrained('facilities');
            $table->foreignId('space_id')->nullable()->constrained('spaces');
            $table->foreignId('referee_id')->nullable()->constrained('referees');
            $table->foreignId('league_id')->constrained('leagues');
            $table->foreignId('division_id')->nullable()->constrained('divisions');
            $table->timestamp('scheduled_at');
            $table->string('status', 50)->default('scheduled');
            $table->string('game_type', 50)->default('league');
            $table->integer('point_wager')->default(0);
            $table->string('qr_code', 255)->unique()->nullable();
            $table->timestamps();
            
            $table->index('scheduled_at');
            $table->index('status');
            $table->index('league_id');
            $table->index('qr_code');
            $table->index(['league_id', 'scheduled_at']);
        });

        // Game participants table
        Schema::create('game_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->onDelete('cascade');
            $table->foreignId('player_id')->constrained('players');
            $table->foreignId('team_id')->nullable()->constrained('teams');
            $table->boolean('attendance_confirmed')->default(false);
            $table->timestamp('qr_checkin_time')->nullable();
            $table->timestamps();
            
            $table->unique(['game_id', 'player_id']);
            $table->index('game_id');
            $table->index('player_id');
        });

        // Referees table
        Schema::create('referees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('experience_level', 50);
            $table->json('certifications')->default('[]');
            $table->decimal('hourly_rate', 10, 2)->default(0);
            $table->decimal('per_game_rate', 10, 2)->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_games')->default(0);
            $table->boolean('approved')->default(false);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index(['approved', 'experience_level']);
        });

        // Payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('league_id')->nullable()->constrained('leagues');
            $table->decimal('amount', 10, 2);
            $table->string('type', 50);
            $table->string('status', 50)->default('pending');
            $table->string('reference_id')->nullable();
            $table->decimal('fee_amount', 10, 2)->default(0);
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('idempotency_key', 255)->unique()->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('league_id');
            $table->index('stripe_payment_intent_id');
            $table->index('idempotency_key');
        });

        // Points table
        Schema::create('points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->integer('amount');
            $table->string('type', 50);
            $table->string('description');
            $table->string('reference_id')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index(['user_id', 'type']);
        });

        // Point transactions table
        Schema::create('point_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->integer('points_earned')->default(0);
            $table->integer('points_spent')->default(0);
            $table->integer('balance');
            $table->string('transaction_type', 50);
            $table->timestamps();
            
            $table->index('user_id');
        });

        // Chats table
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->nullable()->constrained('games')->onDelete('cascade');
            $table->foreignId('team_id')->nullable()->constrained('teams')->onDelete('cascade');
            $table->string('type', 50)->default('game');
            $table->timestamps();
            
            $table->index('game_id');
            $table->index('team_id');
        });

        // Chat messages table
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('chats')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->text('message');
            $table->string('message_type', 50)->default('text');
            $table->string('media_url', 500)->nullable();
            $table->foreignId('poll_id')->nullable()->constrained('chat_polls');
            $table->timestamps();
            
            $table->index('chat_id');
            $table->index('user_id');
            $table->index('created_at');
        });

        // Chat polls table
        Schema::create('chat_polls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_id')->constrained('chats')->onDelete('cascade');
            $table->string('question');
            $table->json('options');
            $table->json('votes')->default('{}');
            $table->timestamps();
            
            $table->index('chat_id');
        });

        // Chat poll votes table
        Schema::create('chat_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poll_id')->constrained('chat_polls')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->string('option_id');
            $table->timestamps();
            
            $table->unique(['poll_id', 'user_id']);
            $table->index('poll_id');
        });

        // Notifications table
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type', 50);
            $table->string('title');
            $table->text('message');
            $table->json('data')->default('{}');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index(['user_id', 'read_at']);
        });

        // Audit logs table (immutable)
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('league_id')->nullable()->constrained('leagues');
            $table->string('action');
            $table->string('resource_type')->nullable();
            $table->string('resource_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('trace_id')->nullable();
            $table->timestamp('created_at');
            
            $table->index(['user_id', 'created_at']);
            $table->index('league_id');
            $table->index('trace_id');
            $table->index('created_at');
        });

        // Game reports table
        Schema::create('game_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->onDelete('cascade');
            $table->foreignId('captain_id')->constrained('players');
            $table->string('report_type', 50);
            $table->json('details');
            $table->text('equipment_damage')->nullable();
            $table->timestamps();
            
            $table->index('game_id');
            $table->index('captain_id');
        });

        // Camps table
        Schema::create('camps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('league_id')->constrained('leagues');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('registration_fee', 10, 2)->default(0);
            $table->timestamps();
            
            $table->index('league_id');
            $table->index(['start_date', 'end_date']);
        });

        // Camp sessions table
        Schema::create('camp_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('camp_id')->constrained('camps')->onDelete('cascade');
            $table->foreignId('facility_id')->nullable()->constrained('facilities');
            $table->foreignId('trainer_id')->nullable()->constrained('trainers');
            $table->timestamp('start_time');
            $table->timestamp('end_time');
            $table->integer('max_participants')->default(20);
            $table->timestamps();
            
            $table->index('camp_id');
            $table->index(['start_time', 'end_time']);
        });

        // Trainers table
        Schema::create('trainers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->json('certifications')->default('[]');
            $table->string('experience_level', 50);
            $table->decimal('hourly_rate', 10, 2)->default(0);
            $table->decimal('rating', 3, 2)->default(0);
            $table->boolean('approved')->default(false);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('approved');
        });

        // Rate limiting table
        Schema::create('rate_limits', function (Blueprint $table) {
            $table->id();
            $table->string('key');
            $table->integer('hits');
            $table->timestamp('reset_time');
            $table->timestamps();
            
            $table->unique('key');
            $table->index('reset_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop in reverse order to handle foreign key constraints
        Schema::dropIfExists('rate_limits');
        Schema::dropIfExists('trainers');
        Schema::dropIfExists('camp_sessions');
        Schema::dropIfExists('camps');
        Schema::dropIfExists('game_reports');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('chat_poll_votes');
        Schema::dropIfExists('chat_polls');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chats');
        Schema::dropIfExists('point_transactions');
        Schema::dropIfExists('points');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('referees');
        Schema::dropIfExists('game_participants');
        Schema::dropIfExists('games');
        Schema::dropIfExists('equipment_bookings');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('equipment');
        Schema::dropIfExists('spaces');
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('divisions');
        Schema::dropIfExists('teams');
        Schema::dropIfExists('players');
        Schema::dropIfExists('leagues');
    }
};
