import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      console.log('AuthTokenGuard: No se encontró token en la petición');
      throw new UnauthorizedException('Token no encontrado');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const payload: unknown = await this.jwtService.verifyAsync(token, {
        secret,
      });
      (request as Request & { user: unknown }).user = payload;
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.log('AuthTokenGuard: Error al verificar JWT:', message);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      return token;
    }
    return (request.cookies as Record<string, string>)?.['token'];
  }
}
