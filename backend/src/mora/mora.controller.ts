import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MoraService, MoraResultado } from './mora.service';
import { Factura } from '../facturas/factura.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { Role } from '../users/user.entity';
import { ActiveTenant } from '../auth/decorators/active-tenant.decorator';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';
import { AuthTokenGuard } from '../auth/guards/AuthTokenGuard';

@Controller('mora')
@UseGuards(AuthTokenGuard, TenantGuard)
@TenantRoles(Role.SUPERADMIN, Role.ADMIN, Role.SUPERVISOR)
export class MoraController {
  constructor(
    private readonly moraService: MoraService,
    private readonly configService: ConfiguracionService,
  ) {}

  @Get('configuracion')
  async getConfiguracion(@ActiveTenant() tenant: TenantContext) {
    return this.moraService.getConfiguracion(tenant);
  }

  @Put('configuracion')
  async updateConfiguracion(
    @ActiveTenant() tenant: TenantContext,
    @Body()
    body: {
      tasaInteres?: number;
      tasaRecargo?: number;
      diasGracia?: number;
    },
  ) {
    const updates: Record<string, string> = {};

    if (body.tasaInteres !== undefined) {
      updates['MORA_TASA_INTERES'] = body.tasaInteres.toString();
    }
    if (body.tasaRecargo !== undefined) {
      updates['MORA_TASA_RECARGO'] = body.tasaRecargo.toString();
    }
    if (body.diasGracia !== undefined) {
      updates['MORA_DIAS_GRACIA'] = body.diasGracia.toString();
    }

    return this.configService.updateMultiple(tenant, updates);
  }

  @Get('facturas/vencidas')
  async getFacturasVencidas(@ActiveTenant() tenant: TenantContext) {
    return this.moraService.getFacturasVencidasSinMora(tenant);
  }

  @Get('facturas/con-mora')
  async getFacturasConMora(@ActiveTenant() tenant: TenantContext) {
    return this.moraService.getFacturasConMora(tenant);
  }

  @Get('factura/:id')
  async calcularMora(
    @ActiveTenant() tenant: TenantContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MoraResultado> {
    return this.moraService.calcularMora(tenant, id);
  }

  @Post('factura/:id/aplicar')
  async aplicarMora(
    @ActiveTenant() tenant: TenantContext,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Factura> {
    return this.moraService.aplicarMora(tenant, id);
  }

  @Post('aplicar-automaticamente')
  @TenantRoles(Role.SUPERADMIN)
  async aplicarMoraAutomaticamente(): Promise<{ actualizadas: number }> {
    const actualizadas = await this.moraService.aplicarMoraAutomaticamente();
    return { actualizadas };
  }
}
