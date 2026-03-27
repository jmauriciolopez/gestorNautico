import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedidos.entity';
import { Movimiento } from './movimientos.entity';

@Injectable()
export class OperacionesService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepository: Repository<Movimiento>,
  ) {}

  // --- PEDIDOS ---
  async findAllPedidos() {
    return this.pedidoRepository.find({
      relations: ['embarcacion', 'embarcacion.cliente'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOnePedido(id: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['embarcacion', 'embarcacion.cliente']
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  async createPedido(data: any) {
    const { embarcacionId, ...rest } = data;
    const nuevo = this.pedidoRepository.create({
      ...rest,
      embarcacion: { id: embarcacionId }
    });
    return this.pedidoRepository.save(nuevo);
  }

  async updatePedido(id: number, data: any) {
    const pedido = await this.findOnePedido(id);
    const { embarcacionId, ...rest } = data;
    
    const actualizado = this.pedidoRepository.merge(pedido, {
      ...rest,
      embarcacion: embarcacionId ? { id: embarcacionId } : pedido.embarcacion
    });
    return this.pedidoRepository.save(actualizado);
  }

  async deletePedido(id: number) {
    const result = await this.pedidoRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Pedido no encontrado');
    return { deleted: true };
  }

  // --- MOVIMIENTOS ---
  async findAllMovimientos() {
    return this.movimientoRepository.find({
      relations: ['embarcacion', 'espacio'],
      order: { fecha: 'DESC' }
    });
  }

  async createMovimiento(data: any) {
    const { embarcacionId, espacioId, ...rest } = data;
    const nuevo = this.movimientoRepository.create({
      ...rest,
      embarcacion: { id: embarcacionId },
      espacio: espacioId ? { id: espacioId } : null
    });
    return this.movimientoRepository.save(nuevo);
  }

  async deleteMovimiento(id: number) {
    const result = await this.movimientoRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException('Movimiento no encontrado');
    return { deleted: true };
  }
}
