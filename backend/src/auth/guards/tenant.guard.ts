import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role } from '../../users/user.entity';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_GLOBAL_ROUTE_KEY } from '../decorators/global-route.decorator';
import {
  JwtUser,
  TenantContext,
} from '../../compartido/interfaces/tenant-context.interface';

interface RequestWithTenant extends Request {
  user: JwtUser;
  tenant: TenantContext;
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

    const isGlobal = this.reflector.getAllAndOverride<boolean>(
      IS_GLOBAL_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const user = request.user;
    const headerVal = request.headers['x-guarderia-id'];
    const guarderiaIdHeader = headerVal
      ? parseInt(headerVal as string, 10)
      : null;
    const method = request.method;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Definir si es una operación de escritura
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      method,
    );

    // Preparar el contexto del tenant
    const tenantContext: TenantContext = {
      userId: user.id,
      role: user.role,
      guarderiaId: null,
      scope: 'global',
    };

    // El SuperAdmin puede ver todo (global) si no envía header (GET),
    // pero para escribir DEBE seleccionar una guardería, a menos que la ruta sea Global.
    if (user.role === Role.SUPERADMIN) {
      if (isWriteOperation && !isGlobal && !guarderiaIdHeader) {
        throw new BadRequestException(
          'Para realizar esta operación debe seleccionar una guardería específica (Modo Global de escritura no permitido).',
        );
      }

      tenantContext.guarderiaId = guarderiaIdHeader;
      tenantContext.scope = guarderiaIdHeader ? 'guarderia' : 'global';
      request.tenant = tenantContext;
      return true;
    }

    // Si es una ruta global, permitimos el acceso sin header para otros roles también
    if (isGlobal) {
      tenantContext.guarderiaId = user.guarderiaId || guarderiaIdHeader || null;
      tenantContext.scope = tenantContext.guarderiaId ? 'guarderia' : 'global';
      request.tenant = tenantContext;
      return true;
    }

    // Para otros roles en rutas NO globales, el guarderiaId es obligatorio (del usuario o header)
    const assignedGuarderiaId = user.guarderiaId || null;

    if (!assignedGuarderiaId && !guarderiaIdHeader) {
      throw new ForbiddenException('Se requiere identificación de guardería');
    }

    const finalGuarderiaId = assignedGuarderiaId || guarderiaIdHeader;

    if (
      assignedGuarderiaId &&
      guarderiaIdHeader &&
      assignedGuarderiaId !== guarderiaIdHeader
    ) {
      throw new ForbiddenException('No tienes acceso a esta guardería');
    }

    tenantContext.guarderiaId = finalGuarderiaId;
    tenantContext.scope = 'guarderia';
    request.tenant = tenantContext;

    return true;
  }
}
