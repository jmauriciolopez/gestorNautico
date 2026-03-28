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
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'espacio'],
    });
    if (!movimiento)
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    return movimiento;
  }

  async create(data: Record<string, unknown>) {
    const { embarcacionId, espacioId, ...rest } = data;
    const createData: any = {
      ...(rest as object),
      embarcacion: { id: Number(embarcacionId) },
      espacio: { id: Number(espacioId) },
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const nuevo = this.movimientoRepo.create(createData);
    return this.movimientoRepo.save(nuevo);
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return this.movimientoRepo.remove(movimiento);
  }
}
