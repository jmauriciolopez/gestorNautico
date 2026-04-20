import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './factura.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Rack } from '../racks/rack.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Pago } from '../pagos/pago.entity';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { AutomaticBillingService } from './automatic-billing.service';
import { CargosModule } from '../cargos/cargos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { CajasModule } from '../cajas/cajas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura, Cargo, Cliente, Embarcacion, Rack, Espacio, Pago]),
    CargosModule,
    NotificacionesModule,
    CajasModule,
  ],
  controllers: [FacturasController],
  providers: [FacturasService, AutomaticBillingService],
  exports: [FacturasService],
})
export class FacturasModule {}
