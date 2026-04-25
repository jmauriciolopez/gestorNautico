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
import { RacksService } from './racks.service';
import { CreateRackDto } from './dto/create-rack.dto';
import { UpdateRackDto } from './dto/update-rack.dto';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';
import { GlobalRoute } from '../auth/decorators/global-route.decorator';

@Controller('racks')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
@GlobalRoute()
export class RacksController {
  constructor(private readonly racksService: RacksService) {}

  @Get()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.racksService.findAll(tenant, { page, limit });
  }

  @Get(':id')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.racksService.findOne(tenant, +id);
  }

  @Post()
  @TenantRoles(Role.ADMIN)
  create(@ActiveTenant() tenant: TenantContext, @Body() data: CreateRackDto) {
    return this.racksService.create(tenant, data);
  }

  @Put(':id')
  @TenantRoles(Role.ADMIN)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() data: UpdateRackDto,
  ) {
    return this.racksService.update(tenant, +id, data);
  }

  @Delete(':id')
  @TenantRoles(Role.ADMIN)
  remove(@ActiveTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.racksService.remove(tenant, +id);
  }
}
