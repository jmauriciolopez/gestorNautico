import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guarderia } from './guarderia.entity';
import { GuarderiaService } from './guarderia.service';
import { GuarderiaController } from './guarderia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guarderia])],
  providers: [GuarderiaService],
  controllers: [GuarderiaController],
  exports: [GuarderiaService],
})
export class GuarderiasModule {}
