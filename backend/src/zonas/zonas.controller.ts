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
import { ZonasService } from './zonas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

import { Zona } from './zona.entity';

@Controller('zonas')
@UseGuards(AuthTokenGuard, RolesGuard)
export class ZonasController {
  constructor(private readonly zonasService: ZonasService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.zonasService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.zonasService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() data: Partial<Zona>) {
    return this.zonasService.create(data);
  }

  @Put(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() data: Partial<Zona>) {
    return this.zonasService.update(+id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.zonasService.remove(+id);
  }
}
