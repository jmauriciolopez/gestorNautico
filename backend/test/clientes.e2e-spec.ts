import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('ClientesController (e2e)', () => {
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

  describe('/clientes (GET)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/clientes').expect(401);
    });

    it('should return clients with token', () => {
      return request(app.getHttpServer())
        .get('/clientes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should filter by search', () => {
      return request(app.getHttpServer())
        .get('/clientes?search=test')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/clientes/:id (GET)', () => {
    it('should return client by id', () => {
      return request(app.getHttpServer())
        .get('/clientes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/clientes (POST)', () => {
    it('should reject duplicate dni', () => {
      return request(app.getHttpServer())
        .post('/clientes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Test Client',
          dni: '12345678',
        })
        .expect(400);
    });
  });

  describe('/clientes/:id (PUT)', () => {
    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .put('/clientes/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Updated Client' })
        .expect(404);
    });
  });

  describe('/clientes/:id/cuenta-corriente (GET)', () => {
    it('should return cuenta corriente', () => {
      return request(app.getHttpServer())
        .get('/clientes/1/cuenta-corriente')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/clientes/:id (DELETE)', () => {
    it('should soft delete a client', () => {
      return request(app.getHttpServer())
        .delete('/clientes/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
