import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GuarderiaService } from '../../guarderias/guarderia.service';
import { Role } from '../../users/user.entity';
import { Request } from 'express';
import { TenantContext } from '../../compartido/interfaces/tenant-context.interface';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { Guarderia } from '../../guarderias/guarderia.entity';

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(
    private readonly guarderiaService: GuarderiaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // 1. Solo bloqueamos métodos de escritura
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const tenant = request['tenant'] as TenantContext | undefined;

    // 2. Si no hay contexto de tenant o es SuperAdmin global, permitir
    if (!tenant || !tenant.guarderiaId) {
      return true;
    }

    // SuperAdmin tiene bypass total
    if (tenant.role === Role.SUPERADMIN) {
      return true;
    }

    // 3. Obtener datos de la guardería para verificar el trial (usando caché)
    try {
      const cacheKey = `guarderia_trial_${tenant.guarderiaId}`;
      let guarderia = await this.cacheManager.get<Guarderia>(cacheKey);

      if (!guarderia) {
        guarderia = await this.guarderiaService.findOne(tenant.guarderiaId);
        await this.cacheManager.set(cacheKey, guarderia, 600000); // 10 minutos
      }

      // Si la guardería no está activa, bloqueamos todo lo que no sea lectura
      if (!guarderia.activo) {
        throw new ForbiddenException(
          'Esta organización se encuentra suspendida. Contacta a soporte.',
        );
      }

      // 4. Verificar expiración del trial (14 días)
      const trialDurationDays = 14;
      const trialStartDate = new Date(guarderia.trialStartedAt);
      const expirationDate = new Date(trialStartDate);
      expirationDate.setDate(expirationDate.getDate() + trialDurationDays);

      if (new Date() > expirationDate) {
        throw new ForbiddenException(
          'Tu período de prueba de 14 días ha expirado. La plataforma se encuentra en modo "Solo Lectura". Por favor, activa tu suscripción para continuar.',
        );
      }
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      // Si no encontramos la guardería, permitimos que otros guards (como TenantGuard) manejen el error
      return true;
    }

    return true;
  }
}
