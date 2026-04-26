import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../users/user.entity';
import { ALLOW_GLOBAL_KEY } from '../decorators/allow-global.decorator';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';
import { JwtUser, TenantContext } from '../interfaces/tenant-context.interface';

interface RequestWithTenant extends Request {
  user?: JwtUser;
  tenant?: TenantContext;
}

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

    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const user = request.user;

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
      const first = (value as unknown[])[0];
      if (first !== undefined && first !== null && first !== '') {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return String(first);
      }
      return null;
    }

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      typeof value === 'object'
    ) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return String(value);
  }
}
