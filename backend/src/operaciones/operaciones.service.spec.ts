import { Test, TestingModule } from '@nestjs/testing';
import { OperacionesService } from './operaciones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SolicitudBajada, EstadoSolicitud } from './solicitud-bajada.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Pedido, EstadoPedido } from '../pedidos/pedidos.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { MovimientosService } from '../movimientos/movimientos.service';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OperacionesService', () => {
  let service: OperacionesService;

  const mockTenant = {
    guarderiaId: 1,
    scope: 'guarderia' as any,
    role: 'SUPERADMIN' as any,
    userId: 1,
  } as any;

  let solicitudRepo: any;
  let clienteRepo: any;
  let embarcacionRepo: any;
  let pedidoRepo: any;
  let notificacionesService: any;
  let movimientosService: any;
  let configuracionService: any;

  const mockSolicitud = {
    id: 1,
    cliente: { id: 1, nombre: 'Test', email: 'test@test.com' },
    embarcacion: { id: 1, nombre: 'Boat' },
    fechaHoraDeseada: new Date(),
    estado: EstadoSolicitud.PENDIENTE,
  };

  const mockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperacionesService,
        {
          provide: getRepositoryToken(SolicitudBajada),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Cliente), useFactory: mockRepository },
        {
          provide: getRepositoryToken(Embarcacion),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Pedido), useFactory: mockRepository },
        {
          provide: NotificacionesService,
          useValue: {
            createForRole: jest.fn(),
            sendEmailNotification: jest.fn(),
          },
        },
        {
          provide: MovimientosService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: ConfiguracionService,
          useValue: {
            getValor: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OperacionesService>(OperacionesService);
    solicitudRepo = module.get(getRepositoryToken(SolicitudBajada));
    clienteRepo = module.get(getRepositoryToken(Cliente));
    embarcacionRepo = module.get(getRepositoryToken(Embarcacion));
    pedidoRepo = module.get(getRepositoryToken(Pedido));
    notificacionesService = module.get(NotificacionesService);
    movimientosService = module.get(MovimientosService);
    configuracionService = module.get(ConfiguracionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPublic', () => {
    const dto = {
      dni: '12345678',
      matricula: 'MAT-001',
      fechaHoraDeseada: new Date(Date.now() + 3600000).toISOString(),
      observaciones: 'Test',
    };

    it('should create a request successfully', async () => {
      clienteRepo.findOne.mockResolvedValue({ id: 1, nombre: 'Test' });
      embarcacionRepo.findOne.mockResolvedValue({ id: 1, nombre: 'Boat' });
      solicitudRepo.findOne.mockResolvedValue(null);
      pedidoRepo.findOne.mockResolvedValue(null);
      configuracionService.getValor.mockImplementation((key) => {
        if (key === 'HORARIO_APERTURA') return '08:00';
        if (key === 'HORARIO_MAX_SUBIDA') return '20:00';
        return null;
      });
      solicitudRepo.create.mockReturnValue(mockSolicitud);
      solicitudRepo.save.mockResolvedValue(mockSolicitud);

      const result = await service.createPublic(mockTenant, dto);
      expect(result).toEqual(mockSolicitud);
      expect(notificacionesService.createForRole).toHaveBeenCalled();
    });

    it('should throw NotFoundException if client not found', async () => {
      clienteRepo.findOne.mockResolvedValue(null);
      await expect(service.createPublic(mockTenant, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if boat not found', async () => {
      clienteRepo.findOne.mockResolvedValue({ id: 1 });
      embarcacionRepo.findOne.mockResolvedValue(null);
      await expect(service.createPublic(mockTenant, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if active solicitud exists', async () => {
      clienteRepo.findOne.mockResolvedValue({ id: 1 });
      embarcacionRepo.findOne.mockResolvedValue({ id: 1 });
      solicitudRepo.findOne.mockResolvedValue({ id: 2 });
      await expect(service.createPublic(mockTenant, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if active pedido exists', async () => {
      clienteRepo.findOne.mockResolvedValue({ id: 1 });
      embarcacionRepo.findOne.mockResolvedValue({ id: 1 });
      solicitudRepo.findOne.mockResolvedValue(null);
      pedidoRepo.findOne.mockResolvedValue({ id: 3 });
      await expect(service.createPublic(mockTenant, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if outside operating hours', async () => {
      clienteRepo.findOne.mockResolvedValue({ id: 1 });
      embarcacionRepo.findOne.mockResolvedValue({ id: 1 });
      solicitudRepo.findOne.mockResolvedValue(null);
      pedidoRepo.findOne.mockResolvedValue(null);
      configuracionService.getValor.mockImplementation((key) => {
        if (key === 'HORARIO_APERTURA') return '22:00';
        if (key === 'HORARIO_MAX_SUBIDA') return '23:00';
        return null;
      });
      await expect(service.createPublic(mockTenant, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockData = [[mockSolicitud], 1];
      solicitudRepo.findAndCount.mockResolvedValue(mockData);

      const result = await service.findAll(mockTenant);
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });

    it('should filter by estado', async () => {
      const mockData = [[mockSolicitud], 1];
      solicitudRepo.findAndCount.mockResolvedValue(mockData);

      await service.findAll(mockTenant, {}, EstadoSolicitud.PENDIENTE);
      expect(solicitudRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { estado: EstadoSolicitud.PENDIENTE },
        }),
      );
    });
  });

  describe('updateEstado', () => {
    it('should update state and create movement for EN_AGUA', async () => {
      solicitudRepo.findOne.mockResolvedValue(mockSolicitud);
      await service.updateEstado(mockTenant, 1, EstadoSolicitud.EN_AGUA);

      expect(solicitudRepo.update).toHaveBeenCalledWith(1, {
        estado: EstadoSolicitud.EN_AGUA,
      });
      expect(movimientosService.create).toHaveBeenCalled();
    });

    it('should update state and create movement for FINALIZADA', async () => {
      solicitudRepo.findOne.mockResolvedValue(mockSolicitud);
      await service.updateEstado(mockTenant, 1, EstadoSolicitud.FINALIZADA);

      expect(solicitudRepo.update).toHaveBeenCalledWith(1, {
        estado: EstadoSolicitud.FINALIZADA,
      });
      expect(movimientosService.create).toHaveBeenCalled();
    });

    it('should handle email sending error gracefully', async () => {
      solicitudRepo.findOne.mockResolvedValue(mockSolicitud);
      notificacionesService.sendEmailNotification.mockRejectedValue(
        new Error('Email error'),
      );

      await service.updateEstado(mockTenant, 1, EstadoSolicitud.EN_AGUA);

      expect(solicitudRepo.update).toHaveBeenCalled();
      // Should not throw
    });

    it('should throw NotFoundException if solicitud not found', async () => {
      solicitudRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateEstado(mockTenant, 1, EstadoSolicitud.EN_AGUA),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('processDelayedConfirmations', () => {
    it('should process pending confirmations', async () => {
      const solWithEmail = {
        ...mockSolicitud,
        cliente: { email: 'test@test.com', nombre: 'Test' },
      };
      solicitudRepo.find.mockResolvedValue([solWithEmail]);

      await service.processDelayedConfirmations();

      expect(notificacionesService.sendEmailNotification).toHaveBeenCalled();
      expect(solicitudRepo.update).toHaveBeenCalled();
    });

    it('should handle email error in cron job', async () => {
      const solWithEmail = {
        ...mockSolicitud,
        cliente: { email: 'test@test.com', nombre: 'Test' },
      };
      solicitudRepo.find.mockResolvedValue([solWithEmail]);
      notificacionesService.sendEmailNotification.mockRejectedValue(
        new Error('Cron email error'),
      );

      await service.processDelayedConfirmations();

      // Should not throw, should log error (mocked as no-op or handled by logger)
      expect(solicitudRepo.update).not.toHaveBeenCalledWith(1, {
        emailConfirmado: true,
      });
    });

    it('should mark as confirmed if no email', async () => {
      const solNoEmail = {
        ...mockSolicitud,
        cliente: { email: null, nombre: 'Test' },
      };
      solicitudRepo.find.mockResolvedValue([solNoEmail]);

      await service.processDelayedConfirmations();

      expect(solicitudRepo.update).toHaveBeenCalledWith(1, {
        emailConfirmado: true,
      });
    });
  });
});
