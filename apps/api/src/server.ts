import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { startOtel, shutdownOtel } from './instrumentation';
import { z } from 'zod';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
app.use(
  pinoHttp({
    logger,
    customProps: (req: any, res: any) => ({
      trace_id: req.headers['x-trace-id'],
      league_id: req.headers['x-league-id'] ?? null,
    }),
  })
);

// RFC7807 helper
function problem(res: express.Response, status: number, title: string, detail?: string, extras?: Record<string, unknown>) {
  res.status(status).type('application/problem+json').json({
    type: 'about:blank',
    title,
    status,
    detail,
    trace_id: res.getHeader('x-trace-id') ?? res.locals.requestId,
    ...extras,
  });
}

// Request ID + trace headers
app.use((req, res, next) => {
  const rid = (req.headers['x-request-id'] as string) || randomUUID();
  res.locals.requestId = rid;
  res.setHeader('x-request-id', rid);
  next();
});

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Seed fixtures in-memory for now
type League = { id: string; name: string; sport_type: string; location: string };
const leagues: League[] = [
  { id: 'l1', name: 'Yeti Hockey League', sport_type: 'hockey', location: 'Aspen' },
  { id: 'l2', name: 'Yeti Basketball League', sport_type: 'basketball', location: 'Denver' },
];

// Cursor pagination utility
function paginate<T>(items: T[], limit: number, cursor?: string) {
  const start = cursor ? Number(Buffer.from(cursor, 'base64').toString('utf8')) : 0;
  const slice = items.slice(start, start + limit);
  const next = start + limit < items.length ? Buffer.from(String(start + limit)).toString('base64') : null;
  const prev = start - limit >= 0 ? Buffer.from(String(Math.max(0, start - limit))).toString('base64') : null;
  return { data: slice, next_cursor: next, prev_cursor: prev };
}

// API v1
const v1 = express.Router();

v1.get('/leagues', (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 10), 100);
  const cursor = (req.query.cursor as string | undefined) ?? undefined;
  const { data, next_cursor, prev_cursor } = paginate(leagues, limit, cursor);
  res.json({ data, next_cursor, prev_cursor });
});

v1.get('/leagues/:id', (req, res) => {
  const league = leagues.find((l) => l.id === req.params.id);
  if (!league) return problem(res, 404, 'Not Found', 'League not found');
  res.json({ data: league });
});

// SSE Chat MVP (room by league for fixture)
const sseClients: Map<string, Set<express.Response>> = new Map();

v1.get('/chat/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const room = (req.query.room as string) || 'global';
  const clients = sseClients.get(room) ?? new Set();
  clients.add(res);
  sseClients.set(room, clients);

  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\n`);
    res.write(`data: {"ts": ${Date.now()}}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

v1.post('/chat/messages', (req, res) => {
  const schema = z.object({ room: z.string().default('global'), message: z.string().min(1).max(1000) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return problem(res, 400, 'Bad Request', 'Invalid message');
  const { room, message } = parsed.data;
  const payload = { id: randomUUID(), room, message, created_at: new Date().toISOString() };
  const clients = sseClients.get(room);
  if (clients) {
    for (const c of clients) {
      c.write(`id: ${payload.id}\n`);
      c.write(`event: message\n`);
      c.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  }
  res.status(201).json({ data: payload });
});

app.use('/api/v1', v1);

const port = Number(process.env.PORT ?? 8080);
startOtel()
  .then(() => {
    app.listen(port, () => {
      logger.info({ port }, 'API listening');
    });
  })
  .catch((err) => {
    logger.error({ err }, 'otel start failed');
  });

process.on('SIGINT', async () => {
  await shutdownOtel();
  process.exit(0);
});
