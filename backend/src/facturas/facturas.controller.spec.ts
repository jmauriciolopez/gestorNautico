import { Test, TestingModule } from '@nestjs/testing';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EstadoFactura } from './factura.entity';
import { PdfService } from '../common/pdf/pdf.service';

import { Role } from '../users/user.entity';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

describe('FacturasController', () => {
  let controller: FacturasController;

  const mockTenant: TenantContext = {
    guarderiaId: 1,
    scope: 'guarderia',
    role: Role.SUPERADMIN,
    userId: 1,
  };

  let service: FacturasService;

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
            downloadPdfPublic: jest.fn(),
          },
        },
        {
          provide: PdfService,
          useValue: {
            generateFactura: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthTokenGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<FacturasController>(FacturasController);
    service = module.get<FacturasService>(FacturasService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      await controller.findAll(
        mockTenant,
        1,
        10,
        'search',
        '2024-01-01',
        '2024-01-31',
        'false',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).toHaveBeenCalledWith(mockTenant, {
        page: 1,
        limit: 10,
        search: 'search',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        soloReportados: false,
      });
    });
  });

  describe('getStats', () => {
    it('should call service.getStats', async () => {
      await controller.getStats(mockTenant, '2024-01-01', '2024-01-31');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.getStats).toHaveBeenCalledWith(
        mockTenant,
        '2024-01-01',
        '2024-01-31',
      );
    });
  });

  describe('create', () => {
    it('should call service.create', async () => {
      const dto = { clienteId: 1, cargoIds: [1], fechaEmision: '2024-01-01' };
      await controller.create(mockTenant, dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(mockTenant, dto);
    });
  });

  describe('updateEstado', () => {
    it('should call service.updateEstado', async () => {
      const dto = { estado: EstadoFactura.PAGADA };
      await controller.updateEstado(mockTenant, '1', dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.updateEstado).toHaveBeenCalledWith(
        mockTenant,
        1,
        dto.estado,
        undefined,
      );
    });
  });

  describe('sendEmail', () => {
    it('should call service.sendEmail', async () => {
      await controller.sendEmail(mockTenant, '1', { email: 'test@test.com' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.sendEmail).toHaveBeenCalledWith(
        mockTenant,
        1,
        'test@test.com',
      );
    });
  });
});
