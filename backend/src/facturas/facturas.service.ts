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

@Injectable()
export class FacturasService {
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
  ) {}

  async findAll(
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

    // Filtros de Búsqueda (Número o Cliente)
    if (search) {
      options.where = [
        { numero: ILike(`%${search}%`) },
        { cliente: { nombre: ILike(`%${search}%`) } },
      ];
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

  async findOne(id: number) {
    const factura = await this.facturaRepo.findOne({
      where: { id },
      relations: ['cliente', 'cargos'],
    });
    if (!factura)
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    return factura;
  }

  async generateNextNumero(): Promise<string> {
    const last = await this.facturaRepo.find({
      order: { id: 'DESC' },
      take: 1,
    });

    const nextId = last.length > 0 ? Number(last[0].id) + 1 : 1;
    return `FAC-${nextId.toString().padStart(4, '0')}`;
  }

  async create(data: CreateFacturaDto) {
    const { clienteId, cargoIds, numero, ...rest } = data;

    if (!cargoIds || cargoIds.length === 0) {
      throw new BadRequestException('Se debe seleccionar al menos un cargo');
    }

    // 1. Obtener los cargos y validar
    const cargos = await this.cargoRepo.find({
      where: { id: In(cargoIds), cliente: { id: clienteId } },
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

    // Calculo de fecha de vencimiento consolidada
    let finalFechaVencimiento = data.fechaVencimiento
      ? new Date(data.fechaVencimiento)
      : null;

    if (!finalFechaVencimiento) {
      // Tomar el vencimiento más lejano de los cargos
      const vencimientos = cargos
        .map((c) => c.fechaVencimiento)
        .filter((v) => !!v)
        .map((v) => new Date(v).getTime());

      if (vencimientos.length > 0) {
        finalFechaVencimiento = new Date(Math.max(...vencimientos));
      } else {
        // Fallback: 15 días después de emisión
        const fallback = new Date(data.fechaEmision);
        fallback.setDate(fallback.getDate() + 15);
        finalFechaVencimiento = fallback;
      }
    }

    // 3. Generar número inicial
    let finalNumero = numero;
    let guardada: Factura;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        if (!finalNumero) {
          finalNumero = await this.generateNextNumero();
        }

        // 4. Crear factura
        const nueva = this.facturaRepo.create({
          ...rest,
          numero: finalNumero,
          total,
          cliente: { id: clienteId },
          estado: EstadoFactura.PENDIENTE,
          fechaVencimiento: finalFechaVencimiento,
        });

        guardada = await this.facturaRepo.save(nueva);
        break; // Exit loop if save is successful
      } catch (error: unknown) {
        attempts++;
        // Check for unique constraint violation (Error code 23505 in PG or similar)
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
          finalNumero = null; // Force regeneration
          continue;
        }
        throw error;
      }
    }

    // Notificar a administración/operación sobre nueva factura
    await this.notificacionesService.createForRole(Role.ADMIN, {
      titulo: 'Nueva Factura Generada',
      mensaje: `Se ha emitido la factura ${guardada.numero} para ${guardada.cliente.nombre}.`,
      tipo: NotificacionTipo.INFO,
    });

    // 5. Vincular cargos a la factura
    await this.cargoRepo.update(
      { id: In(cargoIds) },
      { factura: { id: guardada.id } },
    );

    return this.findOne(guardada.id);
  }

  async updateEstado(
    id: number,
    estado: EstadoFactura,
    metodoPago?: MetodoPago,
  ) {
    const factura = await this.findOne(id);
    await this.facturaRepo.update(id, { estado });

    if (estado === EstadoFactura.PAGADA) {
      // 1. Marcar cargos como pagados
      const cargoIds = (factura.cargos || []).map((c) => c.id);
      if (cargoIds.length > 0) {
        await this.cargoRepo.update({ id: In(cargoIds) }, { pagado: true });
      }

      // 2. Registrar pago en caja activa
      const caja = await this.cajasService.findAbierta();
      if (!caja) {
        throw new BadRequestException(
          'No hay caja abierta. Abra una caja antes de liquidar una factura.',
        );
      }
      const pago = this.pagoRepo.create({
        cliente: { id: factura.cliente.id },
        caja: { id: caja.id },
        monto: Number(factura.total),
        fecha: new Date(),
        metodoPago: metodoPago ?? MetodoPago.EFECTIVO,
        comprobante: `Liquidación factura ${factura.numero}`,
      });
      await this.pagoRepo.save(pago);

      // 3. Notificar
      await this.notificacionesService.createForRole(Role.OPERADOR, {
        titulo: 'Factura Liquidada',
        mensaje: `La factura ${factura.numero} del cliente ${factura.cliente.nombre} fue marcada como PAGADA.`,
        tipo: NotificacionTipo.EXITO,
      });
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const factura = await this.findOne(id);
    // Nota: El onDelete: 'SET NULL' se encargará de los cargos en BD
    return this.facturaRepo.remove(factura);
  }

  async update(
    id: number,
    data: {
      fechaEmision?: string;
      cargoIds?: number[];
      observaciones?: string;
      nuevosCargos?: { descripcion: string; monto: number; tipo: TipoCargo }[];
    },
  ) {
    const factura = await this.findOne(id);

    if (data.fechaEmision) {
      factura.fechaEmision = new Date(data.fechaEmision);
    }

    if (data.observaciones !== undefined) {
      factura.observaciones = data.observaciones;
    }

    // 1. Crear nuevos cargos si vienen
    if (data.nuevosCargos && data.nuevosCargos.length > 0) {
      for (const nc of data.nuevosCargos) {
        const nuevo = this.cargoRepo.create({
          ...nc,
          cliente: { id: factura.cliente.id },
          factura: { id: factura.id },
          pagado: false,
          fechaEmision: factura.fechaEmision || new Date(),
        });
        await this.cargoRepo.save(nuevo);
      }
    }

    // 2. Vincular cargos existentes si vienen
    if (data.cargoIds) {
      const cargosExistentes = await this.cargoRepo.find({
        where: { id: In(data.cargoIds), cliente: { id: factura.cliente.id } },
      });

      if (cargosExistentes.length !== data.cargoIds.length) {
        throw new BadRequestException(
          'Algunos cargos no son válidos para este cliente',
        );
      }

      await this.cargoRepo.update(
        { id: In(data.cargoIds) },
        { factura: { id: factura.id } },
      );
    }

    // 3. Recalcular el total basado en TODOS los cargos vinculados
    const todosLosCargos = await this.cargoRepo.find({
      where: { factura: { id: factura.id } },
    });

    factura.total = todosLosCargos.reduce(
      (sum, c) => sum + Number(c.monto || 0),
      0,
    );
    return this.facturaRepo.save(factura);
  }

  async sendEmail(id: number, optionalEmail?: string) {
    const factura = await this.findOne(id);
    let targetEmail = factura.cliente.email;

    if (optionalEmail) {
      targetEmail = optionalEmail;
      // Guardar en el cliente
      await this.clienteRepo.update(factura.cliente.id, {
        email: optionalEmail,
      });
    }

    if (!targetEmail) {
      throw new BadRequestException('El cliente no tiene email registrado');
    }

    const buffer = await this.pdfService.generateInvoice(factura);

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
    await this.notificacionesService.createForRole(Role.ADMIN, {
      titulo: 'Factura Enviada',
      mensaje: `La factura ${factura.numero} fue enviada por email a ${targetEmail}.`,
      tipo: NotificacionTipo.INFO,
    });

    return { success: true };
  }

  async getStats(startDate?: string, endDate?: string) {
    const qb = this.facturaRepo
      .createQueryBuilder('f')
      .select('f.estado', 'estado')
      .addSelect('SUM(f.total)', 'total')
      .addSelect('COUNT(f.id)', 'cantidad');

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
