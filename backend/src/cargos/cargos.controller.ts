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
import { CargosService } from './cargos.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('cargos')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clienteId') clienteId?: string,
    @Query('soloSinFacturar') soloSinFacturar?: string,
  ) {
    return this.cargosService.findAll(
      tenant,
      { page, limit },
      clienteId ? +clienteId : undefined,
      soloSinFacturar === 'true',
    );
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.cargosService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: CreateCargoDto) {
    return this.cargosService.create(tenant, data);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.cargosService.remove(tenant, +id);
  }
}
