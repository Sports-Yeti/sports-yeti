import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const bookingFailRate = new Rate('booking_fail_rate');
const createBookingDuration = new Trend('create_booking_duration', true);
const listBookingsDuration = new Trend('list_bookings_duration', true);

export const options = {
  scenarios: {
    sustained_load: {
      executor: 'constant-arrival-rate',
      rate: 50,           // 50 RPS target
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 30,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],     // p95 < 500ms
    http_req_failed: ['rate<0.02'],       // < 2% failure rate
    booking_fail_rate: ['rate<0.05'],
    create_booking_duration: ['p(95)<500'],
    list_bookings_duration: ['p(95)<300'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000/api/v1';

function login() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'loadtest@example.com',
    password: 'password',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

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

  // Create a league and facility for booking tests
  const leagueRes = http.post(`${BASE_URL}/leagues`, JSON.stringify({
    name: 'Load Test League',
    sport_type: 'basketball',
  }), { headers: authHeaders(token) });

  let leagueId;
  try {
    leagueId = JSON.parse(leagueRes.body).data.id;
  } catch (e) {
    return { token, leagueId: null, facilityId: null, spaceId: null };
  }

  const facilityRes = http.post(`${BASE_URL}/facilities`, JSON.stringify({
    league_id: leagueId,
    name: 'Load Test Facility',
    address: '123 Load Test St',
    city: 'Test City',
    state: 'TS',
    zip_code: '12345',
  }), { headers: authHeaders(token) });

  let facilityId;
  try {
    facilityId = JSON.parse(facilityRes.body).data.id;
  } catch (e) {
    return { token, leagueId, facilityId: null, spaceId: null };
  }

  return { token, leagueId, facilityId };
}

export default function (data) {
  const token = data.token || login();
  if (!token) {
    bookingFailRate.add(true);
    return;
  }

  const headers = authHeaders(token);

  group('List Bookings', () => {
    const res = http.get(`${BASE_URL}/bookings`, {
      headers,
      tags: { name: 'GET /bookings' },
    });

    listBookingsDuration.add(res.timings.duration);

    const ok = check(res, {
      'list bookings: status 200': (r) => r.status === 200,
      'list bookings: has data array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body).data);
        } catch (e) {
          return false;
        }
      },
    });

    bookingFailRate.add(!ok);
    sleep(0.3);
  });

  group('Create Booking', () => {
    // Generate unique times to avoid conflicts
    const dayOffset = Math.floor(Math.random() * 30) + 1;
    const hourOffset = Math.floor(Math.random() * 12) + 8; // 8am-8pm
    const now = new Date();
    now.setDate(now.getDate() + dayOffset);
    now.setHours(hourOffset, 0, 0, 0);
    const startTime = now.toISOString().replace('T', ' ').substr(0, 19);
    now.setHours(hourOffset + 1);
    const endTime = now.toISOString().replace('T', ' ').substr(0, 19);

    const payload = JSON.stringify({
      space_id: data.spaceId || '00000000-0000-0000-0000-000000000001',
      start_time: startTime,
      end_time: endTime,
      purpose: 'Load test booking',
      idempotency_key: `loadtest-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    });

    const res = http.post(`${BASE_URL}/bookings`, payload, {
      headers,
      tags: { name: 'POST /bookings' },
    });

    createBookingDuration.add(res.timings.duration);

    const ok = check(res, {
      'create booking: status 201 or 409': (r) => r.status === 201 || r.status === 409,
    });

    bookingFailRate.add(!ok);
    sleep(0.5);
  });
}
