import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedidos.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
  ) {}

  findAll() {
    return this.pedidoRepo.find({
      relations: ['embarcacion', 'embarcacion.cliente'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'embarcacion.cliente'],
    });
    if (!pedido)
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    return pedido;
  }

  async create(data: Record<string, unknown>) {
    const { embarcacionId, ...rest } = data as { embarcacionId: number };
    const nuevo = this.pedidoRepo.create({
      ...rest,
      embarcacion: { id: embarcacionId },
    });
    return this.pedidoRepo.save(nuevo);
  }

  async updateEstado(id: number, estado: string) {
    await this.pedidoRepo.update(id, { estado });
    return this.findOne(id);
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);
    return this.pedidoRepo.remove(pedido);
  }
}
