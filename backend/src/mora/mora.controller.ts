import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { MoraService, MoraResultado } from './mora.service';
import { Factura } from '../facturas/factura.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';

@Controller('mora')
export class MoraController {
  constructor(
    private readonly moraService: MoraService,
    private readonly configService: ConfiguracionService,
  ) {}

  @Get('configuracion')
  async getConfiguracion() {
    return this.moraService.getConfiguracion();
  }

  @Put('configuracion')
  async updateConfiguracion(
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

    return this.configService.updateMultiple(updates);
  }

  @Get('facturas/vencidas')
  async getFacturasVencidas() {
    return this.moraService.getFacturasVencidasSinMora();
  }

  @Get('facturas/con-mora')
  async getFacturasConMora() {
    return this.moraService.getFacturasConMora();
  }

  @Get('factura/:id')
  async calcularMora(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MoraResultado> {
    return this.moraService.calcularMora(id);
  }

  @Post('factura/:id/aplicar')
  async aplicarMora(@Param('id', ParseIntPipe) id: number): Promise<Factura> {
    return this.moraService.aplicarMora(id);
  }

  @Post('aplicar-automaticamente')
  async aplicarMoraAutomaticamente(): Promise<{ actualizadas: number }> {
    const actualizadas = await this.moraService.aplicarMoraAutomaticamente();
    return { actualizadas };
  }
}
