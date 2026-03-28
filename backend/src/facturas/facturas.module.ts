import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './factura.entity';
import { Cargo } from '../cargos/cargo.entity';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Cargo])],
  controllers: [FacturasController],
  providers: [FacturasService],
  exports: [FacturasService],
})
export class FacturasModule {}
