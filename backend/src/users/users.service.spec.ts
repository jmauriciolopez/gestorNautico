import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User, Role } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 1,
    usuario: 'testuser',
    email: 'test@example.com',
    nombre: 'Test User',
    clave: 'password123',
    rol: Role.ADMIN,
    activo: true,
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockUser]),
    findOneBy: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest
      .fn()
      .mockImplementation((user) => Promise.resolve({ ...user, id: 1 })),
    merge: jest
      .fn()
      .mockImplementation((user: object, dto: object) =>
        Object.assign(user, dto),
      ),
    remove: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce(null);
      const dto = {
        usuario: 'newuser',
        email: 'new@example.com',
        clave: 'abc',
        nombre: 'New',
      };
      const result = await service.create(dto as CreateUserDto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('should throw ConflictException if username exists', async () => {
      const dto = { usuario: 'testuser' };
      await expect(service.create(dto as CreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { nombre: 'Updated' };
      const result = await service.update(1, dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.nombre).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const result = await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalled();
      expect(result.message).toBe('Usuario eliminado correctamente');
    });
  });
});
