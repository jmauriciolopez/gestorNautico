import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('movimientos')
@UseGuards(AuthTokenGuard, RolesGuard)
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findAll() {
    return this.movimientosService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.movimientosService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  create(@Body() data: any) {
    return this.movimientosService.create(data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.movimientosService.remove(+id);
  }
}
