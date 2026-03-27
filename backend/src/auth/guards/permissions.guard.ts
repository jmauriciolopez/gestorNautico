import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../../users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Superadmin has all permissions
    if (user.role === Role.SUPERADMIN) {
      return true;
    }

    // Check if user has at least one of the required permissions
    const hasPermission = requiredPermissions.some((permission) => {
      // Mapping permission string to user payload property
      // e.g., 'noticias:crear' -> user.permisoCrearNoticias
      let userHasIt = false;

      switch (permission) {
        case 'noticias:crear':
          userHasIt = !!user.permisoCrearNoticias;
          break;
        case 'noticias:editar':
          userHasIt = !!user.permisoEditarNoticias;
          break;
        case 'noticias:eliminar':
          userHasIt = !!user.permisoEliminarNoticias;
          break;
        case 'preportada:gestionar':
          userHasIt = !!user.permisoPreportada;
          break;
        case 'comentarios:gestionar':
          userHasIt = !!user.permisoComentarios;
          break;
        default:
          userHasIt = false;
      }

      return userHasIt;
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para realizar esta acción',
      );
    }

    return true;
  }
}
