import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Patch, Query } from '@nestjs/common';
import { RegistrosService } from './registros.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('registros')
@UseGuards(AuthTokenGuard, RolesGuard)
export class RegistrosController {
  constructor(private readonly registrosService: RegistrosService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findAll(@Query('embarcacionId') embarcacionId?: string) {
    if (embarcacionId) {
      return this.registrosService.findByEmbarcacion(+embarcacionId);
    }
    return this.registrosService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.registrosService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  create(@Body() data: any) {
    return this.registrosService.create(data);
  }

  @Put(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  update(@Param('id') id: string, @Body() data: any) {
    return this.registrosService.update(+id, data);
  }

  @Patch(':id/completar')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  complete(@Param('id') id: string, @Body('costoFinal') costoFinal: number) {
    return this.registrosService.complete(+id, costoFinal);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.registrosService.remove(+id);
  }
}
