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
import { CargosService } from './cargos.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';

@Controller('cargos')
@UseGuards(AuthTokenGuard, RolesGuard)
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('clienteId') clienteId?: string,
    @Query('soloSinFacturar') soloSinFacturar?: string,
  ) {
    return this.cargosService.findAll(
      { page, limit },
      clienteId ? +clienteId : undefined,
      soloSinFacturar === 'true',
    );
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  create(@Body() data: CreateCargoDto) {
    return this.cargosService.create(data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  remove(@Param('id') id: string) {
    return this.cargosService.remove(+id);
  }
}
