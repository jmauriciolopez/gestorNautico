import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from './movimientos.entity';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  findAll() {
    return this.movimientoRepo.find({
      relations: ['embarcacion', 'espacio'],
      order: { fecha: 'DESC' }
    });
  }

  async findOne(id: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'espacio']
    });
    if (!movimiento) throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    return movimiento;
  }

  async create(data: any) {
    const { embarcacionId, espacioId, ...rest } = data;
    const nuevo = this.movimientoRepo.create({
      ...rest,
      embarcacion: { id: embarcacionId },
      espacio: { id: espacioId }
    });
    return this.movimientoRepo.save(nuevo);
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return this.movimientoRepo.remove(movimiento);
  }
}
