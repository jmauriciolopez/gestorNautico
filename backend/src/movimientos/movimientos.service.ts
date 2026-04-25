import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, EntityManager, ILike } from 'typeorm';
import { Movimiento, TipoMovimiento } from './movimientos.entity';
import { Pedido, EstadoPedido } from '../pedidos/pedidos.entity';
import {
  SolicitudBajada,
  EstadoSolicitud,
} from '../operaciones/solicitud-bajada.entity';
import { EmbarcacionesService } from '../embarcaciones/embarcaciones.service';
import { EspaciosService } from '../espacios/espacios.service';
import {
  Embarcacion,
  EstadoEmbarcacion,
} from '../embarcaciones/embarcaciones.entity';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { Role } from '../users/user.entity';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class MovimientosService extends BaseTenantService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(SolicitudBajada)
    private readonly solicitudRepo: Repository<SolicitudBajada>,
    private readonly embarcacionesService: EmbarcacionesService,
    private readonly espaciosService: EspaciosService,
    private readonly configuracionService: ConfiguracionService,
    private readonly notificacionesService: NotificacionesService,
  ) {
    super();
  }

  findAll(
    tenant: TenantContext,
    query: PaginationQuery & { search?: string; embarcacionId?: number } = {},
  ) {
    const { search, embarcacionId, ...pagination } = query;
    const tenantFilter = this.buildTenantWhere(tenant);

    const findOptions: any = {
      relations: ['embarcacion', 'espacio', 'espacio.rack'],
      order: { fecha: 'DESC' },
      where: tenantFilter,
    };

    if (embarcacionId) {
      findOptions.where = {
        ...tenantFilter,
        embarcacion: { id: Number(embarcacionId) },
      };
    } else if (search) {
      findOptions.where = [
        { ...tenantFilter, embarcacion: { nombre: ILike(`%${search}%`) } },
        { ...tenantFilter, embarcacion: { matricula: ILike(`%${search}%`) } },
      ];
    }

    return paginate(this.movimientoRepo, pagination, findOptions);
  }

  async findOne(tenant: TenantContext, id: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['embarcacion', 'espacio'],
    });
    if (!movimiento)
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    return movimiento;
  }

  async create(
    tenant: TenantContext,
    data: CreateMovimientoDto,
    manager?: EntityManager,
  ) {
    const { embarcacionId, espacioId, tipo, ...rest } = data;

    const movRepo = manager
      ? manager.getRepository(Movimiento)
      : this.movimientoRepo;
    const pedRepo = manager ? manager.getRepository(Pedido) : this.pedidoRepo;
    const solRepo = manager
      ? manager.getRepository(SolicitudBajada)
      : this.solicitudRepo;

    // Find the current boat to get its assigned space if needed
    const embarcacion: Embarcacion = await this.embarcacionesService.findOne(
      tenant,
      Number(embarcacionId),
    );
    const targetEspacioId = espacioId
      ? Number(espacioId)
      : embarcacion.espacio?.id || null;

    // --- CHECK AFTER HOURS (Only for ENTRADA/SUBIDA) ---
    let fueraHora = false;
    if (tipo === TipoMovimiento.ENTRADA) {
      const maxHora = await this.configuracionService.getValor(
        tenant,
        'HORARIO_MAX_SUBIDA',
        '18:00',
      );
      const now = new Date();
      const currentHHMM =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0');

      if (currentHHMM > maxHora) {
        fueraHora = true;
      }
    }

    const createData = {
      ...rest,
      tipo,
      fueraHora,
      embarcacion: { id: Number(embarcacionId) },
      espacio: targetEspacioId ? { id: Number(targetEspacioId) } : null,
      guarderiaId: tenant.guarderiaId as number,
    };

    const nuevoMovimiento = movRepo.create(createData);
    const savedMovement = await movRepo.save(nuevoMovimiento);

    // --- SYNC STATUS ---
    if (tipo === TipoMovimiento.ENTRADA) {
      // Boat comes to rack
      await this.embarcacionesService.update(
        tenant,
        embarcacion.id,
        { estado_operativo: EstadoEmbarcacion.EN_CUNA },
        manager,
      );
      // Update or Create Order (subida)
      const pedidoExistente = await pedRepo.findOne({
        where: this.buildTenantWhere(tenant, {
          embarcacion: { id: embarcacion.id },
          estado: In([EstadoPedido.PENDIENTE, EstadoPedido.EN_AGUA]),
        }),
        order: { createdAt: 'DESC' },
      });

      if (pedidoExistente) {
        await pedRepo.update(pedidoExistente.id, {
          estado: EstadoPedido.FINALIZADO,
        });
      } else {
        const solicitudExistente = await solRepo.findOne({
          where: this.buildTenantWhere(tenant, {
            embarcacion: { id: embarcacion.id },
            estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.EN_AGUA]),
          }),
          order: { createdAt: 'DESC' },
        });

        if (solicitudExistente) {
          await solRepo.update(solicitudExistente.id, {
            estado: EstadoSolicitud.FINALIZADA,
          });
        } else {
          const nuevoPedido = pedRepo.create({
            embarcacion: { id: embarcacion.id },
            estado: EstadoPedido.FINALIZADO,
            fechaProgramada: new Date(),
            guarderiaId: tenant.guarderiaId as number,
          });
          await pedRepo.save(nuevoPedido);
        }
      }

      await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
        titulo: 'Retorno a Cuna',
        mensaje: `La embarcación ${embarcacion.nombre} ha regresado a su cuna.`,
        tipo: NotificacionTipo.INFO,
      });
    } else if (tipo === TipoMovimiento.SALIDA) {
      // Boat goes to water
      await this.embarcacionesService.update(
        tenant,
        embarcacion.id,
        { estado_operativo: EstadoEmbarcacion.EN_AGUA },
        manager,
      );

      const pedidoExistente = await pedRepo.findOne({
        where: this.buildTenantWhere(tenant, {
          embarcacion: { id: embarcacion.id },
          estado: In([EstadoPedido.PENDIENTE, EstadoPedido.EN_AGUA]),
        }),
        order: { createdAt: 'DESC' },
      });

      if (pedidoExistente) {
        await pedRepo.update(pedidoExistente.id, {
          estado: EstadoPedido.EN_AGUA,
        });
      } else {
        const solicitudExistente = await solRepo.findOne({
          where: this.buildTenantWhere(tenant, {
            embarcacion: { id: embarcacion.id },
            estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.EN_AGUA]),
          }),
          order: { createdAt: 'DESC' },
        });

        if (solicitudExistente) {
          await solRepo.update(solicitudExistente.id, {
            estado: EstadoSolicitud.EN_AGUA,
          });
        } else {
          const nuevoPedido = pedRepo.create({
            embarcacion: { id: embarcacion.id },
            estado: EstadoPedido.EN_AGUA,
            fechaProgramada: new Date(),
            guarderiaId: tenant.guarderiaId as number,
          });
          await pedRepo.save(nuevoPedido);
        }
      }

      await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
        titulo: 'Salida a Agua',
        mensaje: `La embarcación ${embarcacion.nombre} ha salido al agua.`,
        tipo: NotificacionTipo.INFO,
      });
    }

    return savedMovement;
  }

  async remove(tenant: TenantContext, id: number) {
    const movimiento = await this.findOne(tenant, id);
    return this.movimientoRepo.remove(movimiento);
  }
}
