import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  ILike,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  In,
  FindManyOptions,
  FindOptionsWhere,
  DataSource,
} from 'typeorm';
import { Factura, EstadoFactura } from './factura.entity';
import { Cargo, TipoCargo } from '../cargos/cargo.entity';
import { Pago, MetodoPago } from '../pagos/pago.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { CargosService } from '../cargos/cargos.service';
import { CajasService } from '../cajas/cajas.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { PdfService } from '../common/pdf/pdf.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class FacturasService extends BaseTenantService {
  private readonly logger = new Logger(FacturasService.name);

  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepo: Repository<Factura>,
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Pago)
    private readonly pagoRepo: Repository<Pago>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    private readonly cargosService: CargosService,
    private readonly cajasService: CajasService,
    private readonly notificacionesService: NotificacionesService,
    private readonly pdfService: PdfService,
    private readonly dataSource: DataSource,
  ) {
    super();
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery & {
      search?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ): Promise<PaginatedResult<Factura>> {
    const { search, startDate, endDate, ...pagination } = query;
    const options: FindManyOptions<Factura> = {
      relations: ['cliente', 'cargos'],
      order: { fechaEmision: 'DESC' },
      where: {},
    };

    // Multi-tenant filter
    const tenantFilter = this.buildTenantWhere(tenant);

    // Filtros de Búsqueda (Número o Cliente)
    if (search) {
      options.where = [
        { ...tenantFilter, numero: ILike(`%${search}%`) },
        { ...tenantFilter, cliente: { nombre: ILike(`%${search}%`) } },
      ];
    } else {
      options.where = { ...tenantFilter };
    }

    // Filtros de Fecha (se aplican a ambos casos del OR si hay búsqueda, o al objeto general)
    if (startDate || endDate) {
      const dateFilter: FindOptionsWhere<Factura> = {};
      if (startDate && endDate) {
        dateFilter.fechaEmision = Between(
          new Date(startDate),
          new Date(endDate),
        );
      } else if (startDate) {
        dateFilter.fechaEmision = MoreThanOrEqual(new Date(startDate));
      } else if (endDate) {
        dateFilter.fechaEmision = LessThanOrEqual(new Date(endDate));
      }

      if (Array.isArray(options.where)) {
        options.where = options.where.map((cond) => ({
          ...cond,
          ...dateFilter,
        }));
      } else {
        options.where = { ...options.where, ...dateFilter };
      }
    }

    return paginate(this.facturaRepo, pagination, options);
  }

  async findOne(tenant: TenantContext, id: number) {
    const factura = await this.facturaRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['cliente', 'cargos'],
    });
    if (!factura)
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    return factura;
  }

  async generateNextNumero(tenant: TenantContext): Promise<string> {
    const last = await this.facturaRepo.find({
      where: this.buildTenantWhere(tenant),
      order: { id: 'DESC' },
      take: 1,
    });

    const nextId = last.length > 0 ? Number(last[0].id) + 1 : 1;
    return `FAC-${nextId.toString().padStart(4, '0')}`;
  }

  async create(tenant: TenantContext, data: CreateFacturaDto) {
    const { clienteId, cargoIds, numero, ...rest } = data;

    if (!cargoIds || cargoIds.length === 0) {
      throw new BadRequestException('Se debe seleccionar al menos un cargo');
    }

    // Validar que el cliente pertenezca al tenant
    const cliente = await this.clienteRepo.findOne({
      where: this.buildTenantWhere(tenant, { id: clienteId }),
    });
    if (!cliente) {
      throw new BadRequestException(`El cliente ${clienteId} no pertenece a esta sede`);
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Obtener los cargos y validar (dentro de transacción)
      const cargos = await manager.find(Cargo, {
        where: {
          id: In(cargoIds),
          cliente: { id: clienteId },
          guarderiaId: tenant.guarderiaId as number,
        },
      });

      if (cargos.length !== cargoIds.length) {
        throw new BadRequestException(
          'Algunos cargos seleccionados no son válidos o no pertenecen al cliente',
        );
      }

      // 2. Calcular total
      const total = cargos.reduce(
        (sum, cargo) => sum + Number(cargo.monto || 0),
        0,
      );

      // Cálculo de fecha de vencimiento consolidada
      let finalFechaVencimiento = data.fechaVencimiento
        ? new Date(data.fechaVencimiento)
        : null;

      if (!finalFechaVencimiento) {
        const vencimientos = cargos
          .map((c) => c.fechaVencimiento)
          .filter((v) => !!v)
          .map((v) => new Date(v).getTime());

        if (vencimientos.length > 0) {
          finalFechaVencimiento = new Date(Math.max(...vencimientos));
        } else {
          const fallback = new Date(data.fechaEmision);
          fallback.setDate(fallback.getDate() + 15);
          finalFechaVencimiento = fallback;
        }
      }

      // 3. Generar número inicial y guardar
      let finalNumero = numero;
      let guardada: Factura;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          if (!finalNumero) {
            finalNumero = await this.generateNextNumero(tenant);
          }

          const nueva = manager.create(Factura, {
            ...rest,
            numero: finalNumero,
            total,
            cliente: { id: clienteId },
            estado: EstadoFactura.PENDIENTE,
            fechaVencimiento: finalFechaVencimiento,
            guarderiaId: tenant.guarderiaId as number,
          });

          guardada = await manager.save(nueva);
          break;
        } catch (error: unknown) {
          attempts++;
          const isUniqueViolation =
            typeof error === 'object' &&
            error !== null &&
            ((error as { code?: string }).code === '23505' ||
              (error as { message?: string }).message?.includes('unique') ||
              (error as { message?: string }).message?.includes('Duplicate'));

          if (isUniqueViolation && !numero && attempts < maxAttempts) {
            this.logger.warn(
              `Conflicto de número de factura ${finalNumero}. Reintentando (${attempts}/${maxAttempts})...`,
            );
            finalNumero = null;
            continue;
          }
          throw error;
        }
      }

      // 5. Vincular cargos a la factura
      await manager.update(
        Cargo,
        { id: In(cargoIds), guarderiaId: tenant.guarderiaId as number },
        { factura: { id: guardada.id } },
      );

      // Notificar a administración/operación sobre nueva factura
      await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
        titulo: 'Nueva Factura Generada',
        mensaje: `Se ha emitido la factura ${guardada.numero} para el cliente ID ${clienteId}.`,
        tipo: NotificacionTipo.INFO,
      });

      return await manager.findOne(Factura, {
        where: { id: guardada.id, guarderiaId: tenant.guarderiaId as number },
        relations: ['cliente', 'cargos'],
      });
    });
  }

  async updateEstado(
    tenant: TenantContext,
    id: number,
    estado: EstadoFactura,
    metodoPago?: MetodoPago,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const factura = await manager.findOne(Factura, {
        where: { id, guarderiaId: tenant.guarderiaId as number },
        relations: ['cliente', 'cargos'],
      });

      if (!factura) {
        throw new NotFoundException(`Factura con ID ${id} no encontrada`);
      }

      await manager.update(
        Factura,
        { id, guarderiaId: tenant.guarderiaId as number },
        { estado },
      );

      if (estado === EstadoFactura.PAGADA) {
        // 1. Marcar cargos como pagados
        const cargoIds = (factura.cargos || []).map((c) => c.id);
        if (cargoIds.length > 0) {
          await manager.update(
            Cargo,
            { id: In(cargoIds), guarderiaId: tenant.guarderiaId as number },
            { pagado: true },
          );
        }

        // 2. Registrar pago en caja activa
        const caja = await this.cajasService.findAbierta(tenant);
        if (!caja) {
          throw new BadRequestException(
            'No hay caja abierta. Abra una caja antes de liquidar una factura.',
          );
        }

        const pago = manager.create(Pago, {
          cliente: { id: factura.cliente.id },
          caja: { id: caja.id },
          monto: Number(factura.total),
          fecha: new Date(),
          metodoPago: metodoPago ?? MetodoPago.EFECTIVO,
          comprobante: `Liquidación factura ${factura.numero}`,
          guarderiaId: tenant.guarderiaId as number,
        });
        await manager.save(pago);

        // 3. Notificar
        await this.notificacionesService.createForRole(tenant, Role.OPERADOR, {
          titulo: 'Factura Liquidada',
          mensaje: `La factura ${factura.numero} del cliente ${factura.cliente.nombre} fue marcada como PAGADA.`,
          tipo: NotificacionTipo.EXITO,
        });
      }

      return await manager.findOne(Factura, {
        where: { id, guarderiaId: tenant.guarderiaId as number },
        relations: ['cliente', 'cargos'],
      });
    });
  }

  async remove(tenant: TenantContext, id: number) {
    const factura = await this.findOne(tenant, id);
    // Nota: El onDelete: 'SET NULL' se encargará de los cargos en BD
    return this.facturaRepo.remove(factura);
  }

  async update(
    tenant: TenantContext,
    id: number,
    data: {
      fechaEmision?: string;
      cargoIds?: number[];
      observaciones?: string;
      nuevosCargos?: { descripcion: string; monto: number; tipo: TipoCargo }[];
    },
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const factura = await manager.findOne(Factura, {
        where: { id, guarderiaId: tenant.guarderiaId as number },
        relations: ['cliente', 'cargos'],
      });

      if (!factura) {
        throw new NotFoundException(`Factura con ID ${id} no encontrada`);
      }

      if (data.fechaEmision) {
        factura.fechaEmision = new Date(data.fechaEmision);
      }

      if (data.observaciones !== undefined) {
        factura.observaciones = data.observaciones;
      }

      // 1. Crear nuevos cargos si vienen
      if (data.nuevosCargos && data.nuevosCargos.length > 0) {
        for (const nc of data.nuevosCargos) {
          const nuevo = manager.create(Cargo, {
            ...nc,
            cliente: { id: factura.cliente.id },
            factura: { id: factura.id },
            pagado: false,
            fechaEmision: factura.fechaEmision || new Date(),
            guarderiaId: tenant.guarderiaId as number,
          });
          await manager.save(nuevo);
        }
      }

      // 2. Vincular cargos existentes si vienen
      if (data.cargoIds) {
        const cargosExistentes = await manager.find(Cargo, {
          where: {
            id: In(data.cargoIds),
            cliente: { id: factura.cliente.id },
            guarderiaId: tenant.guarderiaId as number,
          },
        });

        if (cargosExistentes.length !== data.cargoIds.length) {
          throw new BadRequestException(
            'Algunos cargos no son válidos para este cliente',
          );
        }

        await manager.update(
          Cargo,
          { id: In(data.cargoIds), guarderiaId: tenant.guarderiaId as number },
          { factura: { id: factura.id } },
        );
      }

      // 3. Recalcular el total basado en TODOS los cargos vinculados
      const todosLosCargos = await manager.find(Cargo, {
        where: {
          factura: { id: factura.id },
          guarderiaId: tenant.guarderiaId as number,
        },
      });

      factura.total = todosLosCargos.reduce(
        (sum, c) => sum + Number(c.monto || 0),
        0,
      );
      return await manager.save(factura);
    });
  }

  async sendEmail(
    tenant: TenantContext,
    id: number,
    optionalEmail?: string,
  ) {
    const factura = await this.findOne(tenant, id);
    let targetEmail = factura.cliente.email;

    if (optionalEmail) {
      targetEmail = optionalEmail;
      // Guardar en el cliente
      await this.clienteRepo.update(
        { id: factura.cliente.id, guarderiaId: tenant.guarderiaId as number },
        {
          email: optionalEmail,
        },
      );
    }

    if (!targetEmail) {
      throw new BadRequestException('El cliente no tiene email registrado');
    }

    const buffer = await this.pdfService.generateInvoice(tenant, factura);

    await this.notificacionesService.sendEmailNotification(
      targetEmail,
      `Factura ${factura.numero} - ${factura.cliente.nombre}`,
      'factura-v1',
      {
        cliente: factura.cliente.nombre,
        numero: factura.numero,
        total: factura.total,
        fecha: new Date(factura.fechaEmision).toLocaleDateString('es-AR'),
      },
      [
        {
          filename: `factura-${factura.numero}.pdf`,
          content: buffer,
        },
      ],
    );

    // Auditoría vía Notificación
    await this.notificacionesService.createForRole(tenant, Role.ADMIN, {
      titulo: 'Factura Enviada',
      mensaje: `La factura ${factura.numero} fue enviada por email a ${targetEmail}.`,
      tipo: NotificacionTipo.INFO,
    });

    return { success: true };
  }

  async getStats(
    tenant: TenantContext,
    startDate?: string,
    endDate?: string,
  ) {
    const qb = this.facturaRepo
      .createQueryBuilder('f')
      .select('f.estado', 'estado')
      .addSelect('SUM(f.total)', 'total')
      .addSelect('COUNT(f.id)', 'cantidad');

    this.applyTenantFilter(qb, tenant, 'f');

    if (startDate) {
      qb.andWhere('f.fechaEmision >= :startDate', {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      qb.andWhere('f.fechaEmision <= :endDate', { endDate: new Date(endDate) });
    }

    const results = await qb.groupBy('f.estado').getRawMany();

    const stats = {
      TOTAL_PENDIENTE: 0,
      TOTAL_PAGADO: 0,
      TOTAL_ANULADO: 0,
      CONTEO_PENDIENTE: 0,
      CONTEO_PAGADO: 0,
      CONTEO_ANULADO: 0,
    };

    interface RawStatRow {
      estado: EstadoFactura;
      total: string | number;
      cantidad: string | number;
    }

    (results as RawStatRow[]).forEach((row) => {
      if (row.estado === EstadoFactura.PENDIENTE) {
        stats.TOTAL_PENDIENTE = Number(row.total);
        stats.CONTEO_PENDIENTE = Number(row.cantidad);
      } else if (row.estado === EstadoFactura.PAGADA) {
        stats.TOTAL_PAGADO = Number(row.total);
        stats.CONTEO_PAGADO = Number(row.cantidad);
      } else if (row.estado === EstadoFactura.ANULADA) {
        stats.TOTAL_ANULADO = Number(row.total);
        stats.CONTEO_ANULADO = Number(row.cantidad);
      }
    });

    return stats;
  }
}
