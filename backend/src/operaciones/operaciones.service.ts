import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SolicitudBajada, EstadoSolicitud } from './solicitud-bajada.entity';
import { CreateSolicitudBajadaDto } from './dto/create-solicitud-bajada.dto';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { paginate, PaginationQuery } from '../common/pagination/pagination.helper';

@Injectable()
export class OperacionesService {
  private readonly logger = new Logger(OperacionesService.name);

  constructor(
    @InjectRepository(SolicitudBajada)
    private readonly solicitudRepo: Repository<SolicitudBajada>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async createPublic(dto: CreateSolicitudBajadaDto): Promise<SolicitudBajada> {
    // 1. Validar Cliente por DNI
    const cliente = await this.clienteRepo.findOne({ where: { dni: dto.dni } });
    if (!cliente) {
      throw new NotFoundException('DNI no registrado en el sistema');
    }

    // 2. Validar Embarcación por Matrícula y pertenencia
    const barco = await this.embarcacionRepo.findOne({
      where: {
        matricula: dto.matricula,
        cliente: { id: cliente.id },
      },
    });
    if (!barco) {
      throw new BadRequestException(
        'Matrícula inválida o no pertenece al cliente indicado',
      );
    }

    // 3. Crear Solicitud
    const nueva = this.solicitudRepo.create({
      cliente: { id: cliente.id },
      embarcacion: { id: barco.id },
      fechaHoraDeseada: new Date(dto.fechaHoraDeseada),
      observaciones: dto.observaciones,
      estado: EstadoSolicitud.PENDIENTE,
    });

    const guardada = await this.solicitudRepo.save(nueva);

    // 4. Notificar a Operadores inmediatamente
    await this.notificacionesService.createForRole(Role.OPERADOR, {
      titulo: 'Nueva Solicitud de Bajada (Portal Público)',
      mensaje: `El cliente ${cliente.nombre} ha solicitado bajar ${barco.nombre} para el ${new Date(dto.fechaHoraDeseada).toLocaleString()}.`,
    });

    return guardada;
  }

  /**
   * Cron Job robusto para enviar emails de confirmación 1 hora después de la solicitud
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processDelayedConfirmations() {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    // Buscar solicitudes creadas hace más de 1 hora que no tengan el email enviado
    const solicitudes = await this.solicitudRepo.find({
      where: {
        emailConfirmado: false,
        createdAt: LessThan(oneHourAgo),
      },
      relations: ['cliente', 'embarcacion'],
    });

    for (const sol of solicitudes) {
      if (sol.cliente.email) {
        try {
          await this.notificacionesService.sendEmailNotification(
            sol.cliente.email,
            'Confirmación de Solicitud de Bajada',
            'confirmacion-bajada',
            {
              clienteNombre: sol.cliente.nombre,
              barcoNombre: sol.embarcacion.nombre,
              fechaHora: sol.fechaHoraDeseada.toLocaleString(),
            },
          );

          await this.solicitudRepo.update(sol.id, { emailConfirmado: true });
          this.logger.log(
            `Email de confirmación enviado a ${sol.cliente.email} para solicitud ${sol.id}`,
          );
        } catch (error: unknown) {
          const errMsg =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Error enviando email para solicitud ${sol.id}: ${errMsg}`,
          );
        }
      } else {
        // Si no tiene email, marcamos como enviado para que no reintente
        await this.solicitudRepo.update(sol.id, { emailConfirmado: true });
      }
    }
  }

  async findAll(query: PaginationQuery = {}) {
    return paginate(this.solicitudRepo, query, {
      relations: ['cliente', 'embarcacion'],
      order: { createdAt: 'DESC' },
    });
  }
}
