import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmbarcacionesService } from './embarcaciones.service';
import { Embarcacion } from './embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';

describe('EmbarcacionesService', () => {
  let service: EmbarcacionesService;

  const mockEmbarcacion = {
    id: 1,
    nombre: 'Test Boat',
    matricula: 'ABC-123',
    marca: 'Yamaha',
    modelo: '242X',
    eslora: 7.5,
    manga: 2.5,
    tipo: 'Lancha',
    estado_operativo: 'EN_CUNA',
    clienteId: 1,
    espacioId: null,
    descuento: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockRepository: any;
  let mockEspacioRepo: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findAndCount: jest.fn().mockResolvedValue([[mockEmbarcacion], 1]),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockEmbarcacion], 1]),
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      })),
    };

    mockEspacioRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbarcacionesService,
        {
          provide: getRepositoryToken(Embarcacion),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Espacio),
          useValue: mockEspacioRepo,
        },
      ],
    }).compile();

    service = module.get<EmbarcacionesService>(EmbarcacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated embarcaciones', async () => {
      const result = await service.findAll({});
      expect(result).toBeDefined();
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      await service.findAll({ search: 'Test' });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a embarcacion by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmbarcacion);

      const result = await service.findOne(1);
      expect(result).toEqual(mockEmbarcacion);
    });

    it('should throw NotFoundException if embarcacion not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new embarcacion', async () => {
      mockRepository.create.mockReturnValue(mockEmbarcacion);
      mockRepository.save.mockResolvedValue(mockEmbarcacion);
      mockEspacioRepo.findOne.mockResolvedValue(null);

      const createDto = {
        nombre: 'Test Boat',
        matricula: 'ABC-123',
      };

      const result = await service.create(createDto);
      expect(result).toEqual(mockEmbarcacion);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should validate dimensions against espacio', async () => {
      const espacio = { id: 1, rack: { largo: 5, ancho: 2 } };
      mockEspacioRepo.findOne.mockResolvedValue(espacio);

      await expect(
        service.create({
          nombre: 'Test Boat',
          matricula: 'ABC-123',
          espacioId: 1,
          eslora: 10,
          manga: 3,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a embarcacion', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmbarcacion);
      mockEspacioRepo.findOne.mockResolvedValue(null);
      // No need to overwrite createQueryBuilder if the global mock is sufficient

      const result = await service.update(1, { nombre: 'Updated' });
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should soft delete and free espacio', async () => {
      const embarcacionWithEspacio = {
        ...mockEmbarcacion,
        espacioId: 1,
        espacio: { id: 1 },
      };
      mockRepository.findOne.mockResolvedValue(embarcacionWithEspacio);
      mockRepository.save.mockResolvedValue({
        ...embarcacionWithEspacio,
        estado_operativo: 'INACTIVA',
        espacioId: null,
      });

      await service.remove(1);
      expect(mockEspacioRepo.update).toHaveBeenCalledWith(1, {
        ocupado: false,
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
