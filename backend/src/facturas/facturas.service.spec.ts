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

describe('FacturasService', () => {
  let service: FacturasService;

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

  const mockFacturaRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
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

  beforeEach(async () => {
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
      ],
    }).compile();

    service = module.get<FacturasService>(FacturasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated facturas', async () => {
      mockFacturaRepository.find.mockResolvedValue([mockFactura]);

      const result = await service.findAll({});
      expect(result).toBeDefined();
    });

    it('should filter by search term', async () => {
      mockFacturaRepository.find.mockResolvedValue([mockFactura]);

      await service.findAll({ search: 'FAC' });
      expect(mockFacturaRepository.find).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      mockFacturaRepository.find.mockResolvedValue([mockFactura]);

      await service.findAll({ startDate: '2024-01-01', endDate: '2024-12-31' });
      expect(mockFacturaRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a factura by id', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);

      const result = await service.findOne(1);
      expect(result).toEqual(mockFactura);
    });

    it('should throw NotFoundException if factura not found', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateNextNumero', () => {
    it('should generate next invoice number', async () => {
      mockFacturaRepository.find.mockResolvedValue([]);

      const result = await service.generateNextNumero();
      expect(result).toBe('FAC-0001');
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if no cargoIds', async () => {
      await expect(
        service.create({
          clienteId: 1,
          cargoIds: [],
          fechaEmision: '2024-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a factura with cargos', async () => {
      const mockCargo = {
        id: 1,
        descripcion: 'Amarre',
        monto: 100,
        cliente: { id: 1 },
      };
      mockCargoRepository.find.mockResolvedValue([mockCargo]);
      mockFacturaRepository.create.mockReturnValue(mockFactura);
      mockFacturaRepository.save.mockResolvedValue(mockFactura);
      mockCargoRepository.update.mockResolvedValue({});
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);

      const result = await service.create({
        clienteId: 1,
        cargoIds: [1],
        fechaEmision: '2024-01-01',
      });
      expect(result).toBeDefined();
    });
  });

  describe('updateEstado', () => {
    it('should throw error if no caja open for paid state', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);
      mockCajasService.findAbierta.mockResolvedValue(null);

      await expect(
        service.updateEstado(1, EstadoFactura.PAGADA),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a factura', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);
      mockFacturaRepository.remove.mockResolvedValue(mockFactura);

      await service.remove(1);
      expect(mockFacturaRepository.remove).toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    it('should throw BadRequestException if no email', async () => {
      mockFacturaRepository.findOne.mockResolvedValue({
        ...mockFactura,
        cliente: { ...mockFactura.cliente, email: null },
      });

      await expect(service.sendEmail(1)).rejects.toThrow(BadRequestException);
    });

    it('should send email with factura', async () => {
      mockFacturaRepository.findOne.mockResolvedValue(mockFactura);
      mockNotificacionesService.sendEmailNotification.mockResolvedValue({});

      const result = await service.sendEmail(1);
      expect(result.success).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      mockFacturaRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([
            { estado: EstadoFactura.PENDIENTE, total: '100', cantidad: '2' },
          ]),
      });

      const result = await service.getStats();
      expect(result).toBeDefined();
    });
  });
});
