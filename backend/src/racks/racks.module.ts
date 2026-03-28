import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rack } from './rack.entity';
import { RacksService } from './racks.service';
import { RacksController } from './racks.controller';
import { Espacio } from '../espacios/espacio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rack, Espacio])],
  controllers: [RacksController],
  providers: [RacksService],
  exports: [RacksService],
})
export class RacksModule {}
