import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtUser } from '../../compartido/interfaces/tenant-context.interface';

interface RequestWithUser extends Request {
  user?: JwtUser;
  guarderiaId?: number;
}

@Injectable()
export class AuthTokenGuard implements CanActivate {
  private readonly logger = new Logger(AuthTokenGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Extraer y adjuntar guarderiaId del header siempre, incluso en rutas públicas
    const guarderiaId = request.headers['x-guarderia-id'];
    if (guarderiaId) {
      request.guarderiaId = parseInt(guarderiaId as string, 10);
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const token = this.extractToken(request);

    if (!token) {
      this.logger.warn('Token ausente en la petición');
      throw new UnauthorizedException('Token no encontrado');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync<JwtUser>(token, {
        secret,
      });

      // Adjuntar usuario al request
      request.user = payload;

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Token inválido: ${message}`);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const cookies = (request as any).cookies;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return cookies?.['token'] as string;
  }
}
