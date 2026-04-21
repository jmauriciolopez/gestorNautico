import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThan,
  In,
  MoreThan,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm';
import { SolicitudBajada, EstadoSolicitud } from './solicitud-bajada.entity';
import { CreateSolicitudBajadaDto } from './dto/create-solicitud-bajada.dto';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';
import { MovimientosService } from '../movimientos/movimientos.service';

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
    private readonly movimientosService: MovimientosService,
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

  async findAll(query: PaginationQuery = {}, estado?: EstadoSolicitud) {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const where:
      | FindOptionsWhere<SolicitudBajada>
      | FindOptionsWhere<SolicitudBajada>[] = estado
      ? { estado }
      : [
          {
            estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.CONFIRMADA]),
          },
          {
            estado: In([EstadoSolicitud.COMPLETADA, EstadoSolicitud.CANCELADA]),
            updatedAt: MoreThan(oneDayAgo),
          },
        ];

    const options: FindManyOptions<SolicitudBajada> = {
      where,
      relations: ['cliente', 'embarcacion'],
      order: { createdAt: 'DESC' },
    };

    return paginate(this.solicitudRepo, query, options);
  }

  async updateEstado(id: number, estado: EstadoSolicitud, motivo?: string) {
    const solicitud = await this.solicitudRepo.findOne({
      where: { id },
      relations: ['cliente', 'embarcacion'],
    });
    if (!solicitud)
      throw new NotFoundException(`Solicitud ${id} no encontrada`);

    await this.solicitudRepo.update(id, { estado });

    // Si se completa, generamos el movimiento automático
    if (estado === EstadoSolicitud.COMPLETADA) {
      await this.movimientosService.create({
        embarcacionId: solicitud.embarcacion.id,
        tipo: 'salida',
        observaciones: `Generado automáticamente por Solicitud Pública #${solicitud.id}`,
      });
    }

    const fecha = solicitud.fechaHoraDeseada.toLocaleString('es-AR');
    const barco = solicitud.embarcacion.nombre;
    const email = solicitud.cliente.email;

    // In-app al cliente no es posible (no tiene usuario), notificamos a ADMIN
    await this.notificacionesService.createForRole(Role.ADMIN, {
      titulo: `Solicitud ${estado}`,
      mensaje: `La bajada de "${barco}" para el ${fecha} fue marcada como ${estado}.`,
      tipo:
        estado === EstadoSolicitud.CANCELADA
          ? NotificacionTipo.ALERTA
          : NotificacionTipo.EXITO,
    });

    // Email al cliente según el nuevo estado
    if (email) {
      const templates: Partial<
        Record<EstadoSolicitud, { subject: string; template: string }>
      > = {
        [EstadoSolicitud.CONFIRMADA]: {
          subject: 'Tu bajada fue confirmada — Gestor Náutico',
          template: 'bajada-confirmada',
        },
        [EstadoSolicitud.COMPLETADA]: {
          subject: 'Tu embarcación ya está en el agua — Gestor Náutico',
          template: 'bajada-completada',
        },
        [EstadoSolicitud.CANCELADA]: {
          subject: 'Tu solicitud de bajada fue cancelada — Gestor Náutico',
          template: 'bajada-cancelada',
        },
      };

      const tpl = templates[estado];
      if (tpl) {
        await this.notificacionesService.sendEmailNotification(
          email,
          tpl.subject,
          tpl.template,
          {
            clienteNombre: solicitud.cliente.nombre,
            barcoNombre: barco,
            fechaHora: fecha,
            motivo: motivo ?? '',
            anio: new Date().getFullYear(),
          },
        );
      }
    }

    return this.solicitudRepo.findOne({
      where: { id },
      relations: ['cliente', 'embarcacion'],
    });
  }
}
