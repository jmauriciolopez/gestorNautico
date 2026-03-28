import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './notificacion.entity';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, User])],
  providers: [NotificacionesService],
  controllers: [NotificacionesController],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
