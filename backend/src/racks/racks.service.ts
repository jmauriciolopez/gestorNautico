import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rack } from './rack.entity';
import { Espacio } from '../espacios/espacio.entity';

@Injectable()
export class RacksService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
  ) {}

  findAll() {
    return this.rackRepo.find({ relations: ['zona', 'espacios'] });
  }

  async findOne(id: number) {
    const rack = await this.rackRepo.findOne({
      where: { id },
      relations: ['zona', 'espacios'],
    });
    if (!rack) throw new NotFoundException(`Rack con ID ${id} no encontrado`);
    return rack;
  }

  async create(data: Partial<Rack>) {
    const rack = this.rackRepo.create(data);
    const savedRack = await this.rackRepo.save(rack);

    // Lógica de Cuadrícula Automática (Grid Generation)
    const filas = savedRack.filas || 1;
    const columnas = savedRack.columnas || 1;
    const codigo = savedRack.codigo;

    const nuevosEspacios = [];
    for (let f = 1; f <= filas; f++) {
      for (let c = 1; c <= columnas; c++) {
        nuevosEspacios.push(
          this.espacioRepo.create({
            numero: `${codigo}-F${f}C${c}`,
            fila: f,
            columna: c,
            rackId: savedRack.id,
            ocupado: false,
          }),
        );
      }
    }

    if (nuevosEspacios.length > 0) {
      await this.espacioRepo.save(nuevosEspacios);
    }

    return this.findOne(savedRack.id);
  }

  async update(id: number, data: Partial<Rack>) {
    await this.findOne(id);
    await this.rackRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const rack = await this.findOne(id);
    // Eliminar espacios asociados antes si es necesario, o depender de CASCADE
    return this.rackRepo.remove(rack);
  }
}
