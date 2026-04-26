import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../users/user.entity';

import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { AllowGlobal } from '../compartido/decorators/allow-global.decorator';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Controller('dashboard')
@UseGuards(AuthTokenGuard, TenantGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @AllowGlobal()
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getSummary(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getSummary(tenant);
  }

  @Get('recaudacion')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getRecaudacion(
    @ActiveTenant() tenant: TenantContext,
    @Query('periodo') periodo: 'dia' | 'semana' | 'mes' = 'mes',
  ) {
    return this.dashboardService.getRecaudacionPorPeriodo(tenant, periodo);
  }

  @Get('deuda')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getDeuda(
    @ActiveTenant() tenant: TenantContext,
    @Query('periodo') periodo: 'dia' | 'semana' | 'mes' | 'vencido' = 'mes',
  ) {
    return this.dashboardService.getDeudaPorPeriodo(tenant, periodo);
  }

  @Get('rack-map')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async getRackMap(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getRackMap(tenant);
  }

  @Get('gerencial/ocupacion')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getOccupancyMetrics(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getOccupancyMetrics(tenant);
  }

  @Get('gerencial/rentabilidad')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getHistoricalProfitability(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getHistoricalProfitability(tenant);
  }

  @Get('gerencial/picos-demanda')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getDemandPeaks(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getDemandPeaks(tenant);
  }

  @Get('gerencial/tiempo-cobro')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getAverageCollectionTime(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getAverageCollectionTime(tenant);
  }

  @Get('gerencial/arpu')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getRevenuePerMeter(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getRevenuePerMeter(tenant);
  }

  @Get('gerencial/vip-clients')
  @TenantRoles(Role.ADMIN, Role.SUPERVISOR)
  async getTopVIPClients(@ActiveTenant() tenant: TenantContext) {
    return this.dashboardService.getTopVIPClients(tenant);
  }
}
