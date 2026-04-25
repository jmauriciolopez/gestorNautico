import { Test, TestingModule } from '@nestjs/testing';
import { OperacionesController } from './operaciones.controller';
import { OperacionesService } from './operaciones.service';
import { EstadoSolicitud } from './solicitud-bajada.entity';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('OperacionesController', () => {
  let controller: OperacionesController;

  const mockTenant = {
    guarderiaId: 1,
    scope: 'guarderia' as any,
    role: 'SUPERADMIN' as any,
    userId: 1,
  } as any;

  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OperacionesController],
      providers: [
        {
          provide: OperacionesService,
          useValue: {
            createPublic: jest.fn(),
            findAll: jest.fn(),
            updateEstado: jest.fn(),
          },
        },
      ],
    })
    .overrideGuard(AuthTokenGuard).useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
    .compile();

    controller = module.get<OperacionesController>(OperacionesController);
    service = module.get<OperacionesService>(OperacionesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSolicitudPublica', () => {
    it('should call service.createPublic', async () => {
      const dto = { dni: '123', matricula: 'MAT', fechaHoraDeseada: new Date().toISOString() };
      await controller.createSolicitudPublica(mockTenant, dto);
      expect(service.createPublic).toHaveBeenCalledWith(mockTenant, dto);
    });
  });

  describe('findAllSolicitudes', () => {
    it('should call service.findAll', async () => {
      await controller.findAllSolicitudes(mockTenant, 1, 10, EstadoSolicitud.PENDIENTE);
      expect(service.findAll).toHaveBeenCalledWith(mockTenant, { page: 1, limit: 10 }, EstadoSolicitud.PENDIENTE);
    });
  });

  describe('updateEstadoSolicitud', () => {
    it('should call service.updateEstado', async () => {
      const dto = { estado: EstadoSolicitud.EN_AGUA, motivo: 'test' };
      await controller.updateEstadoSolicitud(mockTenant, '1', dto);
      expect(service.updateEstado).toHaveBeenCalledWith(mockTenant, 1, dto.estado, dto.motivo);
    });
  });
});
