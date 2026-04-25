import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudBajada } from './solicitud-bajada.entity';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { JwtModule } from '@nestjs/jwt';
import { MovimientosModule } from '../movimientos/movimientos.module';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { Pedido } from '../pedidos/pedidos.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SolicitudBajada,
      Cliente,
      Embarcacion,
      Pedido,
      Guarderia,
    ]),
    NotificacionesModule,
    JwtModule, // Needed for AuthTokenGuard
    MovimientosModule,
    ConfiguracionModule,
  ],
  providers: [OperacionesService],
  controllers: [OperacionesController],
  exports: [OperacionesService],
})
export class OperacionesModule {}
