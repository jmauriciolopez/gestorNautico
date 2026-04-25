import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from './cargo.entity';
import { CargosService } from './cargos.service';
import { CargosController } from './cargos.controller';
import { Cliente } from '../clientes/clientes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo, Cliente])],
  controllers: [CargosController],
  providers: [CargosService],
  exports: [CargosService],
})
export class CargosModule {}
