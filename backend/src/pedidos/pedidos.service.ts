import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Pedido } from './pedidos.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { MovimientosService } from '../movimientos/movimientos.service';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    private readonly notificacionesService: NotificacionesService,
    private readonly movimientosService: MovimientosService,
  ) {}

  async findAll(query: PaginationQuery = {}): Promise<PaginatedResult<Pedido>> {
    const queryBuilder = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.embarcacion', 'embarcacion')
      .leftJoinAndSelect('embarcacion.cliente', 'cliente')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(cargo.id)', 'count')
          .from('cargos', 'cargo')
          .where('cargo.cliente_id = embarcacion.clienteId')
          .andWhere('cargo.pagado = :pagado', { pagado: false });
      }, 'deudaCount')
      .where('pedido.estado IN (:...activos)', {
        activos: ['pendiente', 'en_agua'],
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

  async findOne(id: number) {
    const queryBuilder = this.pedidoRepo
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.embarcacion', 'embarcacion')
      .leftJoinAndSelect('embarcacion.cliente', 'cliente')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(cargo.id)', 'count')
          .from('cargos', 'cargo')
          .where('cargo.cliente_id = embarcacion.clienteId')
          .andWhere('cargo.pagado = :pagado', { pagado: false });
      }, 'deudaCount')
      .where('pedido.id = :id', { id });

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

  async create(data: Record<string, unknown>) {
    const { embarcacionId, ...rest } = data as { embarcacionId: number };

    // Validar si ya existe un pedido activo para esta embarcación
    const pedidoActivo = await this.pedidoRepo.findOne({
      where: {
        embarcacion: { id: embarcacionId },
        estado: In(['pendiente', 'en_agua']),
      },
    });

    if (pedidoActivo) {
      throw new BadRequestException(
        'Ya existe un pedido activo para esta embarcación en el Monitor de Cola.',
      );
    }

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

    // Lógica simplificada: EN_AGUA (salida) y FINALIZADO (entrada)
    if (!pedido.embarcacion?.id) {
      this.logger.warn(`Pedido ${id} no tiene embarcación asociada`);
      return;
    }

    if (estado === 'en_agua') {
      await this.movimientosService.create({
        embarcacionId: pedido.embarcacion.id,
        tipo: 'salida',
        observaciones: `Bajada marcada desde Monitor de Cola #${pedido.id}`,
      });
    } else if (estado === 'finalizado') {
      await this.movimientosService.create({
        embarcacionId: pedido.embarcacion.id,
        tipo: 'entrada',
        observaciones: `Retorno a cuna marcado desde Monitor de Cola #${pedido.id}`,
      });
    }

    // Notificar cambio de estado a roles relevantes
    await this.notificacionesService.createForRole(Role.ADMIN, {
      titulo: 'Actualización de Operación',
      mensaje: `La embarcación ${pedido.embarcacion.nombre} cambió a estado ${estado}.`,
      tipo:
        estado === 'cancelado'
          ? NotificacionTipo.ALERTA
          : NotificacionTipo.INFO,
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    const pedido = await this.findOne(id);
    return this.pedidoRepo.remove(pedido);
  }
}
