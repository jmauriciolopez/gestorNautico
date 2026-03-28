import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from './zona.entity';

@Injectable()
export class ZonasService {
  constructor(
    @InjectRepository(Zona)
    private readonly zonaRepo: Repository<Zona>,
  ) {}

  findAll() {
    return this.zonaRepo.find({
      relations: ['ubicacion', 'racks', 'racks.espacios'],
    });
  }

  async findOne(id: number) {
    const zona = await this.zonaRepo.findOne({
      where: { id },
      relations: ['marina', 'racks', 'racks.espacios'],
    });
    if (!zona) throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    return zona;
  }

  create(data: Partial<Zona>) {
    const zona = this.zonaRepo.create(data);
    return this.zonaRepo.save(zona);
  }

  async update(id: number, data: Partial<Zona>) {
    await this.findOne(id);
    await this.zonaRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const zona = await this.findOne(id);
    return this.zonaRepo.remove(zona);
  }
}
