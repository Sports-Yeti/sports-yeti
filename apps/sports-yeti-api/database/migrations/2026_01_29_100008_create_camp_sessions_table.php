<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camp_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('camp_id');
            $table->uuid('facility_id')->nullable();
            $table->uuid('space_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->integer('max_participants')->nullable();
            $table->string('session_type')->default('training'); // training, scrimmage, lecture, evaluation
            $table->timestamps();

            $table->foreign('camp_id')->references('id')->on('camps')->onDelete('cascade');
            $table->foreign('facility_id')->references('id')->on('facilities')->onDelete('set null');
            $table->foreign('space_id')->references('id')->on('spaces')->onDelete('set null');
            $table->index('camp_id');
            $table->index(['start_time', 'end_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camp_sessions');
    }
};
