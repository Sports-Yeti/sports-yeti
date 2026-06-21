# Runbook: Payment Failures

## Alert Trigger

- Payment success rate drops below 95% over a 10-minute window
- Reconciliation job reports mismatches
- Stripe webhook failures exceed threshold

## Severity

**P1** — Payment failures directly impact revenue and user trust.

## Diagnosis Steps

### 1. Check Payment Error Logs

```bash
# Recent payment errors
grep -i "payment\|stripe\|charge" /var/www/production/storage/logs/laravel.log | tail -50

# Check Stripe webhook log
grep "webhook" /var/www/production/storage/logs/laravel.log | tail -20
```

### 2. Verify Stripe Connectivity

```bash
# Check Stripe API status
curl -s https://status.stripe.com/api/v2/status.json | python3 -m json.tool

# Test Stripe connection from server
php artisan tinker --execute="
    \$stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
    echo \$stripe->balance->retrieve()->available[0]->amount;
"
```

### 3. Check Reconciliation Status

```bash
# Run reconciliation manually
php artisan schedule:run --verbose

# Check reconciliation job history
php artisan tinker --execute="
    \App\Models\Payment::where('status', 'failed')
        ->where('created_at', '>', now()->subHours(24))
        ->count();
"
```

### 4. Verify Webhook Configuration

```bash
# Check webhook signing secret is configured
php artisan tinker --execute="echo config('services.stripe.webhook_secret') ? 'SET' : 'MISSING';"

# Test webhook endpoint responds
curl -I https://your-api.com/api/v1/webhooks/stripe
```

## Resolution Actions

### If Stripe API Outage

1. Check [Stripe Status](https://status.stripe.com/)
2. Enable a user-facing maintenance message for payment flows
3. Queue failed payment retries for when Stripe recovers
4. Monitor Stripe status page for resolution

### If Webhook Signature Failures

```bash
# Verify webhook secret matches Stripe dashboard
# Go to: Stripe Dashboard → Developers → Webhooks → Signing secret

# Update secret if needed
# Edit .env: STRIPE_WEBHOOK_SECRET=whsec_new_secret

# Clear config cache
php artisan config:clear
php artisan config:cache
```

### If Idempotency Key Issues

```bash
# Check for duplicate payment intents
php artisan tinker --execute="
    \App\Models\Payment::where('idempotency_key', 'the-key')
        ->get(['id', 'status', 'amount', 'created_at']);
"
```

### If Queue Worker Not Processing Payments

```bash
# Check queue worker status
php artisan queue:monitor

# Restart queue workers
php artisan queue:restart

# Process failed jobs manually
php artisan queue:retry all
```

### If Reconciliation Mismatch

```bash
# View mismatch report
php artisan tinker --execute="
    // Query payments that don't match Stripe records
    \App\Models\Payment::where('status', 'confirmed')
        ->where('stripe_payment_intent_id', '!=', null)
        ->get(['id', 'amount', 'stripe_payment_intent_id', 'status']);
"

# Manually reconcile specific payment
# Compare internal record with Stripe dashboard
```

## Post-Incident

1. Reconcile all affected payments manually if necessary
2. Notify affected users of payment status
3. Review refund requirements
4. Update reconciliation job if new edge cases found
5. Document root cause and prevention measures

## Escalation

- **On-call engineer** → Slack #payments channel
- **If revenue impact > $1000** → Engineering lead + Finance
- **If data integrity issue** → CTO
