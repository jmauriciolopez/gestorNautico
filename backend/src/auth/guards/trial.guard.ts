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

@Injectable()
export class TrialGuard implements CanActivate {
  constructor(private readonly guarderiaService: GuarderiaService) {}

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

    // 3. Obtener datos de la guardería para verificar el trial
    try {
      const guarderia = await this.guarderiaService.findOne(tenant.guarderiaId);

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
