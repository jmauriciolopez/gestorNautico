import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmbarcacionesService } from './embarcaciones.service';
import { Embarcacion } from './embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';
import { DataSource } from 'typeorm';

import { Role } from '../users/user.entity';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

describe('EmbarcacionesService', () => {
  let service: EmbarcacionesService;

  const mockTenant: TenantContext = {
    guarderiaId: 1,
    scope: 'guarderia',
    role: Role.SUPERADMIN,
    userId: 1,
  };

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

  let mockRepository: Record<string, jest.Mock>;
  let mockEspacioRepo: Record<string, jest.Mock>;
  let mockManager: Record<string, jest.Mock>;
  let mockDataSource: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockManager = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === Embarcacion) return mockRepository;
        if (entity === Espacio) return mockEspacioRepo;
        return null;
      }),
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockDataSource = {
      transaction: jest
        .fn()
        .mockImplementation((cb: (mgr: any) => any): any => cb(mockManager)),
    };

    mockRepository = {
      find: jest.fn(),
      findAndCount: jest.fn().mockResolvedValue([[mockEmbarcacion], 1]),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
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
        {
          provide: DataSource,
          useValue: mockDataSource,
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
      const result = await service.findAll(mockTenant, {});
      expect(result).toBeDefined();
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      await service.findAll(mockTenant, { search: 'Test' });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a embarcacion by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockEmbarcacion);

      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockEmbarcacion);
    });

    it('should throw NotFoundException if embarcacion not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTenant, 999)).rejects.toThrow(
        NotFoundException,
      );
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

      const result = await service.create(mockTenant, createDto);
      expect(result).toEqual(mockEmbarcacion);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should validate dimensions against espacio', async () => {
      const espacio = { id: 1, rack: { largo: 5, ancho: 2 } };
      mockEspacioRepo.findOne.mockResolvedValue(espacio);

      await expect(
        service.create(mockTenant, {
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

      const result = await service.update(mockTenant, 1, { nombre: 'Updated' });
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

      await service.remove(mockTenant, 1);
      expect(mockEspacioRepo.update).toHaveBeenCalledWith(1, {
        ocupado: false,
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
