import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { Pago, MetodoPago } from './pago.entity';
import { CajasService } from '../cajas/cajas.service';
import { CargosService } from '../cargos/cargos.service';

describe('PagosService', () => {
  let service: PagosService;

  const mockTenant = {
    guarderiaId: 1,
    scope: 'guarderia' as any,
    role: 'SUPERADMIN' as any,
    userId: 1,
  } as any;

  const mockPago = {
    id: 1,
    monto: 100,
    fecha: new Date(),
    metodoPago: MetodoPago.EFECTIVO,
    comprobante: 'TEST-001',
    cliente: { id: 1 },
    caja: { id: 1 },
    cargo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockCajasService = {
    findOne: jest.fn(),
    findAbierta: jest.fn(),
  };

  const mockCargosService = {
    setPagado: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(Pago),
          useValue: mockRepository,
        },
        {
          provide: CajasService,
          useValue: mockCajasService,
        },
        {
          provide: CargosService,
          useValue: mockCargosService,
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated pagos', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockPago], 1]);

      const result = await service.findAll(mockTenant, {});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a pago by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockPago);

      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockPago);
    });

    it('should throw NotFoundException if pago not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTenant, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new pago', async () => {
      mockCajasService.findAbierta.mockResolvedValue({ id: 1 });
      mockRepository.create.mockReturnValue(mockPago);
      mockRepository.save.mockResolvedValue(mockPago);
      mockRepository.findOne.mockResolvedValue(mockPago);

      const createDto = {
        clienteId: 1,
        monto: 100,
        metodo: MetodoPago.EFECTIVO,
      };

      const result = await service.create(mockTenant, createDto);
      expect(result).toEqual(mockPago);
    });

    it('should throw NotFoundException if no caja abierta', async () => {
      mockCajasService.findAbierta.mockResolvedValue(null);

      const createDto = {
        clienteId: 1,
        monto: 100,
        metodo: MetodoPago.EFECTIVO,
      };

      await expect(service.create(mockTenant, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should mark cargo as paid when cargoId provided', async () => {
      mockCajasService.findAbierta.mockResolvedValue({ id: 1 });
      mockRepository.create.mockReturnValue({ ...mockPago, cargo: { id: 1 } });
      mockRepository.save.mockResolvedValue({ ...mockPago, cargo: { id: 1 } });
      mockRepository.findOne.mockResolvedValue({
        ...mockPago,
        cargo: { id: 1 },
      });

      const createDto = {
        clienteId: 1,
        monto: 100,
        metodo: MetodoPago.EFECTIVO,
        cargoId: 1,
      };

      await service.create(mockTenant, createDto);
      expect(mockCargosService.setPagado).toHaveBeenCalledWith(1, true);
    });
  });

  describe('remove', () => {
    it('should delete a pago and revert cargo status', async () => {
      const pagoWithCargo = { ...mockPago, cargo: { id: 1 } };
      mockRepository.findOne.mockResolvedValue(pagoWithCargo);
      mockRepository.remove.mockResolvedValue(pagoWithCargo);

      await service.remove(mockTenant, 1);
      expect(mockCargosService.setPagado).toHaveBeenCalledWith(1, false);
      expect(mockRepository.remove).toHaveBeenCalled();
    });

    it('should delete pago without cargo', async () => {
      mockRepository.findOne.mockResolvedValue(mockPago);
      mockRepository.remove.mockResolvedValue(mockPago);

      await service.remove(mockTenant, 1);
      expect(mockRepository.remove).toHaveBeenCalled();
      expect(mockCargosService.setPagado).not.toHaveBeenCalled();
    });
  });
});
