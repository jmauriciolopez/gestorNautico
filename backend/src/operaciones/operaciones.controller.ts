import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { CreateSolicitudBajadaDto } from './dto/create-solicitud-bajada.dto';
import { UpdateEstadoSolicitudDto } from './dto/update-estado-solicitud.dto';
import { EstadoSolicitud } from './solicitud-bajada.entity';
import { Public } from '../auth/decorators/public.decorator';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly operacionesService: OperacionesService) {}

  @Public()
  @Post('bajada-publica')
  @HttpCode(HttpStatus.CREATED)
  async createSolicitudPublica(
    @ActiveTenant() tenant: TenantContext,
    @Body() dto: CreateSolicitudBajadaDto,
  ) {
    return this.operacionesService.createPublic(tenant, dto);
  }

  @Get('solicitudes')
  @UseGuards(AuthTokenGuard, TenantGuard)
  async findAllSolicitudes(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('estado') estado?: EstadoSolicitud,
  ) {
    return this.operacionesService.findAll(tenant, { page, limit }, estado);
  }

  @Patch('solicitudes/:id/estado')
  @UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async updateEstadoSolicitud(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateEstadoSolicitudDto,
  ) {
    return this.operacionesService.updateEstado(
      tenant,
      +id,
      dto.estado,
      dto.motivo,
    );
  }
}
