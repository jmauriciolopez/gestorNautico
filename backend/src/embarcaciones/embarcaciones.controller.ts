import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { EmbarcacionesService } from './embarcaciones.service';
import { Embarcacion } from './embarcaciones.entity';

@Controller('embarcaciones')
export class EmbarcacionesController {
  constructor(private readonly embarcacionesService: EmbarcacionesService) {}

  @Get()
  findAll() {
    return this.embarcacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.embarcacionesService.findOne(+id);
  }

  @Post()
  create(@Body() createEmbarcacionDto: Partial<Embarcacion>) {
    return this.embarcacionesService.create(createEmbarcacionDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateEmbarcacionDto: Partial<Embarcacion>) {
    return this.embarcacionesService.update(+id, updateEmbarcacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.embarcacionesService.remove(+id);
  }
}
