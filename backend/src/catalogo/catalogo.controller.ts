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
import { CatalogoService } from './catalogo.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { Role } from '../users/user.entity';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

import { Catalogo } from './catalogo.entity';

@Controller('catalogo')
@UseGuards(AuthTokenGuard, TenantGuard)
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get()
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.catalogoService.findAll(tenant, { page, limit });
  }

  @Get(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.catalogoService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: Partial<Catalogo>) {
    return this.catalogoService.create(tenant, data);
  }

  @Put(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() data: Partial<Catalogo>,
  ) {
    return this.catalogoService.update(tenant, +id, data);
  }

  @Delete(':id')
  @TenantRoles(Role.SUPERADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.catalogoService.remove(tenant, +id);
  }
}
