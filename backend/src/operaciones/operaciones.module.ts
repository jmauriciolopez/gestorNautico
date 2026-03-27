import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedidos.entity';
import { Movimiento } from './movimientos.entity';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, Movimiento])],
  providers: [OperacionesService],
  controllers: [OperacionesController],
  exports: [OperacionesService],
})
export class OperacionesModule {}
