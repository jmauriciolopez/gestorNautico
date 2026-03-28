import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './pedidos.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    private readonly notificacionesService: NotificacionesService,
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
    const guardado = await this.pedidoRepo.save(nuevo);
    const pedidox = await this.findOne(guardado.id);

    // Notificar a los operadores y administradores
    await this.notificacionesService.createForRole(Role.OPERADOR, {
      titulo: 'Nueva Solicitud de Movimiento',
      mensaje: `Se ha registrado una solicitud para la embarcación ${pedidox.embarcacion.nombre}.`,
      tipo: NotificacionTipo.INFO,
    });
    await this.notificacionesService.createForRole(Role.ADMIN, {
      titulo: 'Nueva Solicitud de Movimiento (Admin)',
      mensaje: `Se ha registrado una solicitud para la embarcación ${pedidox.embarcacion.nombre}.`,
      tipo: NotificacionTipo.INFO,
    });

    return pedidox;
  }

  async updateEstado(id: number, estado: string) {
    const pedido = await this.findOne(id);
    await this.pedidoRepo.update(id, { estado });

    // Notificar cambio de estado a roles relevantes
    await this.notificacionesService.createForRole(Role.ADMIN, {
      titulo: 'Actualización de Pedido',
      mensaje: `El pedido de ${pedido.embarcacion.nombre} ha cambiado a ${estado}.`,
    });

    // In progress: eventually notify the requester if user association is added to Pedido entity
    return this.findOne(id);
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);
    return this.pedidoRepo.remove(pedido);
  }
}
