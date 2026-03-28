import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

import { Catalogo } from './catalogo.entity';

@Controller('catalogo')
@UseGuards(AuthTokenGuard, RolesGuard)
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findAll() {
    return this.catalogoService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.catalogoService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  create(@Body() data: Partial<Catalogo>) {
    return this.catalogoService.create(data);
  }

  @Put(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  update(@Param('id') id: string, @Body() data: Partial<Catalogo>) {
    return this.catalogoService.update(+id, data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.catalogoService.remove(+id);
  }
}
