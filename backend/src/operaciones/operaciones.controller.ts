import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { CreateSolicitudBajadaDto } from './dto/create-solicitud-bajada.dto';
import { Public } from '../auth/decorators/public.decorator';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard'; // For private routes

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
  async findAllSolicitudes() {
    return this.operacionesService.findAll();
  }
}
