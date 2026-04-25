import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';
import { Caja, EstadoCaja } from './caja.entity';
import { MetodoPago } from '../pagos/pago.entity';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';

export interface CajasResumen {
  id: number;
  saldoInicial: number;
  totalRecaudado: number;
  totalEfectivo: number;
  fechaApertura: Date;
}

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class CajasService extends BaseTenantService {
  private readonly logger = new Logger(CajasService.name);

  constructor(
    @InjectRepository(Caja)
    private readonly cajaRepo: Repository<Caja>,
    private readonly notificacionesService: NotificacionesService,
  ) {
    super();
  }

  findAll(tenant: TenantContext, query: PaginationQuery = {}) {
    return paginate(this.cajaRepo, query, {
      where: this.buildTenantWhere(tenant),
      relations: ['pagos', 'pagos.cliente', 'pagos.cargo'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const caja = await this.cajaRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['pagos', 'pagos.cliente', 'pagos.cargo'],
    });
    if (!caja) throw new NotFoundException(`Caja con ID ${id} no encontrada`);
    return caja;
  }

  async findAbierta(tenant: TenantContext) {
    return this.cajaRepo.findOne({
      where: this.buildTenantWhere(tenant, { estado: EstadoCaja.ABIERTA }),
      relations: ['pagos', 'pagos.cliente', 'pagos.cargo'],
    });
  }

  async abrir(tenant: TenantContext, saldoInicial: number) {
    try {
      this.logger.log(
        `Intentando abrir caja para guarderia ${tenant.guarderiaId} con saldo inicial: ${saldoInicial}`,
      );

      return await this.cajaRepo.manager.transaction(
        async (transactionalEntityManager) => {
          const abierta = await transactionalEntityManager.findOne(Caja, {
            where: this.buildTenantWhere(tenant, { estado: EstadoCaja.ABIERTA }),
          });

          if (abierta) {
            throw new ConflictException(
              'Ya existe una caja abierta para esta guardería',
            );
          }

          const nueva = transactionalEntityManager.create(Caja, {
            saldoInicial: Number(saldoInicial || 0),
            estado: EstadoCaja.ABIERTA,
            fechaApertura: new Date(),
            guarderiaId: tenant.guarderiaId as number,
          });

          const guardada = await transactionalEntityManager.save(Caja, nueva);
          this.logger.log(
            `Caja aperturada exitosamente con ID: ${guardada.id} para guarderia ${tenant.guarderiaId}`,
          );

          // Notificar apertura de caja
          await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
            titulo: 'Apertura de Caja',
            mensaje: `Se ha abierto una nueva sesión de caja con un saldo inicial de $${saldoInicial}.`,
            tipo: NotificacionTipo.SISTEMA,
          });

          return guardada;
        },
      );
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        this.logger.warn(`Intento fallido de abrir caja: ${error.message}`);
        throw error;
      }
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error crítico al abrir caja: ${errMsg}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(`No se pudo abrir la caja: ${errMsg}`);
    }
  }

  async cerrar(tenant: TenantContext, id: number, saldoFinal: number) {
    try {
      return await this.cajaRepo.manager.transaction(
        async (transactionalEntityManager) => {
          const caja = await transactionalEntityManager.findOne(Caja, {
            where: this.buildTenantWhere(tenant, { id }),
          });

          if (!caja)
            throw new NotFoundException(`Caja con ID ${id} no encontrada`);
          if (caja.estado === EstadoCaja.CERRADA) {
            throw new ConflictException(
              'La sesión de caja seleccionada ya se encuentra cerrada',
            );
          }

          caja.estado = EstadoCaja.CERRADA;
          caja.saldoFinal = Number(saldoFinal || 0);
          caja.fechaCierre = new Date();

          this.logger.log(
            `Cerrando caja ID ${id} con saldo final ${saldoFinal} para guarderia ${tenant.guarderiaId}`,
          );
          const guardada = await transactionalEntityManager.save(Caja, caja);

          // Notificar cierre de caja
          await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
            titulo: 'Cierre de Caja',
            mensaje: `Se ha cerrado la sesión de caja ID ${id} con un saldo final de $${saldoFinal}.`,
            tipo: NotificacionTipo.EXITO,
          });

          return guardada;
        },
      );
    } catch (error: unknown) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        this.logger.warn(
          `Intento fallido de cerrar caja: ${
            error instanceof Error ? error.message : 'Error'
          }`,
        );
        throw error;
      }
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Error al cerrar caja: ${errMsg}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(`No se pudo cerrar la caja: ${errMsg}`);
    }
  }

  async getResumen(tenant: TenantContext): Promise<CajasResumen | null> {
    const cajaAbierta = await this.findAbierta(tenant);
    if (!cajaAbierta) return null;

    interface CajasRawAgg {
      totalRecaudado: unknown;
      totalEfectivo: unknown;
    }

    const qb = this.cajaRepo.manager
      .createQueryBuilder()
      .select('COALESCE(SUM(p.monto), 0)', 'totalRecaudado')
      .addSelect(
        `COALESCE(SUM(CASE WHEN p.metodoPago = '${MetodoPago.EFECTIVO}' THEN p.monto ELSE 0 END), 0)`,
        'totalEfectivo',
      )
      .from('pagos', 'p')
      .where('p.caja_id = :cajaId', { cajaId: cajaAbierta.id });

    this.applyTenantFilter(qb, tenant, 'p');

    const agg = await qb.getRawOne<CajasRawAgg>();

    return {
      id: cajaAbierta.id,
      saldoInicial: Number(cajaAbierta.saldoInicial || 0),
      totalRecaudado: Number(agg?.totalRecaudado ?? 0),
      totalEfectivo: Number(agg?.totalEfectivo ?? 0),
      fechaApertura: cajaAbierta.fechaApertura,
    };
  }
}
