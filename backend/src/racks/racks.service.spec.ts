import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RacksService } from './racks.service';
import { Rack } from './rack.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

import { Role } from '../users/user.entity';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

describe('RacksService', () => {
  let service: RacksService;

  const mockTenant: TenantContext = {
    guarderiaId: 1,
    scope: 'guarderia',
    role: Role.SUPERADMIN,
    userId: 1,
  };

  const mockRack = {
    id: 1,
    codigo: 'RACK-01',
    pisos: 1,
    filas: 2,
    columnas: 3,
    ancho: 5,
    alto: 3,
    largo: 10,
    tarifaBase: 100,
    zonaId: 1,
    zona: { id: 1, nombre: 'Zona Test' },
    espacios: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository: Record<string, jest.Mock> = {
    find: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockEspacioRepo: Record<string, jest.Mock> = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    delete: jest.fn(),
  };

  const mockEmbarcacionRepo: Record<string, jest.Mock> = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacksService,
        {
          provide: getRepositoryToken(Rack),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Espacio),
          useValue: mockEspacioRepo,
        },
        {
          provide: getRepositoryToken(Embarcacion),
          useValue: mockEmbarcacionRepo,
        },
      ],
    }).compile();

    service = module.get<RacksService>(RacksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated racks', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockRack], 1]);

      const result = await service.findAll(mockTenant, {});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a rack by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockRack);

      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockRack);
    });

    it('should throw NotFoundException if rack not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTenant, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new rack with espacios', async () => {
      mockRepository.create.mockReturnValue(mockRack);
      mockRepository.save.mockResolvedValue(mockRack);
      mockEspacioRepo.create.mockReturnValue({});
      mockEspacioRepo.save.mockResolvedValue([]);
      mockRepository.findOne.mockResolvedValue(mockRack);

      const createDto = {
        codigo: 'RACK-01',
        pisos: 1,
        filas: 2,
        columnas: 3,
      };

      const result = await service.create(mockTenant, createDto);
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update a rack', async () => {
      mockRepository.findOne.mockResolvedValue(mockRack);
      mockRepository.update.mockResolvedValue({});
      mockRepository.findOne.mockResolvedValue({
        ...mockRack,
        codigo: 'UPDATED',
      });

      const result = await service.update(mockTenant, 1, { codigo: 'UPDATED' });
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if grid changed with occupied espacios', async () => {
      const rackWithOcupados = {
        ...mockRack,
        espacios: [{ id: 1, ocupado: true }],
      };
      mockRepository.findOne.mockResolvedValue(rackWithOcupados);

      await expect(service.update(mockTenant, 1, { pisos: 2 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a rack without occupied espacios', async () => {
      const rackSinOcupados = { ...mockRack, espacios: [] };
      mockRepository.findOne.mockResolvedValue(rackSinOcupados);
      mockEspacioRepo.delete.mockResolvedValue({});
      mockRepository.delete.mockResolvedValue({});

      const result = await service.remove(mockTenant, 1);
      expect(result).toEqual({ success: true });
    });

    it('should throw BadRequestException if rack has occupied espacios', async () => {
      const rackConOcupados = {
        ...mockRack,
        espacios: [{ id: 1, ocupado: true }],
      };
      mockRepository.findOne.mockResolvedValue(rackConOcupados);

      await expect(service.remove(mockTenant, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if rack not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(mockTenant, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
