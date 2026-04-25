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
import { UbicacionesService } from './ubicaciones.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

import { Ubicacion } from './ubicacion.entity';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';
import { GlobalRoute } from '../auth/decorators/global-route.decorator';

@Controller('ubicaciones')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
@GlobalRoute()
export class UbicacionesController {
  constructor(private readonly ubicacionesService: UbicacionesService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ubicacionesService.findAll(tenant, { page, limit });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.ubicacionesService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN)
  create(
    @ActiveTenant() tenant: TenantContext,
    @Body() data: Partial<Ubicacion>,
  ) {
    return this.ubicacionesService.create(tenant, data);
  }

  @Put(':id')
  @TenantRoles(Role.ADMIN)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() data: Partial<Ubicacion>,
  ) {
    return this.ubicacionesService.update(tenant, +id, data);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.ubicacionesService.remove(tenant, +id);
  }
}
