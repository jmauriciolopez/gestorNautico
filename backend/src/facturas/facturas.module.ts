import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './factura.entity';
import { Cargo } from '../cargos/cargo.entity';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { CargosModule } from '../cargos/cargos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura, Cargo]),
    CargosModule,
    NotificacionesModule,
  ],
  controllers: [FacturasController],
  providers: [FacturasService],
  exports: [FacturasService],
})
export class FacturasModule {}
