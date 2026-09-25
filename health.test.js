const request = require('supertest');
const app = require('./Base');

describe('Health endpoint', () => {
  test('returns the service health status', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.version).toBe('1.0.0');
    expect(response.body.timestamp).toEqual(expect.any(String));
  });
});