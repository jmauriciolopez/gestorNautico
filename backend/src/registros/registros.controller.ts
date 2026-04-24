import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { RegistrosService } from './registros.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { Role } from '../users/user.entity';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

import { RegistroServicio } from './registro.entity';

@Controller('registros')
@UseGuards(AuthTokenGuard, TenantGuard)
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('embarcacionId') embarcacionId?: string,
  ) {
    return this.registrosService.findAll(
      tenant,
      { page, limit },
      embarcacionId ? +embarcacionId : undefined,
    );
  }

  @Get(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.registrosService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  create(
    @ActiveTenant() tenant: TenantContext,
    @Body() data: Partial<RegistroServicio>,
  ) {
    return this.registrosService.create(tenant, data);
  }

  @Put(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() data: Partial<RegistroServicio>,
  ) {
    return this.registrosService.update(tenant, +id, data);
  }

  @Patch(':id/completar')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  complete(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body('costoFinal') costoFinal: number,
  ) {
    return this.registrosService.complete(tenant, +id, costoFinal);
  }

  @Delete(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.registrosService.remove(tenant, +id);
  }
}
