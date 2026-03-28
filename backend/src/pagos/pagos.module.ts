import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pago } from './pago.entity';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { CajasModule } from '../cajas/cajas.module';
import { CargosModule } from '../cargos/cargos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pago]),
    CajasModule,
    CargosModule,
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
