import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Pedido, EstadoPedido } from './pedidos.entity';
import {
  SolicitudBajada,
  EstadoSolicitud,
} from '../operaciones/solicitud-bajada.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { MovimientosService } from '../movimientos/movimientos.service';
import { TipoMovimiento } from '../movimientos/movimientos.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class PedidosService extends BaseTenantService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(SolicitudBajada)
    private readonly solicitudRepo: Repository<SolicitudBajada>,
    private readonly notificacionesService: NotificacionesService,
    private readonly movimientosService: MovimientosService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery = {},
  ): Promise<PaginatedResult<Pedido>> {
    const queryBuilder = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.embarcacion', 'embarcacion')
      .leftJoinAndSelect('embarcacion.cliente', 'cliente')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(cargo.id)', 'count')
          .from('cargos', 'cargo')
          .where('cargo.cliente_id = embarcacion.clienteId')
          .andWhere('cargo.pagado = :pagado', { pagado: false })
          .andWhere('cargo.guarderiaId = :guarderiaId', {
            guarderiaId: tenant.guarderiaId,
          });
      }, 'deudaCount')
      .where('pedido.estado IN (:...activos)', {
        activos: ['pendiente', 'en_agua'],
      })
      .andWhere('pedido.guarderiaId = :guarderiaId', {
        guarderiaId: tenant.guarderiaId,
      })
      .orderBy('pedido.createdAt', 'DESC');

    const { data, total, page, limit, totalPages } = await paginate(
      queryBuilder,
      query,
    );

    const itemsWithDebt = data.map((item) => {
      const row = item as Pedido & { deudaCount?: string };
      const { deudaCount, ...pedido } = row;
      return {
        ...pedido,
        embarcacion: {
          ...pedido.embarcacion,
          tieneDeuda: parseInt(deudaCount || '0', 10) > 0,
        },
      };
    });

    return { data: itemsWithDebt, total, page, limit, totalPages };
  }

  async findOne(tenant: TenantContext, id: number) {
    const queryBuilder = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.embarcacion', 'embarcacion')
      .leftJoinAndSelect('embarcacion.cliente', 'cliente')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(cargo.id)', 'count')
          .from('cargos', 'cargo')
          .where('cargo.cliente_id = embarcacion.clienteId')
          .andWhere('cargo.pagado = :pagado', { pagado: false })
          .andWhere('cargo.guarderiaId = :guarderiaId', {
            guarderiaId: tenant.guarderiaId,
          });
      }, 'deudaCount')
      .where('pedido.id = :id', { id })
      .andWhere('pedido.guarderiaId = :guarderiaId', {
        guarderiaId: tenant.guarderiaId,
      });

    const rawResult = await queryBuilder.getOne();

    if (!rawResult) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    const row = rawResult as Pedido & { deudaCount?: string };
    const { deudaCount, ...pedido } = row;

    return {
      ...pedido,
      embarcacion: {
        ...pedido.embarcacion,
        tieneDeuda: parseInt(deudaCount || '0', 10) > 0,
      },
    };
  }

  async create(tenant: TenantContext, data: CreatePedidoDto) {
    const { embarcacionId, ...rest } = data;

    return await this.dataSource.transaction(async (manager) => {
      const pedRepo = manager.getRepository(Pedido);
      const solRepo = manager.getRepository(SolicitudBajada);

      // Validar si ya existe un pedido activo para esta embarcación
      const pedidoActivo = await pedRepo.findOne({
        where: {
          embarcacion: { id: embarcacionId },
          estado: In([EstadoPedido.PENDIENTE, EstadoPedido.EN_AGUA]),
          guarderiaId: tenant.guarderiaId,
        },
      });

      if (pedidoActivo) {
        throw new BadRequestException(
          'Ya existe un pedido activo para esta embarcación en el Monitor de Cola.',
        );
      }

      // Validar si ya existe una solicitud activa en el Portal Web
      const solicitudActiva = await solRepo.findOne({
        where: this.buildTenantWhere(tenant, {
          embarcacionId: embarcacionId,
          estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.EN_AGUA]),
        }),
      });

      if (solicitudActiva) {
        throw new BadRequestException(
          'Ya existe una solicitud activa para esta embarcación en el Portal Web (Solicitudes Externas).',
        );
      }

      const nuevo = pedRepo.create({
        ...rest,
        embarcacion: { id: embarcacionId },
        guarderiaId: tenant.guarderiaId,
      });
      const guardado = await pedRepo.save(nuevo);

      const pedidox = await manager.findOne(Pedido, {
        where: this.buildTenantWhere(tenant, { id: guardado.id }),
        relations: ['embarcacion'],
      });

      // Notificar a los operadores y administradores
      await this.notificacionesService.createForRole(tenant, Role.OPERADOR, {
        titulo: 'Nueva Solicitud de Movimiento',
        mensaje: `Se ha registrado una solicitud para la embarcación ${pedidox.embarcacion.nombre}.`,
        tipo: NotificacionTipo.INFO,
      });
      await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
        titulo: 'Nueva Solicitud de Movimiento (Admin)',
        mensaje: `Se ha registrado una solicitud para la embarcación ${pedidox.embarcacion.nombre}.`,
        tipo: NotificacionTipo.INFO,
      });

      return pedidox;
    });
  }

  async updateEstado(tenant: TenantContext, id: number, estado: EstadoPedido) {
    return await this.dataSource.transaction(async (manager) => {
      const pedido = await manager.findOne(Pedido, {
        where: this.buildTenantWhere(tenant, { id }),
        relations: ['embarcacion'],
      });

      if (!pedido) {
        throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
      }

      await manager.update(Pedido, this.buildTenantWhere(tenant, { id }), {
        estado,
      });

      if (!pedido.embarcacion?.id) {
        this.logger.warn(`Pedido ${id} no tiene embarcación asociada`);
      } else {
        if (estado === EstadoPedido.EN_AGUA) {
          await this.movimientosService.create(
            tenant,
            {
              embarcacionId: pedido.embarcacion.id,
              tipo: TipoMovimiento.SALIDA,
              observaciones: `Bajada marcada desde Monitor de Cola #${pedido.id}`,
            },
            manager,
          );
        } else if (estado === EstadoPedido.FINALIZADO) {
          await this.movimientosService.create(
            tenant,
            {
              embarcacionId: pedido.embarcacion.id,
              tipo: TipoMovimiento.ENTRADA,
              observaciones: `Retorno a cuna marcado desde Monitor de Cola #${pedido.id}`,
            },
            manager,
          );
        }
      }

      // Notificar cambio de estado a roles relevantes
      await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
        titulo: 'Actualización de Operación',
        mensaje: `La embarcación ${pedido.embarcacion?.nombre || 'N/A'} cambió a estado ${estado}.`,
        tipo:
          estado === EstadoPedido.CANCELADO
            ? NotificacionTipo.ALERTA
            : NotificacionTipo.INFO,
      });

      return await manager.findOne(Pedido, {
        where: this.buildTenantWhere(tenant, { id }),
        relations: ['embarcacion'],
      });
    });
  }

  async remove(tenant: TenantContext, id: number) {
    const pedido = await this.findOne(tenant, id);
    return this.pedidoRepo.remove(pedido);
  }
}
