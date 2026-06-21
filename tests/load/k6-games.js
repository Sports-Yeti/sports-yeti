import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const gameFailRate = new Rate('game_fail_rate');
const listGamesDuration = new Trend('list_games_duration', true);
const getGameDuration = new Trend('get_game_duration', true);

export const options = {
  scenarios: {
    sustained_load: {
      executor: 'constant-arrival-rate',
      rate: 75,           // 75 RPS target
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 40,
      maxVUs: 150,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],     // p95 < 300ms
    http_req_failed: ['rate<0.01'],       // < 1% failure rate
    game_fail_rate: ['rate<0.02'],
    list_games_duration: ['p(95)<300'],
    get_game_duration: ['p(95)<200'],
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
  return { token };
}

export default function (data) {
  const token = data.token || login();
  if (!token) {
    gameFailRate.add(true);
    return;
  }

  const headers = authHeaders(token);

  group('List Games', () => {
    const res = http.get(`${BASE_URL}/games`, {
      headers,
      tags: { name: 'GET /games' },
    });

    listGamesDuration.add(res.timings.duration);

    const ok = check(res, {
      'list games: status 200': (r) => r.status === 200,
      'list games: has data array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body).data);
        } catch (e) {
          return false;
        }
      },
      'list games: has pagination meta': (r) => {
        try {
          return JSON.parse(r.body).meta !== undefined;
        } catch (e) {
          return false;
        }
      },
    });

    gameFailRate.add(!ok);

    // If we got games, try to fetch one by ID
    if (ok) {
      try {
        const games = JSON.parse(res.body).data;
        if (games.length > 0) {
          const gameId = games[0].id;
          const detailRes = http.get(`${BASE_URL}/games/${gameId}`, {
            headers,
            tags: { name: 'GET /games/:id' },
          });

          getGameDuration.add(detailRes.timings.duration);

          check(detailRes, {
            'get game: status 200': (r) => r.status === 200,
            'get game: has id': (r) => {
              try {
                return JSON.parse(r.body).data.id === gameId;
              } catch (e) {
                return false;
              }
            },
          });
        }
      } catch (e) {
        // Parse error — skip detail request
      }
    }

    sleep(0.3);
  });

  group('List Leagues', () => {
    const res = http.get(`${BASE_URL}/leagues`, {
      headers,
      tags: { name: 'GET /leagues' },
    });

    check(res, {
      'list leagues: status 200': (r) => r.status === 200,
    });

    sleep(0.2);
  });

  group('List Teams', () => {
    const res = http.get(`${BASE_URL}/teams`, {
      headers,
      tags: { name: 'GET /teams' },
    });

    check(res, {
      'list teams: status 200': (r) => r.status === 200,
    });

    sleep(0.2);
  });

  group('List Facilities', () => {
    const res = http.get(`${BASE_URL}/facilities`, {
      headers,
      tags: { name: 'GET /facilities' },
    });

    check(res, {
      'list facilities: status 200': (r) => r.status === 200,
    });

    sleep(0.2);
  });

  group('List Players', () => {
    const res = http.get(`${BASE_URL}/players`, {
      headers,
      tags: { name: 'GET /players' },
    });

    check(res, {
      'list players: status 200': (r) => r.status === 200,
    });

    sleep(0.2);
  });
}
