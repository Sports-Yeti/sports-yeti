import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const chatFailRate = new Rate('chat_fail_rate');
const sendMessageDuration = new Trend('send_message_duration', true);
const listMessagesDuration = new Trend('list_messages_duration', true);

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
    chat_fail_rate: ['rate<0.05'],
    send_message_duration: ['p(95)<500'],
    list_messages_duration: ['p(95)<300'],
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
  http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    name: 'Load Test User',
    email: 'loadtest@example.com',
    password: 'password',
    password_confirmation: 'password',
  }), { headers: { 'Content-Type': 'application/json' } });

  const token = login();

  // Setup: create a league and a chat for testing
  const headers = authHeaders(token);

  const leagueRes = http.post(`${BASE_URL}/leagues`, JSON.stringify({
    name: 'Load Test Chat League',
    sport_type: 'basketball',
  }), { headers });

  let chatId = null;
  // Note: Chat may need to be created via game creation or direct DB seeding
  // This setup assumes a chat exists or will be created

  return { token, chatId };
}

export default function (data) {
  const token = data.token || login();
  if (!token) {
    chatFailRate.add(true);
    return;
  }

  const headers = authHeaders(token);
  const chatId = data.chatId;

  // If we don't have a chat ID, skip chat-specific tests
  if (!chatId) {
    // Test notification endpoints instead (always available)
    group('List Notifications', () => {
      const res = http.get(`${BASE_URL}/notifications`, {
        headers,
        tags: { name: 'GET /notifications' },
      });

      check(res, {
        'notifications: status 200': (r) => r.status === 200,
      });

      sleep(0.3);
    });

    group('List Camps', () => {
      const res = http.get(`${BASE_URL}/camps`, {
        headers,
        tags: { name: 'GET /camps' },
      });

      check(res, {
        'camps: status 200': (r) => r.status === 200,
      });

      sleep(0.3);
    });

    return;
  }

  group('List Messages', () => {
    const res = http.get(`${BASE_URL}/chats/${chatId}/messages`, {
      headers,
      tags: { name: 'GET /chats/:id/messages' },
    });

    listMessagesDuration.add(res.timings.duration);

    const ok = check(res, {
      'list messages: status 200': (r) => r.status === 200,
      'list messages: has data': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body).data);
        } catch (e) {
          return false;
        }
      },
    });

    chatFailRate.add(!ok);
    sleep(0.3);
  });

  group('Send Message', () => {
    const payload = JSON.stringify({
      message: `Load test message ${Date.now()}`,
      message_type: 'text',
    });

    const res = http.post(`${BASE_URL}/chats/${chatId}/messages`, payload, {
      headers,
      tags: { name: 'POST /chats/:id/messages' },
    });

    sendMessageDuration.add(res.timings.duration);

    const ok = check(res, {
      'send message: status 201': (r) => r.status === 201,
    });

    chatFailRate.add(!ok);
    sleep(0.5);
  });

  group('List Polls', () => {
    const res = http.get(`${BASE_URL}/chats/${chatId}/polls`, {
      headers,
      tags: { name: 'GET /chats/:id/polls' },
    });

    check(res, {
      'list polls: status 200': (r) => r.status === 200,
    });

    sleep(0.3);
  });
}
