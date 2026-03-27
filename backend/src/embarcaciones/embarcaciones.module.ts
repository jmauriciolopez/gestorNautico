import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Embarcacion } from './embarcaciones.entity';
import { EmbarcacionesService } from './embarcaciones.service';
import { EmbarcacionesController } from './embarcaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Embarcacion])],
  controllers: [EmbarcacionesController],
  providers: [EmbarcacionesService],
  exports: [EmbarcacionesService],
})
export class EmbarcacionesModule {}
