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
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('clientes')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
@TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
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
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.clientesService.findOne(tenant, +id);
  }

  @Get(':id/cuenta-corriente')
  getCuentaCorriente(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.clientesService.getCuentaCorriente(tenant, +id);
  }

  @Post()
  create(@ActiveTenant() tenant: TenantContext, @Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(tenant, createClienteDto);
  }

  @Put(':id')
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clientesService.update(tenant, +id, updateClienteDto);
  }

  @Delete(':id')
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.clientesService.remove(tenant, +id);
  }
}
