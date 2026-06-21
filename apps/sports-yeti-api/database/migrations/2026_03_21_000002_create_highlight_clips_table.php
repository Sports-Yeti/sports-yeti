<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('highlight_clips', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('highlight_id');
            $table->string('clip_path');
            $table->string('thumbnail_path')->nullable();
            $table->string('title');
            $table->text('description');
            $table->float('start_time');
            $table->float('end_time');
            $table->integer('excitement_score')->default(5);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('highlight_id')->references('id')->on('highlights')->cascadeOnDelete();
            $table->index('highlight_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('highlight_clips');
    }
};
