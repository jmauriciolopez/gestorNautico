import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marina } from './marina.entity';

@Injectable()
export class MarinaService {
  constructor(
    @InjectRepository(Marina)
    private readonly marinaRepo: Repository<Marina>,
  ) {}

  findAll() {
    return this.marinaRepo.find({ relations: ['zonas', 'zonas.racks'] });
  }

  async findOne(id: number) {
    const marina = await this.marinaRepo.findOne({
      where: { id },
      relations: ['zonas', 'zonas.racks']
    });
    if (!marina) throw new NotFoundException(`Marina con ID ${id} no encontrada`);
    return marina;
  }

  create(data: Partial<Marina>) {
    const marina = this.marinaRepo.create(data);
    return this.marinaRepo.save(marina);
  }

  async update(id: number, data: Partial<Marina>) {
    await this.findOne(id);
    await this.marinaRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const marina = await this.findOne(id);
    return this.marinaRepo.remove(marina);
  }
}
