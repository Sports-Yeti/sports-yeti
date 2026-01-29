<?php

use App\Jobs\ReconcilePaymentsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Payment reconciliation - runs nightly at 2 AM
Schedule::job(new ReconcilePaymentsJob())
    ->dailyAt('02:00')
    ->timezone('America/New_York')
    ->name('payment-reconciliation')
    ->withoutOverlapping()
    ->onOneServer();

// Manual reconciliation command for specific date range
Artisan::command('payments:reconcile {--start= : Start date} {--end= : End date}', function () {
    $start = $this->option('start') ? \Carbon\Carbon::parse($this->option('start')) : now()->subDay();
    $end = $this->option('end') ? \Carbon\Carbon::parse($this->option('end')) : now();

    $this->info("Starting payment reconciliation from {$start} to {$end}");
    
    dispatch(new ReconcilePaymentsJob($start, $end));
    
    $this->info('Reconciliation job dispatched successfully');
})->purpose('Manually trigger payment reconciliation for a date range');
