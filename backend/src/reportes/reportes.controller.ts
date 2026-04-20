import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('reportes')
@UseGuards(AuthTokenGuard, RolesGuard)
@Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('morosos')
  getClientesMorosos() {
    return this.reportesService.getClientesMorosos();
  }

  @Get('mensualidades')
  getMensualidades() {
    return this.reportesService.getMensualidadesConDescuentos();
  }
}
