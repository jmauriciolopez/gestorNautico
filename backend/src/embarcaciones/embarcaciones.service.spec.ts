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
    estado: 'EN_CUNA',
    clienteId: 1,
    espacioId: null,
    descuento: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
    })),
  };

  const mockEspacioRepo = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
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
      mockRepository.find.mockResolvedValue([mockEmbarcacion]);

      const result = await service.findAll({});
      expect(result).toBeDefined();
    });

    it('should filter by search term', async () => {
      mockRepository.find.mockResolvedValue([mockEmbarcacion]);

      await service.findAll({ search: 'Test' });
      expect(mockRepository.find).toHaveBeenCalled();
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
      mockRepository.createQueryBuilder.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      });

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
        estado: 'INACTIVA',
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
