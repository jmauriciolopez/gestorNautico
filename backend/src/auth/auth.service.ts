import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

import { AuthResponse } from './auth-response.entity';
import { UsersService } from '../users/users.service';

import { ConfigService } from '@nestjs/config';
import { LoginAttemptsService } from './login-attempts.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loginAttemptsService: LoginAttemptsService,
  ) {}

  async login(
    loginDto: LoginDto,
    ip: string = 'unknown',
  ): Promise<AuthResponse> {
    const identifier = loginDto.nombre;

    this.loginAttemptsService.check(identifier, ip);

    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) {
      this.loginAttemptsService.recordFailure(identifier, ip);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.clave);

    if (!isPasswordValid) {
      this.loginAttemptsService.recordFailure(identifier, ip);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.activo) {
      this.loginAttemptsService.recordFailure(identifier, ip);
      throw new UnauthorizedException('Usuario inactivo');
    }

    this.loginAttemptsService.recordSuccess(identifier, ip);

    const payload = {
      sub: user.id,
      usuario: user.usuario,
      role: user.role,
      nombre: user.nombre,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: Number(this.configService.get('JWT_EXPIRES_IN')) || 3600,
    };
  }

  async getInternalUser(id: number) {
    return this.usersService.findById(id);
  }
}
