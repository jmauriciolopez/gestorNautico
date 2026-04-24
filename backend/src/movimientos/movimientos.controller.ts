import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('movimientos')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('embarcacionId') embarcacionId?: number,
  ) {
    return this.movimientosService.findAll(tenant, {
      page,
      limit,
      search,
      embarcacionId,
    });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.movimientosService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: CreateMovimientoDto) {
    return this.movimientosService.create(tenant, data);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.movimientosService.remove(tenant, +id);
  }
}
