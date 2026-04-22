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
      mockRepository.find.mockResolvedValue([mockCliente]);
      mockRepository.createQueryBuilder.mockReturnValue(getMockQueryBuilder());

      const result = await service.findAll({});
      expect(result).toBeDefined();
    });

    it('should filter by search term', async () => {
      mockRepository.find.mockResolvedValue([mockCliente]);

      await service.findAll({ search: 'Test' });
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a client by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCliente);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCliente);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
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

      const result = await service.create(createDto);
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

      await service.update(1, { nombre: 'Updated' });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete a client', async () => {
      mockRepository.findOne.mockResolvedValue(mockCliente);
      mockRepository.save.mockResolvedValue({ ...mockCliente, activo: false });

      await service.remove(1);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getCuentaCorriente', () => {
    it('should return cuenta corriente for client', async () => {
      mockRepository.findOne.mockResolvedValue(mockCliente);
      mockRepository.createQueryBuilder.mockReturnValue(getMockQueryBuilder());
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getCuentaCorriente(1);
      expect(result).toBeDefined();
      expect(result.totalCargado).toBe(100);
    });
  });
});
