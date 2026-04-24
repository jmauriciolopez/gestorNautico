import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './pedidos.entity';
import { SolicitudBajada } from '../operaciones/solicitud-bajada.entity';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { MovimientosModule } from '../movimientos/movimientos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, SolicitudBajada]),
    NotificacionesModule,
    MovimientosModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
