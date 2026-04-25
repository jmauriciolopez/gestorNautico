import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOptionsWhere,
  In,
  LessThan,
  Repository,
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
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { Pedido, EstadoPedido } from '../pedidos/pedidos.entity';
import { TipoMovimiento } from '../movimientos/movimientos.entity';
import { Guarderia } from '../guarderias/guarderia.entity';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class OperacionesService extends BaseTenantService {
  private readonly logger = new Logger(OperacionesService.name);

  constructor(
    @InjectRepository(SolicitudBajada)
    private readonly solicitudRepo: Repository<SolicitudBajada>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(Guarderia)
    private readonly guarderiaRepo: Repository<Guarderia>,
    private readonly notificacionesService: NotificacionesService,
    private readonly movimientosService: MovimientosService,
    private readonly configuracionService: ConfiguracionService,
  ) {
    super();
  }

  async createPublic(
    tenant: TenantContext,
    dto: CreateSolicitudBajadaDto,
  ): Promise<SolicitudBajada> {
    if (!tenant || !tenant.guarderiaId) {
      throw new BadRequestException('Se requiere identificación de guardería');
    }

    // 1. Validar Cliente por DNI dentro del tenant
    const cliente = await this.clienteRepo.findOne({
      where: this.buildTenantWhere(tenant, { dni: dto.dni }),
    });
    if (!cliente) {
      throw new NotFoundException('DNI no registrado en esta guardería');
    }

    // 2. Validar Embarcación por Matrícula y pertenencia dentro del tenant
    const barco = await this.embarcacionRepo.findOne({
      where: this.buildTenantWhere(tenant, {
        matricula: dto.matricula,
        cliente: { id: cliente.id },
      }),
    });
    if (!barco) {
      throw new BadRequestException(
        'Matrícula inválida o no pertenece al cliente indicado en esta guardería',
      );
    }

    // 2c. Validar si ya existe una solicitud activa dentro del tenant
    const solicitudActiva = await this.solicitudRepo.findOne({
      where: this.buildTenantWhere(tenant, {
        embarcacion: { id: barco.id },
        estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.EN_AGUA]),
      }),
    });

    if (solicitudActiva) {
      throw new BadRequestException(
        'Ya existe una solicitud activa para esta embarcación.',
      );
    }

    // 2d. Validar si ya existe un pedido activo en el Monitor de Cola dentro del tenant
    const pedidoActivo = await this.pedidoRepo.findOne({
      where: this.buildTenantWhere(tenant, {
        embarcacion: { id: barco.id },
        estado: In([EstadoPedido.PENDIENTE, EstadoPedido.EN_AGUA]),
      }),
    });

    if (pedidoActivo) {
      throw new BadRequestException(
        'Ya existe una solicitud activa para esta embarcación en el Monitor de Cola.',
      );
    }

    // 2b. Validar Horarios Operativos
    const fechaHora = new Date(dto.fechaHoraDeseada);
    const horaSolicitud = fechaHora.getHours() + fechaHora.getMinutes() / 60;

    const aperturaRaw = await this.configuracionService.getValor(
      tenant,
      'HORARIO_APERTURA',
      '08:00',
    );
    const cierreRaw = await this.configuracionService.getValor(
      tenant,
      'HORARIO_MAX_SUBIDA',
      '18:00',
    );

    const [hA, mA] = aperturaRaw.split(':').map(Number);
    const [hC, mC] = cierreRaw.split(':').map(Number);

    const horaApertura = hA + mA / 60;
    const horaCierre = hC + mC / 60;

    if (horaSolicitud < horaApertura || horaSolicitud > horaCierre) {
      throw new BadRequestException(
        `El horario solicitado (${fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}) está fuera del rango operativo de la guardería (${aperturaRaw} a ${cierreRaw}).`,
      );
    }

    // 3. Crear Solicitud
    const nueva = this.solicitudRepo.create({
      cliente: { id: cliente.id },
      embarcacion: { id: barco.id },
      fechaHoraDeseada: new Date(dto.fechaHoraDeseada),
      observaciones: dto.observaciones,
      estado: EstadoSolicitud.PENDIENTE,
      guarderiaId: tenant.guarderiaId,
    });

    const guardada = await this.solicitudRepo.save(nueva);

    // 4. Notificar a Operadores inmediatamente
    await this.notificacionesService.createForRole(tenant, Role.OPERADOR, {
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
            error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : 'Error desconocido';
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

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery = {},
    estado?: EstadoSolicitud,
  ) {
    const tenantFilter = this.buildTenantWhere(tenant);

    const where:
      | FindOptionsWhere<SolicitudBajada>
      | FindOptionsWhere<SolicitudBajada>[] = estado
      ? { ...tenantFilter, estado }
      : {
          ...tenantFilter,
          estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.EN_AGUA]),
        };

    const options: FindManyOptions<SolicitudBajada> = {
      where,
      relations: ['cliente', 'embarcacion'],
      order: { createdAt: 'DESC' },
    };

    return paginate(this.solicitudRepo, query, options);
  }

  async updateEstado(
    tenant: TenantContext,
    id: number,
    estado: EstadoSolicitud,
    motivo?: string,
  ) {
    const solicitud = await this.solicitudRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['cliente', 'embarcacion'],
    });
    if (!solicitud)
      throw new NotFoundException(`Solicitud ${id} no encontrada`);

    const pedido = solicitud;

    await this.solicitudRepo.update(id, { estado });

    // Lógica según el nuevo estado simplificado
    const embarcacionId = pedido.embarcacion?.id || solicitud.embarcacionId;

    if (estado === EstadoSolicitud.EN_AGUA) {
      await this.movimientosService.create(tenant, {
        embarcacionId,
        tipo: TipoMovimiento.SALIDA,
        observaciones: `Bajada marcada desde Monitor de Cola #${pedido.id}`,
      });
    } else if (estado === EstadoSolicitud.FINALIZADA) {
      await this.movimientosService.create(tenant, {
        embarcacionId,
        tipo: TipoMovimiento.ENTRADA,
        observaciones: `Retorno a cuna marcado desde Monitor de Cola #${pedido.id}`,
      });
    }

    const fecha = solicitud.fechaHoraDeseada.toLocaleString('es-AR');
    const barco = solicitud.embarcacion.nombre;
    const email = solicitud.cliente.email;

    // Notificaciones internas
    await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
      titulo: `Operación ${estado}`,
      mensaje: `La embarcación "${barco}" cambió a estado ${estado}.`,
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
        [EstadoSolicitud.EN_AGUA]: {
          subject: 'Tu embarcación ya está en el agua — Gestor Náutico',
          template: 'bajada-completada',
        },
        [EstadoSolicitud.FINALIZADA]: {
          subject: 'Tu embarcación ya está en su cuna — Gestor Náutico',
          template: 'subida-completada',
        },
        [EstadoSolicitud.CANCELADA]: {
          subject: 'Tu solicitud de bajada fue cancelada — Gestor Náutico',
          template: 'bajada-cancelada',
        },
      };

      const tpl = templates[estado];
      if (tpl) {
        try {
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
        } catch (error: unknown) {
          const msg =
            error instanceof Error
              ? error.message
              : typeof error === 'string'
                ? error
                : 'Error desconocido';
          this.logger.error(
            `Error enviando email para solicitud ${id}: ${msg}`,
          );
          // No relanzamos el error para no bloquear la operación física
        }
      }
    }

    return this.solicitudRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['cliente', 'embarcacion'],
    });
  }
}
