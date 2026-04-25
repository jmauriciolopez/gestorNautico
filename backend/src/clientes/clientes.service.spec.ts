import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { Cliente } from './clientes.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

describe('ClientesService', () => {
  let service: ClientesService;

  const mockTenant = {
    guarderiaId: 1,
    scope: 'guarderia' as any,
    role: 'SUPERADMIN' as any,
    userId: 1,
  } as any;

  const mockCliente = {
    id: 1,
    nombre: 'Test Cliente',
    dni: '12345678',
    email: 'test@example.com',
    telefono: '1234567890',
    activo: true,
    diaFacturacion: 1,
    descuento: 0,
    tipoCuota: 'NINGUNA',
    responsableFamiliaId: null,
    tarifaBase: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const getMockQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({}),
    getRawMany: jest.fn().mockResolvedValue([]),
  });

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => getMockQueryBuilder()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: getRepositoryToken(Cliente),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Cargo),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Pago),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Embarcacion),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated clients', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockCliente], 1]);

      const result = await service.findAll(mockTenant, {});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });

    it('should filter by search term', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockCliente], 1]);

      await service.findAll(mockTenant, { search: 'Test' });
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCliente);

      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockCliente);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTenant, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      mockRepository.create.mockReturnValue(mockCliente);
      mockRepository.save.mockResolvedValue(mockCliente);

      const createDto = {
        nombre: 'Test Cliente',
        dni: '12345678',
      };

      const result = await service.create(mockTenant, createDto);
      expect(result).toEqual(mockCliente);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a client', async () => {
      mockRepository.findOne.mockResolvedValue(mockCliente);
      mockRepository.save.mockResolvedValue({
        ...mockCliente,
        nombre: 'Updated',
      });

      await service.update(mockTenant, 1, { nombre: 'Updated' });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a client', async () => {
      mockRepository.findOne.mockResolvedValue(mockCliente);
      mockRepository.save.mockResolvedValue({ ...mockCliente, activo: false });

      await service.remove(mockTenant, 1);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getCuentaCorriente', () => {
    it('should return cuenta corriente for client', async () => {
      mockRepository.findOne.mockResolvedValue(mockCliente);
      const qb = getMockQueryBuilder();
      // First call (cargoAgg)
      qb.getRawOne.mockResolvedValueOnce({
        total: '100',
        cantidad: '1',
        impagos: '0',
      });
      // Second call (pagoAgg)
      qb.getRawOne.mockResolvedValueOnce({
        total: '50',
        ultimaFecha: new Date(),
      });
      // Third call (vencidoAgg)
      qb.getRawOne.mockResolvedValueOnce({ total: '0' });

      mockRepository.createQueryBuilder.mockReturnValue(qb);
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getCuentaCorriente(mockTenant, 1);
      expect(result).toBeDefined();
      expect(result.totalCargado).toBe(100);
      expect(result.totalPagado).toBe(50);
    });
  });
});
