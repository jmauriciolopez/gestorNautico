import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosController } from './movimientos.controller';
import { MovimientosService } from './movimientos.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TipoMovimiento } from './movimientos.entity';

import { Role } from '../users/user.entity';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

describe('MovimientosController', () => {
  let controller: MovimientosController;

  const mockTenant: TenantContext = {
    guarderiaId: 1,
    scope: 'guarderia',
    role: Role.SUPERADMIN,
    userId: 1,
  };

  let service: MovimientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosController],
      providers: [
        {
          provide: MovimientosService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MovimientosController>(MovimientosController);
    service = module.get<MovimientosService>(MovimientosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll(mockTenant, 1, 10, 'search', 1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).toHaveBeenCalledWith(mockTenant, {
        page: 1,
        limit: 10,
        search: 'search',
        embarcacionId: 1,
      });
    });
  });

  describe('findOne', () => {
    it('should call service.findOne', async () => {
      await controller.findOne(mockTenant, '1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith(mockTenant, 1);
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { embarcacionId: 1, tipo: TipoMovimiento.ENTRADA };
      await controller.create(mockTenant, dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(mockTenant, dto);
    });
  });

  describe('remove', () => {
    it('should call service.remove', async () => {
      await controller.remove(mockTenant, '1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.remove).toHaveBeenCalledWith(mockTenant, 1);
    });
  });
});
