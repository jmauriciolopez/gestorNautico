import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const guarderiaIdHeader = request.guarderiaId;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // El SuperAdmin puede ver todo (global) si no envía header, 
    // o filtrar por una guardería específica si la envía.
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    // Para otros roles, el guarderiaId es obligatorio y debe coincidir con el del usuario
    if (!guarderiaIdHeader) {
      throw new ForbiddenException('Se requiere identificación de guardería');
    }

    if (user.guarderiaId && user.guarderiaId !== guarderiaIdHeader) {
      throw new ForbiddenException('No tienes acceso a esta guardería');
    }

    return true;
  }
}
