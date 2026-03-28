import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('pagos')
@UseGuards(AuthTokenGuard, RolesGuard)
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findAll() {
    return this.pagosService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(+id);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.OPERADOR)
  create(@Body() data: Record<string, unknown>) {
    return this.pagosService.create(data);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.pagosService.remove(+id);
  }
}
