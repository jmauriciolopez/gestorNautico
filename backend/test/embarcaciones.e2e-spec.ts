import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('EmbarcacionesController (e2e)', () => {
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

  describe('/embarcaciones (GET)', () => {
    it('should return 401 without token', () => {
      return request(app.getHttpServer()).get('/embarcaciones').expect(401);
    });

    it('should return embarcaciones with token', () => {
      return request(app.getHttpServer())
        .get('/embarcaciones')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should filter by search', () => {
      return request(app.getHttpServer())
        .get('/embarcaciones?search=test')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });

  describe('/embarcaciones/:id (GET)', () => {
    it('should return embarcacion by id', () => {
      return request(app.getHttpServer())
        .get('/embarcaciones/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .get('/embarcaciones/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('/embarcaciones (POST)', () => {
    it('should create a new embarcacion', () => {
      return request(app.getHttpServer())
        .post('/embarcaciones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Test Boat',
          matricula: 'TEST-001',
        })
        .expect(201);
    });
  });

  describe('/embarcaciones/:id (PUT)', () => {
    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .put('/embarcaciones/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Updated Boat' })
        .expect(404);
    });
  });

  describe('/embarcaciones/:id (DELETE)', () => {
    it('should return 404 for non-existent id', () => {
      return request(app.getHttpServer())
        .delete('/embarcaciones/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
