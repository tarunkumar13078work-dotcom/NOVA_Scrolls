import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../server.js';

describe('API health route', () => {
  it('returns service status payload', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      message: 'Nova Scrolls API running',
    });
  });
});
