<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('highlights', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->uuid('post_id')->nullable();
            $table->string('status')->default('pending_payment');
            $table->string('source_video_path');
            $table->float('source_video_duration')->nullable();
            $table->json('analysis')->nullable();
            $table->decimal('ai_cost', 8, 4)->default(0);
            $table->string('stripe_payment_intent_id')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('post_id')->references('id')->on('posts')->nullOnDelete();
            $table->index('user_id');
            $table->index('status');
            $table->index('stripe_payment_intent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('highlights');
    }
};
