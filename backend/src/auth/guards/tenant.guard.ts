import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_GLOBAL_ROUTE_KEY } from '../decorators/global-route.decorator';

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

    const isGlobal = this.reflector.getAllAndOverride<boolean>(
      IS_GLOBAL_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const guarderiaIdHeader = request.guarderiaId;
    const method = request.method;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Definir si es una operación de escritura
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      method,
    );

    // El SuperAdmin puede ver todo (global) si no envía header (GET), 
    // pero para escribir DEBE seleccionar una guardería, a menos que la ruta sea Global.
    if (user.role === Role.SUPERADMIN) {
      if (isWriteOperation && !isGlobal && !guarderiaIdHeader) {
        throw new BadRequestException(
          'Para realizar esta operación debe seleccionar una guardería específica (Modo Global de escritura no permitido).',
        );
      }
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
