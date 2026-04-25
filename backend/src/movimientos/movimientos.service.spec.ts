import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosService } from './movimientos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movimiento, TipoMovimiento } from './movimientos.entity';
import { Pedido, EstadoPedido } from '../pedidos/pedidos.entity';
import {
  SolicitudBajada,
  EstadoSolicitud,
} from '../operaciones/solicitud-bajada.entity';
import { EmbarcacionesService } from '../embarcaciones/embarcaciones.service';
import { EspaciosService } from '../espacios/espacios.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotFoundException } from '@nestjs/common';
import { EstadoEmbarcacion } from '../embarcaciones/embarcaciones.entity';

describe('MovimientosService', () => {
  let service: MovimientosService;

  const mockTenant = {
    guarderiaId: 1,
    scope: 'guarderia' as any,
    role: 'SUPERADMIN' as any,
    userId: 1,
  } as any;

  let movimientoRepo: any;
  let pedidoRepo: any;
  let solicitudRepo: any;
  let embarcacionesService: any;
  let espaciosService: any;
  let configuracionService: any;
  let notificacionesService: any;

  const mockMovimiento = {
    id: 1,
    tipo: TipoMovimiento.ENTRADA,
    fecha: new Date(),
    embarcacion: { id: 1, nombre: 'Test Boat' },
  };

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientosService,
        { provide: getRepositoryToken(Movimiento), useFactory: mockRepository },
        { provide: getRepositoryToken(Pedido), useFactory: mockRepository },
        {
          provide: getRepositoryToken(SolicitudBajada),
          useFactory: mockRepository,
        },
        {
          provide: EmbarcacionesService,
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: EspaciosService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ConfiguracionService,
          useValue: {
            getValor: jest.fn(),
          },
        },
        {
          provide: NotificacionesService,
          useValue: {
            createForRole: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MovimientosService>(MovimientosService);
    movimientoRepo = module.get(getRepositoryToken(Movimiento));
    pedidoRepo = module.get(getRepositoryToken(Pedido));
    solicitudRepo = module.get(getRepositoryToken(SolicitudBajada));
    embarcacionesService = module.get(EmbarcacionesService);
    espaciosService = module.get(EspaciosService);
    configuracionService = module.get(ConfiguracionService);
    notificacionesService = module.get(NotificacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated movements', async () => {
      const mockData = [[mockMovimiento], 1];
      movimientoRepo.findAndCount.mockResolvedValue(mockData);

      const result = await service.findAll(mockTenant);
      expect(result.data).toEqual([mockMovimiento]);
      expect(result.total).toBe(1);
    });

    it('should filter by search', async () => {
      movimientoRepo.findAndCount.mockResolvedValue([[], 0]);
      await service.findAll(mockTenant, { search: 'test' });
      expect(movimientoRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Array),
        }),
      );
    });

    it('should filter by embarcacionId', async () => {
      movimientoRepo.findAndCount.mockResolvedValue([[], 0]);
      await service.findAll(mockTenant, { embarcacionId: 1 });
      expect(movimientoRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { embarcacion: { id: 1 } },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a movement', async () => {
      movimientoRepo.findOne.mockResolvedValue(mockMovimiento);
      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockMovimiento);
    });

    it('should throw NotFoundException if movement not found', async () => {
      movimientoRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(mockTenant, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const dto = {
      embarcacionId: 1,
      tipo: TipoMovimiento.ENTRADA,
      observaciones: 'Test',
    };

    beforeEach(() => {
      embarcacionesService.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Boat',
        espacio: { id: 10 },
      });
      movimientoRepo.create.mockReturnValue(mockMovimiento);
      movimientoRepo.save.mockResolvedValue(mockMovimiento);
      configuracionService.getValor.mockResolvedValue('18:00');
    });

    it('should create an ENTRADA movement and update boat status', async () => {
      pedidoRepo.findOne.mockResolvedValue(null);
      solicitudRepo.findOne.mockResolvedValue(null);

      const result = await service.create(mockTenant, dto);
      expect(result).toBeDefined();
      expect(embarcacionesService.update).toHaveBeenCalledWith(
        1,
        { estado_operativo: EstadoEmbarcacion.EN_CUNA },
        undefined,
      );
      expect(pedidoRepo.create).toHaveBeenCalled();
      expect(pedidoRepo.save).toHaveBeenCalled();
    });

    it('should handle ENTRADA movement with existing pedido', async () => {
      pedidoRepo.findOne.mockResolvedValue({ id: 5 });

      await service.create(mockTenant, dto);
      expect(pedidoRepo.update).toHaveBeenCalledWith(5, {
        estado: EstadoPedido.FINALIZADO,
      });
    });

    it('should handle ENTRADA movement with existing solicitud', async () => {
      pedidoRepo.findOne.mockResolvedValue(null);
      solicitudRepo.findOne.mockResolvedValue({ id: 8 });

      await service.create(mockTenant, dto);
      expect(solicitudRepo.update).toHaveBeenCalledWith(8, {
        estado: EstadoSolicitud.FINALIZADA,
      });
    });

    it('should mark as fueraHora if after hours', async () => {
      // Mocking "now" to be late (20:00 local time)
      const realDate = global.Date;
      const mockDate = jest.fn(() => {
        const d = new realDate('2026-04-24T20:00:00'); // No Z, should be interpreted as local or at least high enough
        return d;
      });
      mockDate.prototype = realDate.prototype;
      global.Date = mockDate as any;

      configuracionService.getValor.mockResolvedValue('18:00');

      await service.create(mockTenant, dto);
      expect(movimientoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fueraHora: true,
        }),
      );

      global.Date = realDate;
    });

    it('should handle SALIDA movement with existing pedido', async () => {
      const salidaDto = { ...dto, tipo: TipoMovimiento.SALIDA };
      pedidoRepo.findOne.mockResolvedValue({ id: 5 });

      await service.create(mockTenant, salidaDto);
      expect(pedidoRepo.update).toHaveBeenCalledWith(5, {
        estado: EstadoPedido.EN_AGUA,
      });
    });

    it('should handle SALIDA movement with existing solicitud', async () => {
      const salidaDto = { ...dto, tipo: TipoMovimiento.SALIDA };
      pedidoRepo.findOne.mockResolvedValue(null);
      solicitudRepo.findOne.mockResolvedValue({ id: 8 });

      await service.create(mockTenant, salidaDto);
      expect(solicitudRepo.update).toHaveBeenCalledWith(8, {
        estado: EstadoSolicitud.EN_AGUA,
      });
    });

    it('should create a SALIDA movement and update boat status', async () => {
      const salidaDto = { ...dto, tipo: TipoMovimiento.SALIDA };
      pedidoRepo.findOne.mockResolvedValue(null);
      solicitudRepo.findOne.mockResolvedValue(null);

      await service.create(mockTenant, salidaDto);
      expect(embarcacionesService.update).toHaveBeenCalledWith(
        1,
        { estado_operativo: EstadoEmbarcacion.EN_AGUA },
        undefined,
      );
      expect(pedidoRepo.create).toHaveBeenCalled();
    });

    it('should use manager if provided', async () => {
      const mockManager = {
        getRepository: jest.fn().mockReturnValue(movimientoRepo),
      };
      await service.create(mockTenant, dto, mockManager as any);
      expect(mockManager.getRepository).toHaveBeenCalledWith(Movimiento);
    });

    it('should handle missing space correctly', async () => {
      embarcacionesService.findOne.mockResolvedValue({
        id: 1,
        nombre: 'Boat',
        espacio: null,
      });
      const noSpaceDto = { ...dto, espacioId: null };

      await service.create(mockTenant, noSpaceDto);
      expect(movimientoRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          espacio: null,
        }),
      );
    });

    it('should remove a movement', async () => {
      movimientoRepo.findOne.mockResolvedValue(mockMovimiento);
      await service.remove(mockTenant, 1);
      expect(movimientoRepo.remove).toHaveBeenCalledWith(mockMovimiento);
    });
  });
});
