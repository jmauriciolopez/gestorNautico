import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { CajasService } from './cajas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';
import { AbrirCajaDto, CerrarCajaDto } from './dto/caja-operacion.dto';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('cajas')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.cajasService.findAll(tenant, { page, limit });
  }

  @Get('abierta')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAbierta(@ActiveTenant() tenant: TenantContext) {
    return this.cajasService.findAbierta(tenant);
  }

  @Get('resumen')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  getResumen(@ActiveTenant() tenant: TenantContext) {
    return this.cajasService.getResumen(tenant);
  }

  @Post('abrir')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  abrir(@ActiveTenant() tenant: TenantContext, @Body() dto: AbrirCajaDto) {
    return this.cajasService.abrir(tenant, dto.saldoInicial ?? 0);
  }

  @Patch(':id/cerrar')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  cerrar(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: CerrarCajaDto,
  ) {
    return this.cajasService.cerrar(tenant, +id, dto.saldoFinal);
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.cajasService.findOne(tenant, +id);
  }
}
