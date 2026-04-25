import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/user.entity';
import { ALLOW_GLOBAL_KEY } from '../decorators/allow-global.decorator';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { JwtUser, TenantContext } from '../interfaces/tenant-context.interface';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser | undefined;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const allowGlobal = this.reflector.getAllAndOverride<boolean>(
      ALLOW_GLOBAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    const headerTenant = this.normalizeTenantId(
      request.headers['x-guarderia-id'],
    );
    const queryTenant = this.normalizeTenantId(request.query?.guarderiaId);
    const requestedGuarderiaId = headerTenant || queryTenant || null;

    const tenant = this.resolveTenant(
      user,
      requestedGuarderiaId ? parseInt(requestedGuarderiaId, 10) : null,
      !!allowGlobal,
    );

    request.tenant = tenant;
    return true;
  }

  private resolveTenant(
    user: JwtUser,
    requestedGuarderiaId: number | null,
    allowGlobal: boolean,
  ): TenantContext {
    const userId = user.id;

    if (user.role === Role.SUPERADMIN) {
      if (!requestedGuarderiaId && allowGlobal) {
        return {
          guarderiaId: null,
          scope: 'global',
          role: user.role,
          userId,
        };
      }

      if (!requestedGuarderiaId && !allowGlobal) {
        throw new ForbiddenException(
          'Debe indicar x-guarderia-id para operar en este endpoint',
        );
      }

      return {
        guarderiaId: requestedGuarderiaId,
        scope: 'guarderia',
        role: user.role,
        userId,
      };
    }

    // Para otros roles, el guarderiaId viene fijo del usuario/JWT
    const assignedGuarderiaId = user.guarderiaId || null;

    if (!assignedGuarderiaId) {
      throw new ForbiddenException('Usuario sin guardería asignada');
    }

    if (requestedGuarderiaId && requestedGuarderiaId !== assignedGuarderiaId) {
      throw new ForbiddenException('No tienes acceso a esta guardería');
    }

    return {
      guarderiaId: assignedGuarderiaId,
      scope: 'guarderia',
      role: user.role,
      userId,
    };
  }

  private normalizeTenantId(value: unknown): string | null {
    if (Array.isArray(value)) {
      return value[0] ? String(value[0]) : null;
    }

    if (value === undefined || value === null || value === '') {
      return null;
    }

    return String(value);
  }
}
