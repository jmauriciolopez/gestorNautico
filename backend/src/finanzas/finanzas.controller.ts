import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { FinanzasService } from './finanzas.service';

@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  // --- CARGOS ---
  @Get('cargos')
  findAllCargos() {
    return this.finanzasService.findAllCargos();
  }

  @Post('cargos')
  createCargo(@Body() data: any) {
    return this.finanzasService.createCargo(data);
  }

  @Get('cargos/:id')
  findOneCargo(@Param('id', ParseIntPipe) id: number) {
    return this.finanzasService.findOneCargo(id);
  }

  // --- PAGOS ---
  @Get('pagos')
  findAllPagos() {
    return this.finanzasService.findAllPagos();
  }

  @Post('pagos')
  createPago(@Body() data: any) {
    return this.finanzasService.createPago(data);
  }

  // --- CAJA ---
  @Get('cajas')
  findAllCajas() {
    return this.finanzasService.findAllCajas();
  }

  @Get('caja/resumen')
  getCajaResumen() {
    return this.finanzasService.getCajaResumen();
  }
}
