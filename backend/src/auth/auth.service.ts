import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

import { AuthResponse } from './entities/auth-response.entity';
import { UsersService } from '../users/users.service';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByIdentifier(loginDto.nombre);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let isPasswordValid = await bcrypt.compare(loginDto.password, user.clave);

    // Auto-migración si la contraseña está en texto plano
    if (!isPasswordValid && !user.clave.startsWith('$2b$')) {
      if (loginDto.password === user.clave) {
        // La contraseña coincide en texto plano, vamos a migrarla a Bcrypt
        await this.usersService.update(user.id, { clave: loginDto.password });
        isPasswordValid = true;
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.rol,
      nombre: user.nombre,
      permisoCrearNoticias: user.permisoCrearNoticias,
      permisoEditarNoticias: user.permisoEditarNoticias,
      permisoEliminarNoticias: user.permisoEliminarNoticias,
      permisoPreportada: user.permisoPreportada,
      permisoComentarios: user.permisoComentarios,
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
