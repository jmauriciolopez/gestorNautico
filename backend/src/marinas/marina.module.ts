import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Marina } from './marina.entity';
import { MarinaService } from './marina.service';
import { MarinaController } from './marina.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Marina])],
  controllers: [MarinaController],
  providers: [MarinaService],
  exports: [MarinaService],
})
export class MarinaModule {}
