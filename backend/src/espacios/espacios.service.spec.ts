import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EspaciosService } from './espacios.service';
import { Espacio } from './espacio.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';

describe('EspaciosService', () => {
  let service: EspaciosService;

  const mockEspacio = {
    id: 1,
    numero: 'RACK-01-P1F1C1',
    ocupado: false,
    piso: 1,
    fila: 1,
    columna: 1,
    rackId: 1,
    rack: { id: 1, nombre: 'Rack Test' },
    embarcacion: null,
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
    count: jest.fn(),
  };

  const mockEmbarcacionRepo = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspaciosService,
        {
          provide: getRepositoryToken(Espacio),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Embarcacion),
          useValue: mockEmbarcacionRepo,
        },
      ],
    }).compile();

    service = module.get<EspaciosService>(EspaciosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated espacios', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockEspacio], 1]);

      const result = await service.findAll({});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a espacio by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockEspacio);

      const result = await service.findOne(1);
      expect(result).toEqual(mockEspacio);
    });

    it('should throw NotFoundException if espacio not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new espacio', async () => {
      mockRepository.create.mockReturnValue(mockEspacio);
      mockRepository.save.mockResolvedValue(mockEspacio);

      const createDto = { numero: 'RACK-01-P1F1C1', rackId: 1 };

      const result = await service.create(createDto);
      expect(result).toEqual(mockEspacio);
    });
  });

  describe('update', () => {
    it('should update a espacio', async () => {
      mockRepository.findOne.mockResolvedValue(mockEspacio);
      mockRepository.update.mockResolvedValue({});
      mockRepository.findOne
        .mockResolvedValueOnce(mockEspacio)
        .mockResolvedValueOnce({ ...mockEspacio, numero: 'UPDATED' });

      const result = await service.update(1, { numero: 'UPDATED' });
      expect(result).toBeDefined();
    });
  });

  describe('remove', () => {
    it('should delete a espacio', async () => {
      mockRepository.findOne.mockResolvedValue(mockEspacio);
      mockRepository.remove.mockResolvedValue(mockEspacio);

      await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalled();
    });

    it('should unlink embarcacion before deleting', async () => {
      const espacioConEmbarcacion = { ...mockEspacio, embarcacion: { id: 1 } };
      mockRepository.findOne.mockResolvedValue(espacioConEmbarcacion);
      mockRepository.remove.mockResolvedValue(espacioConEmbarcacion);

      await service.remove(1);
      expect(mockEmbarcacionRepo.update).toHaveBeenCalledWith(1, {
        espacioId: null,
      });
    });
  });

  describe('getEstadisticas', () => {
    it('should return estadisticas', async () => {
      mockRepository.count.mockResolvedValueOnce(100).mockResolvedValueOnce(60);

      const result = await service.getEstadisticas();
      expect(result).toEqual({
        total: 100,
        ocupados: 60,
        libres: 40,
        porcentajeOcupacion: 60,
      });
    });

    it('should handle zero total', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getEstadisticas();
      expect(result).toEqual({
        total: 0,
        ocupados: 0,
        libres: 0,
        porcentajeOcupacion: 0,
      });
    });
  });
});
