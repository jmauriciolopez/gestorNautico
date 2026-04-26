import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginAttemptsService } from './login-attempts.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../users/user.entity';
import { DataSource } from 'typeorm';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  let usersService: UsersService;

  const user = {
    id: 1,
    identifier: 'testuser',
    clave: 'hashedPassword',
    role: Role.ADMIN,
    guarderiaId: 1,
    activo: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByIdentifier: jest.fn().mockResolvedValue(user),
            update: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock_token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_EXPIRES_IN') return 3600;
              return null;
            }),
          },
        },
        {
          provide: LoginAttemptsService,
          useValue: {
            check: jest.fn(),
            recordFailure: jest.fn(),
            recordSuccess: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const loginDto = { identifier: 'testuser', password: 'password123' };
      const result = await service.login(loginDto);
      expect(result.accessToken).toBe('mock_token');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findByIdentifier).toHaveBeenCalledWith('testuser');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
      const loginDto = { identifier: 'testuser', password: 'wrongpassword' };
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      (usersService.findByIdentifier as jest.Mock).mockResolvedValueOnce({
        ...user,
        activo: false,
      });
      const loginDto = { identifier: 'testuser', password: 'password123' };
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByIdentifier as jest.Mock).mockResolvedValueOnce(null);
      const loginDto = { identifier: 'nonexistent', password: 'any' };
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
