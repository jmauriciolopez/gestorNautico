/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, Role } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;

  const mockTenant: TenantContext = {
    guarderiaId: 1,
    scope: 'guarderia',
    role: Role.SUPERADMIN,
    userId: 1,
  };

  const mockUser = {
    id: 1,
    usuario: 'testuser',
    email: 'test@example.com',
    nombre: 'Test User',
    clave: 'password123',
    role: Role.ADMIN,
    activo: true,
  };

  const mockRepository: Record<string, jest.Mock> = {
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockRepository.findAndCount.mockResolvedValue([[mockUser], 1]);
      const result = await service.findAll(mockTenant);
      expect(result.data).toEqual([mockUser]);
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockUser);
      const result = await service.findOne(mockTenant, 1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(mockTenant, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockRepository.findOneBy.mockResolvedValue(null); // No email conflict
      mockRepository.findOne.mockResolvedValue(null); // No username conflict
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue({ ...mockUser, id: 1 });

      const dto = {
        usuario: 'newuser',
        email: 'new@example.com',
        clave: 'abc',
        nombre: 'New',
      };
      const result = await service.create(mockTenant, dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should throw ConflictException if username exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(null); // No email conflict
      mockRepository.findOne.mockResolvedValue(mockUser); // Username conflict
      const dto = { usuario: 'testuser' };
      await expect(
        service.create(mockTenant, dto as CreateUserDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.merge.mockImplementation((user, dto) =>
        Object.assign(user, dto),
      );
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));

      const dto = { nombre: 'Updated' };
      const result = await service.update(mockTenant, 1, dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.nombre).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.remove.mockResolvedValue(mockUser);
      const result = await service.remove(mockTenant, 1);
      expect(mockRepository.remove).toHaveBeenCalled();
      expect(result.message).toBe('Usuario eliminado correctamente');
    });
  });
});
