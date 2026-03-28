import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Espacio } from './espacio.entity';

@Injectable()
export class EspaciosService {
  constructor(
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
  ) {}

  findAll() {
    return this.espacioRepo.find({
      relations: ['rack', 'rack.zona', 'rack.zona.ubicacion'],
    });
  }

  async findOne(id: number) {
    const espacio = await this.espacioRepo.findOne({
      where: { id },
      relations: ['rack', 'rack.zona', 'rack.zona.ubicacion'],
    });
    if (!espacio)
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    return espacio;
  }

  create(data: Partial<Espacio>) {
    const espacio = this.espacioRepo.create(data);
    return this.espacioRepo.save(espacio);
  }

  async update(id: number, data: Partial<Espacio>) {
    await this.findOne(id);
    await this.espacioRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const espacio = await this.espacioRepo.findOne({ where: { id } });
    if (!espacio)
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    return this.espacioRepo.remove(espacio);
  }

  async getEstadisticas() {
    const total = await this.espacioRepo.count();
    const ocupados = await this.espacioRepo.count({ where: { ocupado: true } });
    const libres = total - ocupados;
    const porcentajeOcupacion = total > 0 ? (ocupados / total) * 100 : 0;

    return {
      total,
      ocupados,
      libres,
      porcentajeOcupacion,
    };
  }
}
