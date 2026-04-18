import { Controller, Get, Body, UseGuards, Put } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('configuracion')
@UseGuards(AuthTokenGuard, RolesGuard)
export class ConfiguracionController {
  constructor(private readonly configService: ConfiguracionService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  async findAll() {
    return this.configService.findAll();
  }

  @Put('bulk')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  async updateMultiple(@Body() updates: Record<string, string>) {
    return this.configService.updateMultiple(updates);
  }
}
