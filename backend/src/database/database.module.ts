import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { InitialDataService } from './initial-data.service';
import { SeederController } from './database.controller';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Caja } from '../finanzas/entities/caja.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, Embarcacion, Caja, User]),
  ],
  providers: [SeederService, InitialDataService],
  controllers: [SeederController],
  exports: [SeederService, InitialDataService],
})
export class DatabaseModule {}
