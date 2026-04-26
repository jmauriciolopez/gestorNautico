import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoEstadoDto } from './dto/update-pedido-estado.dto';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('pedidos')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.pedidosService.findAll(tenant, { page, limit });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.pedidosService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: CreatePedidoDto) {
    return this.pedidosService.create(tenant, data);
  }

  @Patch(':id/estado')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  updateEstado(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdatePedidoEstadoDto,
  ) {
    return this.pedidosService.updateEstado(tenant, +id, dto.estado);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.pedidosService.remove(tenant, +id);
  }
}
