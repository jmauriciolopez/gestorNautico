import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { TENANT_ROLES_KEY } from '../decorators/tenant-roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const tenantRoles = this.reflector.getAllAndOverride<Role[]>(
      TENANT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles && !tenantRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Contexto de usuario no encontrado');
    }

    // El SUPERADMIN siempre pasa si hay roles definidos (a menos que se bloquee explícitamente)
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    // Verificar roles globales
    if (roles && roles.includes(user.role)) {
      return true;
    }

    // Verificar roles de tenant
    if (tenantRoles && tenantRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException(
      'No tienes los permisos necesarios para esta acción',
    );
  }
}
