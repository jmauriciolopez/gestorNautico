import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalogo } from './catalogo.entity';

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(Catalogo)
    private readonly catalogoRepo: Repository<Catalogo>,
  ) {}

  findAll() {
    return this.catalogoRepo.find({ order: { categoria: 'ASC', nombre: 'ASC' } });
  }

  async findOne(id: number) {
    const item = await this.catalogoRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Servicio con ID ${id} no encontrado en catálogo`);
    return item;
  }

  create(data: Partial<Catalogo>) {
    const item = this.catalogoRepo.create(data);
    return this.catalogoRepo.save(item);
  }

  async update(id: number, data: Partial<Catalogo>) {
    await this.findOne(id);
    await this.catalogoRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.catalogoRepo.remove(item);
  }
}
