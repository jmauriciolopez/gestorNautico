import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

import { AuthResponse } from './auth-response.entity';
import { UsersService } from '../users/users.service';

import { ConfigService } from '@nestjs/config';
import { LoginAttemptsService } from './login-attempts.service';
import { SignupDto } from './dto/signup.dto';
import { DataSource } from 'typeorm';
import { Guarderia } from '../guarderias/guarderia.entity';
import { User } from '../users/user.entity';
import { Role } from '../users/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly dataSource: DataSource,
  ) {}

  async login(
    loginDto: LoginDto,
    ip: string = 'unknown',
  ): Promise<AuthResponse> {
    const identifier = loginDto.identifier;

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
      guarderiaId: user.guarderiaId,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      expiresIn: Number(this.configService.get('JWT_EXPIRES_IN')) || 3600,
      guarderiaId: user.guarderiaId,
    };
  }

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Crear Guardería
      const guarderiaRepo = manager.getRepository(Guarderia);
      const nuevaGuarderia = guarderiaRepo.create({
        nombre: signupDto.nombre,
        contacto: signupDto.contacto,
        trialStartedAt: new Date(),
        finalizoOnboarding: false,
        activo: true,
      });
      const guarderiaGuardada = await guarderiaRepo.save(nuevaGuarderia);

      // 2. Crear Administrador
      const salt = await bcrypt.genSalt();
      const hashedClave = await bcrypt.hash(signupDto.adminPassword, salt);

      const userRepo = manager.getRepository(User);
      const adminUser = userRepo.create({
        usuario: signupDto.adminUsuario,
        email: signupDto.adminEmail,
        clave: hashedClave,
        nombre: signupDto.contacto, // Map contact name to admin name
        role: Role.ADMIN,
        guarderiaId: guarderiaGuardada.id,
        activo: true,
      });
      const userGuardado = await userRepo.save(adminUser);

      // 3. Generar Token
      const payload = {
        sub: userGuardado.id,
        usuario: userGuardado.usuario,
        role: userGuardado.role,
        nombre: userGuardado.nombre,
        guarderiaId: userGuardado.guarderiaId,
      };

      return {
        accessToken: await this.jwtService.signAsync(payload),
        expiresIn: Number(this.configService.get('JWT_EXPIRES_IN')) || 3600,
        guarderiaId: userGuardado.guarderiaId,
      };
    });
  }

  async getInternalUser(id: number) {
    return this.usersService.findById(id);
  }
}
