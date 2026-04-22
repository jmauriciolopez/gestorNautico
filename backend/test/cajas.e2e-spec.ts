import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('CajasController (e2e)', () => {
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
    token = response.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/cajas (GET)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/cajas').expect(401);
    });

    it('should return cajas with token', () => {
      return request(app.getHttpServer())
        .get('/cajas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/cajas/abierta (GET)', () => {
    it('should return open caja', () => {
      return request(app.getHttpServer())
        .get('/cajas/abierta')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/cajas/resumen (GET)', () => {
    it('should return caja summary', () => {
      return request(app.getHttpServer())
        .get('/cajas/resumen')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/cajas/:id (GET)', () => {
    it('should return caja by id', () => {
      return request(app.getHttpServer())
        .get('/cajas/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/cajas/abrir (POST)', () => {
    it('should return 409 if caja already open', () => {
      return request(app.getHttpServer())
        .post('/cajas/abrir')
        .set('Authorization', `Bearer ${token}`)
        .send({ saldoInicial: 1000 })
        .expect(409);
    });
  });

  describe('/cajas/:id/cerrar (PATCH)', () => {
    it('should return 404 for invalid caja id', () => {
      return request(app.getHttpServer())
        .patch('/cajas/999/cerrar')
        .set('Authorization', `Bearer ${token}`)
        .send({ saldoFinal: 1500 })
        .expect(404);
    });
  });
});
