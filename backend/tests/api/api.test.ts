import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/infrastructure/db/prisma';

const app = createApp();

describe('LaPrizza REST API Integration Tests (ARC03 / ARC05)', () => {
  let managerToken: string;

  beforeAll(async () => {
    // Authenticate as seeded manager
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@laprizza.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    managerToken = res.body.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/v1/health should return ok status, version and ISO-8601 timestamp (Base Skeleton)', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it('GET /api/health should return ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/catalogue should return sellable products with allergens and sizes (BCK11)', async () => {
    const res = await request(app).get('/api/catalogue');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const margherita = res.body.find((p: any) => p.name === 'Pizza Margherita');
    expect(margherita).toBeDefined();
    expect(margherita.isPizza).toBe(true);
    expect(margherita.allergens.length).toBeGreaterThan(0);
    expect(margherita.availableSizes.length).toBeGreaterThan(0);
  });

  it('GET /api/pizza-sizes should return seeded pizza sizes (BCK06)', async () => {
    const res = await request(app).get('/api/pizza-sizes');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body.map((s: any) => s.name)).toEqual(expect.arrayContaining(['Small', 'Medium', 'Large']));
  });

  it('POST /api/stock/:productId/increase and /decrease should update stock (BCK09)', async () => {
    // Find mozzarella product
    const mozzarella = await prisma.product.findFirst({
      where: { name: 'Fresh Mozzarella' },
      include: { stock: true },
    });
    expect(mozzarella).toBeDefined();
    const initialUnits = mozzarella!.stock!.currentStockUnits;

    // Increase by 10 units
    const incRes = await request(app)
      .post(`/api/stock/${mozzarella!.id}/increase`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ units: 10 });

    expect(incRes.status).toBe(200);
    expect(incRes.body.currentStockUnits).toBe(initialUnits + 10);

    // Decrease by 5 units
    const decRes = await request(app)
      .post(`/api/stock/${mozzarella!.id}/decrease`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ units: 5 });

    expect(decRes.status).toBe(200);
    expect(decRes.body.currentStockUnits).toBe(initialUnits + 5);

    // Attempt to decrease by more units than available (must fail with 422 - BCK09)
    const failRes = await request(app)
      .post(`/api/stock/${mozzarella!.id}/decrease`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ units: 99999 });

    expect(failRes.status).toBe(422);
    expect(failRes.body.error).toContain('Business Rule Violation');
  });

  it('POST /api/pizza-component-types should reject duplicate assembly order (BCK07)', async () => {
    const res = await request(app)
      .post('/api/pizza-component-types')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        name: 'Another Dough',
        assemblyOrder: 1, // Already used by Base Dough
        minQuantity: 1,
        maxQuantity: 1,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Assembly orders must be unique');
  });
});
