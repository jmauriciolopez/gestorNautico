import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ZonasService } from './zonas.service';
import { Zona } from './zona.entity';

import { Role } from '../users/user.entity';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

describe('ZonasService', () => {
  let service: ZonasService;

  const mockTenant: TenantContext = {
    guarderiaId: 1,
    scope: 'guarderia',
    role: Role.SUPERADMIN,
    userId: 1,
  };

  const mockZona = {
    id: 1,
    nombre: 'Zona Test',
    ubicacionId: 1,
    ubicacion: { id: 1, nombre: 'Ubicación 1' },
    racks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository: any = {
    find: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    manager: {
      getRepository: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ id: 1 }),
      }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ZonasService,
        {
          provide: getRepositoryToken(Zona),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ZonasService>(ZonasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated zonas', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockZona], 1]);

      const result = await service.findAll(mockTenant, {});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a zona by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockZona);

      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockZona);
    });

    it('should throw NotFoundException if zona not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(mockTenant, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new zona', async () => {
      mockRepository.create.mockReturnValue(mockZona);
      mockRepository.save.mockResolvedValue(mockZona);

      const createDto = { nombre: 'Zona Test' };

      const result = await service.create(mockTenant, createDto);
      expect(result).toEqual(mockZona);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        guarderiaId: mockTenant.guarderiaId,
      });
    });

    it('should convert ubicacionId 0 to null', async () => {
      mockRepository.create.mockImplementation((data: any): any => data);
      mockRepository.save.mockResolvedValue({ ...mockZona, ubicacionId: null });

      await service.create(mockTenant, { nombre: 'Zona Test', ubicacionId: 0 });
      expect(mockRepository.create).toHaveBeenCalledWith({
        nombre: 'Zona Test',
        ubicacionId: null,
        guarderiaId: mockTenant.guarderiaId,
      });
    });
  });

  describe('update', () => {
    it('should update a zona', async () => {
      mockRepository.findOne.mockResolvedValue(mockZona);
      mockRepository.update.mockResolvedValue({});
      mockRepository.findOne
        .mockResolvedValueOnce(mockZona)
        .mockResolvedValueOnce({ ...mockZona, nombre: 'Updated' });

      const result = await service.update(mockTenant, 1, { nombre: 'Updated' });
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a zona', async () => {
      mockRepository.findOne.mockResolvedValue(mockZona);
      mockRepository.remove.mockResolvedValue(mockZona);

      await service.remove(mockTenant, 1);
      expect(mockRepository.remove).toHaveBeenCalled();
    });
  });
});
