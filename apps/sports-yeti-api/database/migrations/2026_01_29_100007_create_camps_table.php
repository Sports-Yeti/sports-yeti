<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camps', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('league_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('registration_fee', 10, 2)->default(0);
            $table->integer('max_participants')->default(50);
            $table->string('skill_level')->default('all'); // beginner, intermediate, advanced, all
            $table->string('age_group')->nullable();
            $table->string('status')->default('draft'); // draft, open, closed, completed, cancelled
            $table->string('image_url')->nullable();
            $table->json('requirements')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('league_id')->references('id')->on('leagues')->onDelete('cascade');
            $table->index('league_id');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camps');
    }
};
