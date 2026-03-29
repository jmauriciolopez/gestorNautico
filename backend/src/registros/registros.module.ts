import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroServicio } from './registro.entity';
import { RegistrosService } from './registros.service';
import { RegistrosController } from './registros.controller';
import { CargosModule } from '../cargos/cargos.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RegistroServicio]),
    CargosModule,
    NotificacionesModule,
  ],
  controllers: [RegistrosController],
  providers: [RegistrosService],
  exports: [RegistrosService],
})
export class RegistrosModule {}
