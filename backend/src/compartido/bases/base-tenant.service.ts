import { NotFoundException } from '@nestjs/common';
import { Role } from '../../users/user.entity';
import { TenantContext } from '../interfaces/tenant-context.interface';

export abstract class BaseTenantService {
  protected buildTenantWhere(
    tenant: TenantContext,
    extraWhere: Record<string, unknown> = {},
  ): Record<string, unknown> {
    if (tenant.role === Role.SUPERADMIN && tenant.scope === 'global') {
      return { ...extraWhere };
    }

    return {
      ...extraWhere,
      guarderiaId: tenant.guarderiaId,
    };
  }

  protected ensureTenantRecord<T>(
    record: T | null | undefined,
    message = 'Registro no encontrado',
  ): T {
    if (!record) {
      throw new NotFoundException(message);
    }

    return record;
  }
}
