import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Notificacion, NotificacionTipo } from './notificacion.entity';
import { User, Role } from '../users/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class NotificacionesService extends BaseTenantService {
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionesRepository: Repository<Notificacion>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {
    super();
  }

  async sendEmailNotification(
    to: string,
    subject: string,
    template: string,
    context: Record<string, unknown>,
    attachments?: any[],
    enviar: boolean = false,
  ): Promise<void> {
    if (!enviar) {
      this.logger.log(`Notificación por email a ${to} omitida (enviar=false)`);
      return;
    }

    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template,
        context,
        attachments,
      });
      this.logger.log(`Email enviado con éxito a ${to}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error enviando email a ${to}: ${message}`);
    }
  }

  async findAllByUser(
    tenant: TenantContext,
    usuarioId: number,
    query: PaginationQuery = {},
  ) {
    return paginate(this.notificacionesRepository, query, {
      where: this.buildTenantWhere<Notificacion>(tenant, { usuarioId }),
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    tenant: TenantContext,
    data: {
      usuarioId: number;
      titulo: string;
      mensaje: string;
      tipo?: NotificacionTipo;
    },
    manager?: EntityManager,
  ): Promise<Notificacion> {
    const repo = manager
      ? manager.getRepository(Notificacion)
      : this.notificacionesRepository;
    const notificacion = repo.create({
      ...data,
      guarderiaId: tenant.guarderiaId,
    });
    return repo.save(notificacion);
  }

  async createForRole(
    tenant: TenantContext,
    role: Role,
    data: { titulo: string; mensaje: string; tipo?: NotificacionTipo },
    manager?: EntityManager,
  ): Promise<void> {
    const userRepo = manager
      ? manager.getRepository(User)
      : this.userRepository;
    const notifRepo = manager
      ? manager.getRepository(Notificacion)
      : this.notificacionesRepository;

    const users = await userRepo.find({
      where: {
        role,
        activo: true,
        guarderiaId: tenant.guarderiaId,
      },
    });
    const notifications = users.map((user) =>
      notifRepo.create({
        ...data,
        usuarioId: user.id,
        guarderiaId: tenant.guarderiaId,
      }),
    );
    await notifRepo.save(notifications);
  }

  async markAsRead(
    tenant: TenantContext,
    id: number,
    usuarioId: number,
  ): Promise<Notificacion> {
    const notificacion = await this.notificacionesRepository.findOne({
      where: this.buildTenantWhere<Notificacion>(tenant, { id, usuarioId }),
    });
    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }
    notificacion.leida = true;
    return this.notificacionesRepository.save(notificacion);
  }

  async markAllAsRead(tenant: TenantContext, usuarioId: number): Promise<void> {
    await this.notificacionesRepository.update(
      this.buildTenantWhere<Notificacion>(tenant, { usuarioId, leida: false }),
      { leida: true },
    );
  }

  async delete(
    tenant: TenantContext,
    id: number,
    usuarioId: number,
  ): Promise<void> {
    const result = await this.notificacionesRepository.delete(
      this.buildTenantWhere<Notificacion>(tenant, { id, usuarioId }),
    );
    if (result.affected === 0) {
      throw new NotFoundException('Notificación no encontrada');
    }
  }

  async findAllRecentGlobal(
    tenant: TenantContext,
    limit = 10,
  ): Promise<Notificacion[]> {
    return this.notificacionesRepository.find({
      where: this.buildTenantWhere<Notificacion>(tenant),
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['usuario'],
    });
  }
}
