import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoraService } from './mora.service';
import { Factura, EstadoFactura } from '../facturas/factura.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

describe('MoraService', () => {
  let service: MoraService;

  const mockTenant = {
    guarderiaId: 1,
    scope: 'guarderia' as any,
    role: 'SUPERADMIN' as any,
    userId: 1,
  } as any;

  const mockFactura = {
    id: 1,
    numero: 'FAC-0001',
    total: 100,
    estado: EstadoFactura.PENDIENTE,
    fechaVencimiento: new Date('2024-01-01'),
    interesMoratorio: 0,
    recargo: 0,
    cliente: { id: 1, nombre: 'Test Cliente' },
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockConfigService = {
    getValorNumerico: jest.fn().mockResolvedValue(3),
  };

  const mockNotificacionesService = {
    createForRole: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoraService,
        {
          provide: getRepositoryToken(Factura),
          useValue: mockRepository,
        },
        {
          provide: ConfiguracionService,
          useValue: mockConfigService,
        },
        {
          provide: NotificacionesService,
          useValue: mockNotificacionesService,
        },
      ],
    }).compile();

    service = module.get<MoraService>(MoraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConfiguracion', () => {
    it('should return mora config', async () => {
      mockConfigService.getValorNumerico
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);

      const result = await service.getConfiguracion(mockTenant);
      expect(result).toEqual({
        tasaInteres: 3,
        tasaRecargo: 10,
        diasGracia: 5,
      });
    });
  });

  describe('calcularMora', () => {
    it('should return zero mora for paid factura', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockFactura,
        estado: EstadoFactura.PAGADA,
      });

      const result = await service.calcularMora(mockTenant, 1);
      expect(result.totalMora).toBe(0);
    });

    it('should calculate mora for overdue factura', async () => {
      const fechaVencida = new Date();
      fechaVencida.setDate(fechaVencida.getDate() - 30);

      mockRepository.findOne.mockResolvedValue({
        ...mockFactura,
        fechaVencimiento: fechaVencida,
      });

      const result = await service.calcularMora(mockTenant, 1);
      expect(result).toBeDefined();
      expect(result.diasAtraso).toBeGreaterThan(0);
    });
  });

  describe('aplicarMora', () => {
    it('should throw error for paid factura', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockFactura,
        estado: EstadoFactura.PAGADA,
      });

      await expect(service.aplicarMora(mockTenant, 1)).rejects.toThrow();
    });

    it('should apply mora to overdue factura', async () => {
      const fechaVencida = new Date();
      fechaVencida.setDate(fechaVencida.getDate() - 30);

      mockRepository.findOne.mockResolvedValue({
        ...mockFactura,
        fechaVencimiento: fechaVencida,
      });
      mockRepository.update.mockResolvedValue({});
      mockRepository.findOne.mockResolvedValue({
        ...mockFactura,
        interesMoratorio: 10,
      });

      const result = await service.aplicarMora(mockTenant, 1);
      expect(result).toBeDefined();
    });
  });

  describe('getFacturasConMora', () => {
    it('should return facturas with mora', async () => {
      mockRepository.find.mockResolvedValue([mockFactura]);

      const result = await service.getFacturasConMora(mockTenant);
      expect(result).toBeDefined();
    });
  });
});
