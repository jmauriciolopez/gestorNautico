import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/user.entity';

@Controller('dashboard')
@UseGuards(AuthTokenGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('recaudacion')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  async getRecaudacion(
    @Query('periodo') periodo: 'dia' | 'semana' | 'mes' = 'mes',
  ) {
    return this.dashboardService.getRecaudacionPorPeriodo(periodo);
  }

  @Get('deuda')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
  async getDeuda(
    @Query('periodo') periodo: 'dia' | 'semana' | 'mes' | 'vencido' = 'mes',
  ) {
    return this.dashboardService.getDeudaPorPeriodo(periodo);
  }

  @Get('rack-map')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR, Role.OPERADOR)
  async getRackMap() {
    return this.dashboardService.getRackMap();
  }

  @Get('gerencial/ocupacion')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getOccupancyMetrics() {
    return this.dashboardService.getOccupancyMetrics();
  }

  @Get('gerencial/rentabilidad')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getHistoricalProfitability() {
    return this.dashboardService.getHistoricalProfitability();
  }

  @Get('gerencial/picos-demanda')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getDemandPeaks() {
    return this.dashboardService.getDemandPeaks();
  }

  @Get('gerencial/tiempo-cobro')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getAverageCollectionTime() {
    return this.dashboardService.getAverageCollectionTime();
  }

  @Get('gerencial/arpu')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getRevenuePerMeter() {
    return this.dashboardService.getRevenuePerMeter();
  }

  @Get('gerencial/vip-clients')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  async getTopVIPClients() {
    return this.dashboardService.getTopVIPClients();
  }
}
