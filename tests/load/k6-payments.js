import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const paymentFailRate = new Rate('payment_fail_rate');
const createIntentDuration = new Trend('create_intent_duration', true);
const listPaymentsDuration = new Trend('list_payments_duration', true);

export const options = {
  scenarios: {
    sustained_load: {
      executor: 'constant-arrival-rate',
      rate: 25,           // 25 RPS target (payments are lower volume)
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 15,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],     // p95 < 1s (Stripe adds latency)
    http_req_failed: ['rate<0.02'],        // < 2% failure rate
    payment_fail_rate: ['rate<0.05'],
    create_intent_duration: ['p(95)<1000'],
    list_payments_duration: ['p(95)<300'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000/api/v1';

function login() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'loadtest@example.com',
    password: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });

  try {
    return JSON.parse(res.body).data.token;
  } catch (e) {
    return null;
  }
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function setup() {
  // Register test user
  http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    name: 'Load Test User',
    email: 'loadtest@example.com',
    password: 'password',
    password_confirmation: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });

  const token = login();
  return { token };
}

export default function (data) {
  const token = data.token || login();
  if (!token) {
    paymentFailRate.add(true);
    return;
  }

  const headers = authHeaders(token);

  group('List Payments', () => {
    const res = http.get(`${BASE_URL}/payments`, {
      headers,
      tags: { name: 'GET /payments' },
    });

    listPaymentsDuration.add(res.timings.duration);

    const ok = check(res, {
      'list payments: status 200': (r) => r.status === 200,
      'list payments: has data': (r) => {
        try {
          return JSON.parse(r.body).data !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    paymentFailRate.add(!ok);
    sleep(0.3);
  });

  group('Create Payment Intent', () => {
    const payload = JSON.stringify({
      amount: Math.floor(Math.random() * 10000) + 1000, // $10-$110
      currency: 'usd',
      description: 'Load test payment',
      booking_id: null,
      idempotency_key: `loadtest-pay-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    });

    const res = http.post(`${BASE_URL}/payments/intent`, payload, {
      headers,
      tags: { name: 'POST /payments/intent' },
    });

    createIntentDuration.add(res.timings.duration);

    const ok = check(res, {
      'create intent: status 201 or 200': (r) => r.status === 201 || r.status === 200,
    });

    paymentFailRate.add(!ok);
    sleep(1); // Stripe rate limiting caution
  });
}
