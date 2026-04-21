import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { CajasService } from './cajas.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { AbrirCajaDto, CerrarCajaDto } from './dto/caja-operacion.dto';

@Controller('cajas')
@UseGuards(AuthTokenGuard, RolesGuard)
export class CajasController {
  constructor(private readonly cajasService: CajasService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.cajasService.findAll({ page, limit });
  }

  @Get('abierta')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAbierta() {
    return this.cajasService.findAbierta();
  }

  @Get('resumen')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  getResumen() {
    return this.cajasService.getResumen();
  }

  @Post('abrir')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  abrir(@Body() dto: AbrirCajaDto) {
    return this.cajasService.abrir(dto.saldoInicial ?? 0);
  }

  @Patch(':id/cerrar')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  cerrar(@Param('id') id: string, @Body() dto: CerrarCajaDto) {
    return this.cajasService.cerrar(+id, dto.saldoFinal);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  findOne(@Param('id') id: string) {
    return this.cajasService.findOne(+id);
  }
}
