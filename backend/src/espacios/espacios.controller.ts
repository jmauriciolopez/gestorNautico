import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EspaciosService } from './espacios.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

import { Espacio } from './espacio.entity';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('espacios')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class EspaciosController {
  constructor(private readonly espaciosService: EspaciosService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.espaciosService.findAll(tenant, { page, limit });
  }

  @Post('sync')
  @Roles(Role.SUPERADMIN, Role.ADMIN) // Global roles for sync
  syncHealth() {
    return this.espaciosService.syncHealth();
  }

  @Get('estadisticas')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  getEstadisticas(@ActiveTenant() tenant: TenantContext) {
    return this.espaciosService.getEstadisticas(tenant);
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.espaciosService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: Partial<Espacio>) {
    return this.espaciosService.create(tenant, data);
  }

  @Put(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() data: Partial<Espacio>,
  ) {
    return this.espaciosService.update(tenant, +id, data);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.espaciosService.remove(tenant, +id);
  }
}
