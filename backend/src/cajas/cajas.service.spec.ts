/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CajasService } from './cajas.service';
import { Caja, EstadoCaja } from './caja.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

describe('CajasService', () => {
  let service: CajasService;

  const mockCaja = {
    id: 1,
    saldoInicial: 1000,
    saldoFinal: 0,
    estado: EstadoCaja.ABIERTA,
    fechaApertura: new Date(),
    fechaCierre: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    manager: {
      transaction: jest.fn((callback) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        callback({
          findOne: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        }),
      ),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ totalRecaudado: '500', totalEfectivo: '300' }),
      })),
    },
  };

  const mockNotificacionesService = {
    createForRole: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CajasService,
        {
          provide: getRepositoryToken(Caja),
          useValue: mockRepository,
        },
        {
          provide: NotificacionesService,
          useValue: mockNotificacionesService,
        },
      ],
    }).compile();

    service = module.get<CajasService>(CajasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated cajas', async () => {
      mockRepository.find.mockResolvedValue([mockCaja]);

      const result = await service.findAll({});
      expect(result).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a caja by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCaja);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCaja);
    });

    it('should throw NotFoundException if caja not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAbierta', () => {
    it('should return open caja', async () => {
      mockRepository.findOne.mockResolvedValue(mockCaja);

      const result = await service.findAbierta();
      expect(result).toEqual(mockCaja);
    });

    it('should return null if no caja open', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findAbierta();
      expect(result).toBeNull();
    });
  });

  describe('abrir', () => {
    it('should open a new caja', async () => {
      mockRepository.manager.transaction.mockImplementation((callback: any) => {
        const tx = {
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockReturnValue(mockCaja),
          save: jest.fn().mockResolvedValue(mockCaja),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callback(tx);
      });

      const result = await service.abrir(1000);
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if caja already open', async () => {
      mockRepository.manager.transaction.mockImplementation((callback: any) => {
        const tx = {
          findOne: jest.fn().mockResolvedValue(mockCaja),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callback(tx);
      });

      await expect(service.abrir(1000)).rejects.toThrow(ConflictException);
    });
  });

  describe('cerrar', () => {
    it('should close a caja', async () => {
      mockRepository.manager.transaction.mockImplementation((callback: any) => {
        const tx = {
          findOne: jest.fn().mockResolvedValue(mockCaja),
          save: jest
            .fn()
            .mockResolvedValue({ ...mockCaja, estado: EstadoCaja.CERRADA }),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callback(tx);
      });

      const result = await service.cerrar(1, 1500);
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if caja already closed', async () => {
      const closedCaja = { ...mockCaja, estado: EstadoCaja.CERRADA };
      mockRepository.manager.transaction.mockImplementation((callback: any) => {
        const tx = {
          findOne: jest.fn().mockResolvedValue(closedCaja),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callback(tx);
      });

      await expect(service.cerrar(1, 1500)).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if caja not found', async () => {
      mockRepository.manager.transaction.mockImplementation((callback: any) => {
        const tx = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return callback(tx);
      });

      await expect(service.cerrar(999, 1500)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getResumen', () => {
    it('should return caja summary', async () => {
      mockRepository.findOne.mockResolvedValue(mockCaja);

      const result = await service.getResumen();
      expect(result).toEqual({
        id: 1,
        saldoInicial: 1000,
        totalRecaudado: 500,
        totalEfectivo: 300,
        fechaApertura: mockCaja.fechaApertura,
      });
    });

    it('should return null if no caja open', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getResumen();
      expect(result).toBeNull();
    });
  });
});
