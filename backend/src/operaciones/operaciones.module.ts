import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudBajada } from './solicitud-bajada.entity';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudBajada, Cliente, Embarcacion]),
    NotificacionesModule,
    JwtModule, // Needed for AuthTokenGuard
  ],
  providers: [OperacionesService],
  controllers: [OperacionesController],
  exports: [OperacionesService],
})
export class OperacionesModule {}
