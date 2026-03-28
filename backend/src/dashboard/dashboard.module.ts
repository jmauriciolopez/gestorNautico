import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Movimiento } from '../movimientos/movimientos.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { Zona } from '../zonas/zona.entity';
import { Rack } from '../racks/rack.entity';
import { Espacio } from '../espacios/espacio.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      Embarcacion,
      Movimiento,
      Cargo,
      Pago,
      Zona,
      Rack,
      Espacio,
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
