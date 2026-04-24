import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from './movimientos.entity';
import { Pedido } from '../pedidos/pedidos.entity';
import { SolicitudBajada } from '../operaciones/solicitud-bajada.entity';
import { MovimientosService } from './movimientos.service';
import { MovimientosController } from './movimientos.controller';
import { EmbarcacionesModule } from '../embarcaciones/embarcaciones.module';
import { EspaciosModule } from '../espacios/espacios.module';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movimiento, Pedido, SolicitudBajada]),
    EmbarcacionesModule,
    EspaciosModule,
    ConfiguracionModule,
    NotificacionesModule,
  ],
  controllers: [MovimientosController],
  providers: [MovimientosService],
  exports: [MovimientosService],
})
export class MovimientosModule {}
