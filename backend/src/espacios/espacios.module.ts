import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Espacio } from './espacio.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { EspaciosService } from './espacios.service';
import { EspaciosController } from './espacios.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Espacio, Embarcacion])],
  controllers: [EspaciosController],
  providers: [EspaciosService],
  exports: [EspaciosService, TypeOrmModule],
})
export class EspaciosModule {}
