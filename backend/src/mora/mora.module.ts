import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Factura } from '../facturas/factura.entity';
import { MoraService } from './mora.service';
import { MoraController } from './mora.controller';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Factura]),
    ConfiguracionModule,
    NotificacionesModule,
    ScheduleModule.forRoot(),
  ],
  providers: [MoraService],
  controllers: [MoraController],
  exports: [MoraService],
})
export class MoraModule {}
