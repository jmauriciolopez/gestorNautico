import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { EspaciosService } from './espacios.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('espacios')
@UseGuards(AuthTokenGuard, RolesGuard)
export class EspaciosController {
  constructor(private readonly espaciosService: EspaciosService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findAll() {
    return this.espaciosService.findAll();
  }

  @Get('estadisticas')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  getEstadisticas() {
    return this.espaciosService.getEstadisticas();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.espaciosService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() data: any) {
    return this.espaciosService.create(data);
  }

  @Put(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  update(@Param('id') id: string, @Body() data: any) {
    return this.espaciosService.update(+id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.espaciosService.remove(+id);
  }
}
