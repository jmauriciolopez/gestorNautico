import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion, NotificacionTipo } from './notificacion.entity';
import { User, Role } from '../users/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { paginate, PaginationQuery } from '../common/pagination/pagination.helper';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionesRepository: Repository<Notificacion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmailNotification(
    to: string,
    subject: string,
    template: string,
    context: Record<string, unknown>,
    attachments?: any[],
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
        attachments,
      });
      console.log(`Email enviado con éxito a ${to}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error enviando email a ${to}:`, message);
    }
  }

  async findAllByUser(usuarioId: number, query: PaginationQuery = {}): Promise<Notificacion[]> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    return this.notificacionesRepository.find({
      where: { usuarioId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
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

  async findAllRecentGlobal(limit = 10): Promise<Notificacion[]> {
    return this.notificacionesRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['usuario'],
    });
  }
}
