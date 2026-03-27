import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';

@Controller('operaciones')
export class OperacionesController {
  constructor(private readonly operacionesService: OperacionesService) {}

  // --- PEDIDOS ---
  @Get('pedidos')
  findAllPedidos() {
    return this.operacionesService.findAllPedidos();
  }

  @Get('pedidos/:id')
  findOnePedido(@Param('id', ParseIntPipe) id: number) {
    return this.operacionesService.findOnePedido(id);
  }

  @Post('pedidos')
  createPedido(@Body() data: any) {
    return this.operacionesService.createPedido(data);
  }

  @Put('pedidos/:id')
  updatePedido(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.operacionesService.updatePedido(id, data);
  }

  @Delete('pedidos/:id')
  deletePedido(@Param('id', ParseIntPipe) id: number) {
    return this.operacionesService.deletePedido(id);
  }

  // --- MOVIMIENTOS ---
  @Get('movimientos')
  findAllMovimientos() {
    return this.operacionesService.findAllMovimientos();
  }

  @Post('movimientos')
  createMovimiento(@Body() data: any) {
    return this.operacionesService.createMovimiento(data);
  }

  @Delete('movimientos/:id')
  deleteMovimiento(@Param('id', ParseIntPipe) id: number) {
    return this.operacionesService.deleteMovimiento(id);
  }
}
