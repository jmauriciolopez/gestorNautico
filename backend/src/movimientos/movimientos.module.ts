import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from './movimientos.entity';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { EmbarcacionesModule } from '../embarcaciones/embarcaciones.module';
import { EspaciosModule } from '../espacios/espacios.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movimiento]),
    EmbarcacionesModule,
    EspaciosModule,
  ],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}
