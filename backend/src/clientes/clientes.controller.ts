import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('clientes')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('onlyActive') onlyActive?: boolean,
  ) {
    return this.clientesService.findAll(tenant, {
      page,
      limit,
      search,
      onlyActive:
        onlyActive === undefined ? true : String(onlyActive) === 'true',
    });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.clientesService.findOne(tenant, +id);
  }

  @Get(':id/cuenta-corriente')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  getCuentaCorriente(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
  ) {
    return this.clientesService.getCuentaCorriente(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  create(
    @ActiveTenant() tenant: TenantContext,
    @Body() createClienteDto: CreateClienteDto,
  ) {
    return this.clientesService.create(tenant, createClienteDto);
  }

  @Put(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(tenant, +id, updateClienteDto);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.clientesService.remove(tenant, +id);
  }
}
