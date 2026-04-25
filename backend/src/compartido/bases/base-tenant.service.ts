import { NotFoundException, BadRequestException } from '@nestjs/common';
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

  /**
   * Aplica un filtro de guarderiaId al QueryBuilder si el scope no es global.
   */
  protected applyTenantFilter<T>(
    queryBuilder: any,
    tenant: TenantContext,
    alias: string,
  ) {
    if (tenant.role === Role.SUPERADMIN && tenant.scope === 'global') {
      return queryBuilder;
    }

    return queryBuilder.andWhere(`${alias}.guarderiaId = :gId`, {
      gId: tenant.guarderiaId,
    });
  }

  /**
   * Verifica que un registro pertenezca al tenant actual.
   * Útil para validar IDs pasados en DTOs.
   */
  protected validateTenantAccess(tenant: TenantContext, record: any): boolean {
    if (tenant.role === Role.SUPERADMIN && tenant.scope === 'global') {
      return true;
    }

    return record && Number(record.guarderiaId) === Number(tenant.guarderiaId);
  }

  /**
   * Valida que una relación (ej: ubicacionId) pertenezca al mismo tenant.
   */
  protected async validateRelation(
    repository: any,
    tenant: TenantContext,
    id: number | string | undefined | null,
    relationName: string,
  ) {
    if (!id) return;
    const record = await repository.findOne({
      where: this.buildTenantWhere(tenant, { id }),
    });
    if (!record) {
      throw new BadRequestException(
        `${relationName} inválido o no pertenece a esta guardería`,
      );
    }
    return record;
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
