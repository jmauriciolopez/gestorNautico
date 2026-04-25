import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('FacturasController (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ nombre: 'admin', password: 'admin123' });
    const { accessToken } = response.body as { accessToken: string };
    token = accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/facturas (GET)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/facturas').expect(401);
    });

    it('should return facturas with token', () => {
      return request(app.getHttpServer())
        .get('/facturas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should filter by search', () => {
      return request(app.getHttpServer())
        .get('/facturas?search=FAC')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/facturas/next-numero (GET)', () => {
    it('should return next invoice number', () => {
      return request(app.getHttpServer())
        .get('/facturas/next-numero')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/facturas/stats (GET)', () => {
    it('should return facturas stats', () => {
      return request(app.getHttpServer())
        .get('/facturas/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/facturas/:id (GET)', () => {
    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/facturas/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('/facturas (POST)', () => {
    it('should reject without cargoIds', () => {
      return request(app.getHttpServer())
        .post('/facturas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId: 1,
          cargoIds: [],
          fechaEmision: '2024-01-01',
        })
        .expect(400);
    });

    it('should reject with invalid cargoIds', () => {
      return request(app.getHttpServer())
        .post('/facturas')
        .set('Authorization', `Bearer ${token}`)
        .send({
          clienteId: 1,
          cargoIds: [999],
          fechaEmision: '2024-01-01',
        })
        .expect(400);
    });
  });

  describe('/facturas/:id/estado (PATCH)', () => {
    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .patch('/facturas/99999/estado')
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'PAGADA' })
        .expect(404);
    });
  });

  describe('/facturas/:id (DELETE)', () => {
    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/facturas/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
