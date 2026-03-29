import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Rack } from '../racks/rack.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Embarcacion, Rack])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
