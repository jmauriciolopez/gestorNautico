import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { CreateSolicitudBajadaDto } from './dto/create-solicitud-bajada.dto';
import { EstadoSolicitud } from './solicitud-bajada.entity';
import { Public } from '../auth/decorators/public.decorator';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly operacionesService: OperacionesService) {}

  @Public()
  @Post('bajada-publica')
  @HttpCode(HttpStatus.CREATED)
  async createSolicitudPublica(@Body() dto: CreateSolicitudBajadaDto) {
    return this.operacionesService.createPublic(dto);
  }

  @Get('solicitudes')
  @UseGuards(AuthTokenGuard)
  async findAllSolicitudes(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.operacionesService.findAll({ page, limit });
  }

  @Patch('solicitudes/:id/estado')
  @UseGuards(AuthTokenGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async updateEstadoSolicitud(
    @Param('id') id: string,
    @Body('estado') estado: EstadoSolicitud,
    @Body('motivo') motivo?: string,
  ) {
    return this.operacionesService.updateEstado(+id, estado, motivo);
  }
}
