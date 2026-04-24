import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CargosService } from './cargos.service';
import { Cargo, TipoCargo } from './cargo.entity';

describe('CargosService', () => {
  let service: CargosService;

  const mockCargo = {
    id: 1,
    descripcion: 'Amarre Enero',
    monto: 100,
    fechaEmision: new Date(),
    fechaVencimiento: new Date(),
    pagado: false,
    tipo: TipoCargo.AMARRE,
    cliente: { id: 1 },
    factura: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargosService,
        {
          provide: getRepositoryToken(Cargo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CargosService>(CargosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated cargos', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockCargo], 1]);

      const result = await service.findAll({});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });

    it('should filter by clienteId', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockCargo], 1]);

      await service.findAll({}, 1);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });

    it('should filter sin facturar', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockCargo], 1]);

      await service.findAll({}, undefined, true);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a cargo by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCargo);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCargo);
    });

    it('should throw NotFoundException if cargo not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new cargo', async () => {
      mockRepository.create.mockReturnValue(mockCargo);
      mockRepository.save.mockResolvedValue(mockCargo);
      mockRepository.findOne.mockResolvedValue(mockCargo);

      const createDto = {
        descripcion: 'Amarre Enero',
        monto: 100,
        clienteId: 1,
        tipo: TipoCargo.AMARRE,
      };

      const result = await service.create(createDto);
      expect(result).toEqual(mockCargo);
    });
  });

  describe('setPagado', () => {
    it('should mark cargo as paid', async () => {
      mockRepository.update.mockResolvedValue({});
      mockRepository.findOne.mockResolvedValue({ ...mockCargo, pagado: true });

      await service.setPagado(1, true);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { pagado: true });
    });
  });

  describe('remove', () => {
    it('should delete a cargo', async () => {
      mockRepository.findOne.mockResolvedValue(mockCargo);
      mockRepository.remove.mockResolvedValue(mockCargo);

      await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalled();
    });
  });
});
