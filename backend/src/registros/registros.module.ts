import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroServicio } from './registro.entity';
import { RegistrosService } from './registros.service';
import { RegistrosController } from './registros.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroServicio])],
  controllers: [RegistrosController],
  providers: [RegistrosService],
  exports: [RegistrosService],
})
export class RegistrosModule {}
