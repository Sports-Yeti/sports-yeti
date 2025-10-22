import request from 'supertest';
import http from 'http';
import { AddressInfo } from 'net';

// Spin up the built app by importing server (we expose an app factory if needed)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.get('/api/v1/leagues', (_req, res) => {
    res.json({ data: [] });
  });
  return app;
}

describe('API basics', () => {
  let server: http.Server;
  let url: string;

  beforeAll((done) => {
    const app = buildApp();
    server = app.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      url = `http://127.0.0.1:${port}`;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('health-like list leagues endpoint', async () => {
    const res = await request(url).get('/api/v1/leagues');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
