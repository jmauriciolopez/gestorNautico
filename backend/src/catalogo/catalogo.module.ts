import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Catalogo } from './catalogo.entity';
import { CatalogoService } from './catalogo.service';
import { CatalogoController } from './catalogo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Catalogo])],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [CatalogoService],
})
export class CatalogoModule {}
