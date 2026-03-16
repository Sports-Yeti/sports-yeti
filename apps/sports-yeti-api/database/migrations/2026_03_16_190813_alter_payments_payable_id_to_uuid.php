<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE payments ALTER COLUMN payable_id TYPE varchar(36) USING payable_id::varchar');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE payments ALTER COLUMN payable_id TYPE bigint USING payable_id::bigint');
    }
};
