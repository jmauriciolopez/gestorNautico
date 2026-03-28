import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from './ubicacion.entity';

@Injectable()
export class UbicacionesService {
  constructor(
    @InjectRepository(Ubicacion)
    private readonly ubicacionRepo: Repository<Ubicacion>,
  ) {}

  findAll() {
    return this.ubicacionRepo.find({
      relations: ['zonas', 'zonas.racks', 'zonas.racks.espacios'],
    });
  }

  async findOne(id: number) {
    const ubicacion = await this.ubicacionRepo.findOne({
      where: { id },
      relations: ['zonas', 'zonas.racks', 'zonas.racks.espacios'],
    });
    if (!ubicacion)
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    return ubicacion;
  }

  create(data: Partial<Ubicacion>) {
    const ubicacion = this.ubicacionRepo.create(data);
    return this.ubicacionRepo.save(ubicacion);
  }

  async update(id: number, data: Partial<Ubicacion>) {
    await this.findOne(id);
    await this.ubicacionRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const ubicacion = await this.findOne(id);
    return this.ubicacionRepo.remove(ubicacion);
  }
}
