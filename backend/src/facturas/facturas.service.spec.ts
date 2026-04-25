import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FacturasService } from './facturas.service';
import { Factura, EstadoFactura } from './factura.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { Cliente } from '../clientes/clientes.entity';
import { CargosService } from '../cargos/cargos.service';
import { CajasService } from '../cajas/cajas.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { PdfService } from '../common/pdf/pdf.service';
import { DataSource, In } from 'typeorm';
import { TipoCargo } from '../cargos/cargo.entity';

describe('FacturasService', () => {
  let service: FacturasService;

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
    fechaEmision: new Date(),
    fechaVencimiento: new Date(),
    observaciones: null,
    interesMoratorio: 0,
    recargo: 0,
    cliente: { id: 1, nombre: 'Test Cliente', email: 'test@example.com' },
    cargos: [],
  };

  const dto = {
    clienteId: 1,
    cargoIds: [1],
    fechaEmision: new Date().toISOString(),
  };

  const mockManager = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((entity, data) => data),
    save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    update: jest.fn().mockResolvedValue({}),
  };

  const mockFacturaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockCargoRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockPagoRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockClienteRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockCargosService = {
    findOne: jest.fn(),
  };

  const mockCajasService = {
    findAbierta: jest.fn(),
  };

  const mockNotificacionesService = {
    createForRole: jest.fn().mockResolvedValue({}),
    sendEmailNotification: jest.fn().mockResolvedValue({}),
  };

  const mockPdfService = {
    generateInvoice: jest.fn().mockResolvedValue(Buffer.from('PDF')),
  };

  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset mock manager state
    mockManager.find.mockReset().mockResolvedValue([]);
    mockManager.findOne.mockReset().mockResolvedValue(null);
    mockManager.create.mockReset().mockImplementation((entity, data) => data);
    mockManager.save.mockReset().mockImplementation((data) => Promise.resolve(data));
    mockManager.update.mockReset().mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturasService,
        {
          provide: getRepositoryToken(Factura),
          useValue: mockFacturaRepository,
        },
        {
          provide: getRepositoryToken(Cargo),
          useValue: mockCargoRepository,
        },
        {
          provide: getRepositoryToken(Pago),
          useValue: mockPagoRepository,
        },
        {
          provide: getRepositoryToken(Cliente),
          useValue: mockClienteRepository,
        },
        {
          provide: CargosService,
          useValue: mockCargosService,
        },
        {
          provide: CajasService,
          useValue: mockCajasService,
        },
        {
          provide: NotificacionesService,
          useValue: mockNotificacionesService,
        },
        {
          provide: PdfService,
          useValue: mockPdfService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<FacturasService>(FacturasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated facturas', async () => {
      mockFacturaRepository.findAndCount.mockResolvedValue([[mockFactura], 1]);

      const result = await service.findAll(mockTenant, {});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });

    it('should filter by search term', async () => {
      mockFacturaRepository.findAndCount.mockResolvedValue([[mockFactura], 1]);

      await service.findAll(mockTenant, { search: 'FAC' });
      expect(mockFacturaRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      mockFacturaRepository.findAndCount.mockResolvedValue([[mockFactura], 1]);

      await service.findAll(mockTenant, { startDate: '2024-01-01', endDate: '2024-12-31' });
      expect(mockFacturaRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a factura by id', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);

      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockFactura);
    });

    it('should throw NotFoundException if factura not found', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTenant, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateNextNumero', () => {
    it('should generate next invoice number', async () => {
      mockFacturaRepository.find.mockResolvedValue([]);

      const result = await service.generateNextNumero(mockTenant);
      expect(result).toBe('FAC-0001');
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if no cargoIds', async () => {
      await expect(
        service.create(mockTenant, {
          clienteId: 1,
          cargoIds: [],
          fechaEmision: '2024-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if cargos don\'t belong to client', async () => {
      mockManager.find.mockResolvedValue([{ id: 1 }]); // Only 1 found
      await expect(service.create(mockTenant, dto)).rejects.toThrow(BadRequestException);
    });

    it('should retry generation on unique violation', async () => {
      mockManager.find.mockResolvedValue([{ id: 1, monto: 100 }, { id: 2, monto: 50 }]);
      mockManager.create.mockReturnValue(mockFactura);
      
      // First save fails with unique constraint
      mockManager.save.mockRejectedValueOnce({ code: '23505' });
      // Second save succeeds
      mockManager.save.mockResolvedValueOnce(mockFactura);
      
      const result = await service.create(mockTenant, { ...dto, numero: undefined });
      expect(result).toBeDefined();
      expect(mockManager.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateEstado', () => {
    it('should update state to PAGADA and register payment', async () => {
      const facturaWithCargos = { ...mockFactura, cargos: [{ id: 1 }], cliente: { id: 1, nombre: 'Test' } };
      mockManager.findOne.mockResolvedValue(facturaWithCargos);
      mockCajasService.findAbierta.mockResolvedValue({ id: 1 });
      mockManager.create.mockReturnValue({});

      await service.updateEstado(mockTenant, 1, EstadoFactura.PAGADA);

      expect(mockManager.update).toHaveBeenCalledWith(Factura, 1, { estado: EstadoFactura.PAGADA });
      expect(mockManager.update).toHaveBeenCalledWith(Cargo, { id: In([1]) }, { pagado: true });
      expect(mockManager.save).toHaveBeenCalled(); // Payment saved
    });

    it('should throw error if no caja open for paid state', async () => {
      mockManager.findOne.mockResolvedValue(mockFactura);
      mockCajasService.findAbierta.mockResolvedValue(null);
      await expect(service.updateEstado(mockTenant, 1, EstadoFactura.PAGADA)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update factura basic fields', async () => {
      mockManager.findOne.mockResolvedValue(mockFactura);
      mockManager.find.mockResolvedValue([]);
      
      await service.update(mockTenant, 1, { observaciones: 'Updated' });
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('should add new cargos to factura', async () => {
      mockManager.findOne.mockResolvedValue(mockFactura);
      mockManager.find.mockResolvedValue([{ id: 1, monto: 100 }]);
      
      await service.update(mockTenant, 1, { nuevosCargos: [{ descripcion: 'New', monto: 50, tipo: TipoCargo.OTROS }] });
      expect(mockManager.create).toHaveBeenCalled();
      expect(mockManager.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a factura', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);
      mockFacturaRepository.remove.mockResolvedValue(mockFactura);

      await service.remove(mockTenant, 1);
      expect(mockFacturaRepository.remove).toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    it('should throw BadRequestException if no email', async () => {
      mockFacturaRepository.findOne.mockResolvedValue({
        ...mockFactura,
        cliente: { ...mockFactura.cliente, email: null },
      });

      await expect(service.sendEmail(mockTenant, 1)).rejects.toThrow(BadRequestException);
    });

    it('should send email with factura', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);
      mockNotificacionesService.sendEmailNotification.mockResolvedValue({});

      const result = await service.sendEmail(mockTenant, 1);
      expect(result.success).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return stats with date filters', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { estado: EstadoFactura.PAGADA, total: '100', cantidad: '1' },
          { estado: EstadoFactura.PENDIENTE, total: '50', cantidad: '1' },
        ]),
      };
      mockFacturaRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.getStats(mockTenant, '2026-01-01', '2026-01-31');
      expect(result.TOTAL_PAGADO).toBe(100);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });
});
