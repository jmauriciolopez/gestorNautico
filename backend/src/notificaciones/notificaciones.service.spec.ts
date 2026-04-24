import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { Notificacion, NotificacionTipo } from './notificacion.entity';
import { User, Role } from '../users/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

describe('NotificacionesService', () => {
  let service: NotificacionesService;

  const mockNotificacion = {
    id: 1,
    titulo: 'Test Notification',
    mensaje: 'Test message',
    leida: false,
    tipo: NotificacionTipo.INFO,
    usuarioId: 1,
    createdAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        {
          provide: getRepositoryToken(Notificacion),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmailNotification', () => {
    it('should send email notification', async () => {
      await service.sendEmailNotification(
        'test@example.com',
        'Test Subject',
        'test-template',
        { name: 'Test' },
      );
      expect(mockMailerService.sendMail).toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return paginated notifications for user', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockNotificacion], 1]);

      const result = await service.findAllByUser(1, {});
      expect(result.data).toBeDefined();
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      mockRepository.create.mockReturnValue(mockNotificacion);
      mockRepository.save.mockResolvedValue(mockNotificacion);

      const result = await service.create({
        usuarioId: 1,
        titulo: 'Test Notification',
        mensaje: 'Test message',
      });
      expect(result).toEqual(mockNotificacion);
    });
  });

  describe('createForRole', () => {
    it('should create notifications for users with specific role', async () => {
      const mockUsers = [
        { id: 1, role: Role.ADMIN },
        { id: 2, role: Role.ADMIN },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);
      mockRepository.create.mockReturnValue(mockNotificacion);
      mockRepository.save.mockResolvedValue([
        mockNotificacion,
        mockNotificacion,
      ]);

      await service.createForRole(Role.ADMIN, {
        titulo: 'Test',
        mensaje: 'Test message',
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockRepository.findOne.mockResolvedValue(mockNotificacion);
      mockRepository.save.mockResolvedValue({
        ...mockNotificacion,
        leida: true,
      });

      const result = await service.markAsRead(1, 1);
      expect(result.leida).toBe(true);
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for user', async () => {
      mockRepository.update.mockResolvedValue({});

      await service.markAllAsRead(1);
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a notification', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1, 1);
      expect(mockRepository.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllRecentGlobal', () => {
    it('should return recent global notifications', async () => {
      mockRepository.find.mockResolvedValue([mockNotificacion]);

      const result = await service.findAllRecentGlobal();
      expect(result).toBeDefined();
    });
  });
});
