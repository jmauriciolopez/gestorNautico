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
import { EmbarcacionesService } from './embarcaciones.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';
import { CreateEmbarcacionDto } from './dto/create-embarcacion.dto';
import { UpdateEmbarcacionDto } from './dto/update-embarcacion.dto';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('embarcaciones')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class EmbarcacionesController {
  constructor(private readonly embarcacionesService: EmbarcacionesService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.embarcacionesService.findAll(tenant, { page, limit, search });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.embarcacionesService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  create(
    @ActiveTenant() tenant: TenantContext,
    @Body() dto: CreateEmbarcacionDto,
  ) {
    return this.embarcacionesService.create(tenant, dto);
  }

  @Put(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateEmbarcacionDto,
  ) {
    return this.embarcacionesService.update(tenant, +id, dto);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.embarcacionesService.remove(tenant, +id);
  }
}
