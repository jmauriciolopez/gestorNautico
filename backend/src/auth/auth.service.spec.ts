import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginAttemptsService } from './login-attempts.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    nombre: 'Test User',
    usuario: 'testuser',
    email: 'test@example.com',
    clave: 'password123',
    rol: 'admin',
    activo: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByIdentifier: jest.fn().mockResolvedValue(mockUser),
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
            recordAttempt: jest.fn().mockResolvedValue(true),
            isBlocked: jest.fn().mockResolvedValue(false),
            resetAttempts: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return a token for valid credentials', async () => {
      const loginDto = { nombre: 'testuser', password: 'password123' };
      const result = await service.login(loginDto);
      expect(result.accessToken).toBe('mock_token');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersService.findByIdentifier).toHaveBeenCalledWith('testuser');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { nombre: 'testuser', password: 'wrongpassword' };
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      (usersService.findByIdentifier as jest.Mock).mockResolvedValueOnce({
        ...mockUser,
        activo: false,
      });
      const loginDto = { nombre: 'testuser', password: 'password123' };
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (usersService.findByIdentifier as jest.Mock).mockResolvedValueOnce(null);
      const loginDto = { nombre: 'nonexistent', password: 'any' };
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
