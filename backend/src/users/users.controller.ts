import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Headers,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';

import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';
import { GlobalRoute } from '../auth/decorators/global-route.decorator';

@Controller('users')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  create(
    @ActiveTenant() tenant: TenantContext,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.create(tenant, createUserDto);
  }

  @Post('superadmin')
  @TenantRoles(Role.SUPERADMIN)
  @GlobalRoute()
  createSuperAdmin(
    @Body() createUserDto: CreateUserDto,
    @Headers('x-api-key') apiKey: string,
  ) {
    if (!process.env.API_KEY || apiKey !== process.env.API_KEY) {
      throw new UnauthorizedException('Invalid API Key');
    }
    return this.usersService.createSuperAdmin(createUserDto);
  }

  @Get()
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  findAll(
    @ActiveTenant() tenant: TenantContext,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll(tenant, { page, limit });
  }

  @Get(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  findOne(
    @ActiveTenant() tenant: TenantContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(tenant, id);
  }

  @Patch(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  update(
    @ActiveTenant() tenant: TenantContext,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(tenant, id, updateUserDto);
  }

  @Delete(':id')
  @TenantRoles(Role.SUPERADMIN, Role.ADMIN)
  remove(
    @ActiveTenant() tenant: TenantContext,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.remove(tenant, id);
  }
}
