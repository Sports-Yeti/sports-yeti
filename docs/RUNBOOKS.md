## Runbooks

### Payments
- Keys provided later; placeholders only. Use `Idempotency-Key` for all charge/refund calls.
- Webhook endpoint `/api/v1/payments/webhook` accepts JSON; currently stores receipt only.

### SSE Chat
- Stream: `/api/v1/leagues/{leagueId}/chat/stream` (SSE)
- Publish: `/api/v1/leagues/{leagueId}/chat/publish`
- Include `Authorization: Bearer ...` and `X-League-Id` headers.
- Heartbeat sent on connect; Last-Event-ID supported.

### Bookings
- Create booking: `/api/v1/leagues/{leagueId}/bookings` with `Idempotency-Key` header.
- Check-in: `/api/v1/leagues/{leagueId}/bookings/{bookingId}/checkin` with `qr_code`.

### Deployment
- API: provide `.env`, run migrations, configure logs to stdout.
- Mobile: set `EXPO_PUBLIC_API_URL`.

### Pilot Checklist
- Create league, facility; sign in user; set `X-League-Id`.
- Create booking, verify QR, check-in.
- Verify health and logs (Trace-Id present).


