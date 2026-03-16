import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const authFailRate = new Rate('auth_fail_rate');
const loginDuration = new Trend('login_duration', true);
const registerDuration = new Trend('register_duration', true);

// Test configuration
export const options = {
  scenarios: {
    // Sustained load test
    sustained_load: {
      executor: 'constant-arrival-rate',
      rate: 100,          // 100 RPS target
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
    // Spike test
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      stages: [
        { duration: '1m', target: 10 },
        { duration: '30s', target: 200 },  // Spike
        { duration: '1m', target: 200 },
        { duration: '30s', target: 10 },   // Recovery
        { duration: '1m', target: 10 },
      ],
      preAllocatedVUs: 100,
      maxVUs: 300,
      startTime: '6m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],     // p95 < 300ms
    http_req_failed: ['rate<0.01'],       // < 1% failure rate
    auth_fail_rate: ['rate<0.05'],        // < 5% auth failures
    login_duration: ['p(95)<300'],        // Login p95 < 300ms
    register_duration: ['p(95)<500'],     // Registration p95 < 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000/api/v1';

// Generate unique user data per VU iteration
function uniqueEmail() {
  return `loadtest_${Date.now()}_${Math.random().toString(36).substr(2, 8)}@test.com`;
}

export default function () {
  group('Registration Flow', () => {
    const email = uniqueEmail();
    const registerPayload = JSON.stringify({
      name: 'Load Test User',
      email: email,
      password: 'TestPassword123!',
      password_confirmation: 'TestPassword123!',
    });

    const registerRes = http.post(`${BASE_URL}/auth/register`, registerPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'POST /auth/register' },
    });

    registerDuration.add(registerRes.timings.duration);

    const registerOk = check(registerRes, {
      'register: status is 201': (r) => r.status === 201,
      'register: returns token': (r) => {
        try {
          return JSON.parse(r.body).data.token !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    authFailRate.add(!registerOk);

    sleep(0.5);
  });

  group('Login Flow', () => {
    // Login with a pre-seeded user (create one in setup or use known credentials)
    const loginPayload = JSON.stringify({
      email: 'loadtest@example.com',
      password: 'password',
    });

    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'POST /auth/login' },
    });

    loginDuration.add(loginRes.timings.duration);

    const loginOk = check(loginRes, {
      'login: status is 200': (r) => r.status === 200,
      'login: returns token': (r) => {
        try {
          return JSON.parse(r.body).data.token !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    authFailRate.add(!loginOk);

    // If login succeeded, test token refresh
    if (loginOk) {
      try {
        const token = JSON.parse(loginRes.body).data.token;

        const meRes = http.get(`${BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          tags: { name: 'GET /auth/me' },
        });

        check(meRes, {
          'me: status is 200': (r) => r.status === 200,
          'me: returns user data': (r) => {
            try {
              return JSON.parse(r.body).data.email !== undefined;
            } catch (e) {
              return false;
            }
          },
        });
      } catch (e) {
        // Token parse failed
      }
    }

    sleep(0.5);
  });
}

// Setup: create a known user for login tests
export function setup() {
  const email = 'loadtest@example.com';
  const payload = JSON.stringify({
    name: 'Load Test User',
    email: email,
    password: 'password',
    password_confirmation: 'password',
  });

  const res = http.post(`${BASE_URL}/auth/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // User may already exist — that's fine
  return { email: email };
}
