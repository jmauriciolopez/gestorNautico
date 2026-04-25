import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { Role } from '../users/user.entity';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('reportes')
@UseGuards(AuthTokenGuard, TenantGuard)
@TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('morosos')
  getClientesMorosos(@ActiveTenant() tenant: TenantContext): Promise<any[]> {
    return this.reportesService.getClientesMorosos(tenant);
  }

  @Get('mensualidades')
  getMensualidades(@ActiveTenant() tenant: TenantContext): Promise<any[]> {
    return this.reportesService.getMensualidadesConDescuentos(tenant);
  }

  @Get('ocupacion')
  getOcupacion(@ActiveTenant() tenant: TenantContext): Promise<any> {
    return this.reportesService.getOcupacion(tenant);
  }

  @Get('ingresos')
  getIngresos(
    @ActiveTenant() tenant: TenantContext,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any[]> {
    return this.reportesService.getIngresosMensuales(
      tenant,
      startDate,
      endDate,
    );
  }

  @Get('vencimientos')
  getVencimientos(@ActiveTenant() tenant: TenantContext): Promise<any[]> {
    return this.reportesService.getProximosVencimientos(tenant);
  }
}
