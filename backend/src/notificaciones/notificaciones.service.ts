import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, NotificacionTipo } from './notificacion.entity';
import { User, Role } from '../users/user.entity';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionesRepository: Repository<Notificacion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllByUser(usuarioId: number): Promise<Notificacion[]> {
    return this.notificacionesRepository.find({
      where: { usuarioId },
      order: { createdAt: 'DESC' },
      take: 20, // Limit to 20 most recent
    });
  }

  async create(data: {
    usuarioId: number;
    titulo: string;
    mensaje: string;
    tipo?: NotificacionTipo;
  }): Promise<Notificacion> {
    const notificacion = this.notificacionesRepository.create(data);
    return this.notificacionesRepository.save(notificacion);
  }

  async createForRole(
    role: Role,
    data: { titulo: string; mensaje: string; tipo?: NotificacionTipo },
  ): Promise<void> {
    const users = await this.userRepository.find({
      where: { role, activo: true },
    });
    const notifications = users.map((user) =>
      this.notificacionesRepository.create({
        ...data,
        usuarioId: user.id,
      }),
    );
    await this.notificacionesRepository.save(notifications);
  }

  async markAsRead(id: number, usuarioId: number): Promise<Notificacion> {
    const notificacion = await this.notificacionesRepository.findOne({
      where: { id, usuarioId },
    });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notificacion.leida = true;
    return this.notificacionesRepository.save(notificacion);
  }

  async markAllAsRead(usuarioId: number): Promise<void> {
    await this.notificacionesRepository.update(
      { usuarioId, leida: false },
      { leida: true },
    );
  }

  async delete(id: number, usuarioId: number): Promise<void> {
    const result = await this.notificacionesRepository.delete({
      id,
      usuarioId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Notificación no encontrada');
    }
  }
}
