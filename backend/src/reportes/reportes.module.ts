import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from '../cargos/cargo.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Pago } from '../pagos/pago.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo, Embarcacion, Espacio, Pago])],
  providers: [ReportesService],
  controllers: [ReportesController],
})
export class ReportesModule {}
