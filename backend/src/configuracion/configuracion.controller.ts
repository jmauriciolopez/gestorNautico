import { Controller, Get, Body, UseGuards, Put, Query } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('configuracion')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class ConfiguracionController {
  constructor(private readonly configService: ConfiguracionService) {}

  @Get()
  @TenantRoles(Role.ADMIN)
  async findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.configService.findAll(tenant, { page, limit });
  }

  @Put('bulk')
  @TenantRoles(Role.ADMIN)
  async updateMultiple(
    @ActiveTenant() tenant: TenantContext,
    @Body() updates: Record<string, string>,
  ) {
    return this.configService.updateMultiple(tenant, updates);
  }
}
