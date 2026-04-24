import { Test, TestingModule } from '@nestjs/testing';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EstadoFactura } from './factura.entity';

describe('FacturasController', () => {
  let controller: FacturasController;
  let service: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacturasController],
      providers: [
        {
          provide: FacturasService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateEstado: jest.fn(),
            remove: jest.fn(),
            sendEmail: jest.fn(),
            getStats: jest.fn(),
          },
        },
        { provide: AuthTokenGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    })
    .compile();

    controller = module.get<FacturasController>(FacturasController);
    service = module.get<FacturasService>(FacturasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll(1, 10, 'search', '2024-01-01', '2024-01-31');
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10, search: 'search', startDate: '2024-01-01', endDate: '2024-01-31' });
    });
  });

  describe('getStats', () => {
    it('should call service.getStats', async () => {
      await controller.getStats('2024-01-01', '2024-01-31');
      expect(service.getStats).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { clienteId: 1, cargoIds: [1], fechaEmision: '2024-01-01' };
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateEstado', () => {
    it('should call service.updateEstado', async () => {
      const dto = { estado: EstadoFactura.PAGADA };
      await controller.updateEstado('1', dto);
      expect(service.updateEstado).toHaveBeenCalledWith(1, dto.estado, undefined);
    });
  });

  describe('sendEmail', () => {
    it('should call service.sendEmail', async () => {
      await controller.sendEmail('1', { email: 'test@test.com' });
      expect(service.sendEmail).toHaveBeenCalledWith(1, 'test@test.com');
    });
  });
});
