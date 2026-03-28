import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { EmbarcacionesService } from './embarcaciones.service';
import { Embarcacion } from './embarcaciones.entity';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('embarcaciones')
@UseGuards(AuthTokenGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
export class EmbarcacionesController {
  constructor(private readonly embarcacionesService: EmbarcacionesService) {}

  @Get()
  findAll() {
    return this.embarcacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.embarcacionesService.findOne(+id);
  }

  @Post()
  create(@Body() createEmbarcacionDto: Partial<Embarcacion>) {
    return this.embarcacionesService.create(createEmbarcacionDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateEmbarcacionDto: Partial<Embarcacion>) {
    return this.embarcacionesService.update(+id, updateEmbarcacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.embarcacionesService.remove(+id);
  }
}
