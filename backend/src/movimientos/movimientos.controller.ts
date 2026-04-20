import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller('movimientos')
@UseGuards(AuthTokenGuard, RolesGuard)
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.movimientosService.findAll({ page, limit });
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.movimientosService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  create(@Body() data: CreateMovimientoDto) {
    return this.movimientosService.create(data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.movimientosService.remove(+id);
  }
}
