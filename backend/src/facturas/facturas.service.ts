import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Factura, EstadoFactura } from './factura.entity';
import { Cargo, TipoCargo } from '../cargos/cargo.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Pago, MetodoPago } from '../pagos/pago.entity';
import { CargosService } from '../cargos/cargos.service';
import { CajasService } from '../cajas/cajas.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { PdfService } from '../common/pdf/pdf.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';
import { paginate, PaginationQuery } from '../common/pagination/pagination.helper';

export interface CreateFacturaDto {
  clienteId: number;
  numero?: string;
  fechaEmision: string;
  cargoIds: number[];
  observaciones?: string;
}

@Injectable()
export class FacturasService {
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

  async findAll(query: PaginationQuery = {}) {
    return paginate(this.facturaRepo, query, {
      relations: ['cliente', 'cargos'],
      order: { fechaEmision: 'DESC' },
    });
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

    // 3. Generar número si no viene
    const finalNumero = numero || (await this.generateNextNumero());

    // 4. Crear factura
    const nueva = this.facturaRepo.create({
      ...rest,
      numero: finalNumero,
      total,
      cliente: { id: clienteId },
      estado: EstadoFactura.PENDIENTE,
    });

    const guardada = await this.facturaRepo.save(nueva);

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

  async updateEstado(id: number, estado: EstadoFactura, metodoPago?: MetodoPago) {
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

  async update(id: number, data: { 
    fechaEmision?: string; 
    cargoIds?: number[]; 
    observaciones?: string;
    nuevosCargos?: { descripcion: string; monto: number; tipo: TipoCargo }[] 
  }) {
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
          fechaEmision: factura.fechaEmision || new Date()
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
        throw new BadRequestException('Algunos cargos no son válidos para este cliente');
      }

      await this.cargoRepo.update(
        { id: In(data.cargoIds) },
        { factura: { id: factura.id } }
      );
    }

    // 3. Recalcular el total basado en TODOS los cargos vinculados
    const todosLosCargos = await this.cargoRepo.find({
      where: { factura: { id: factura.id } }
    });

    factura.total = todosLosCargos.reduce((sum, c) => sum + Number(c.monto || 0), 0);
    return this.facturaRepo.save(factura);
  }

  async sendEmail(id: number, optionalEmail?: string) {
    const factura = await this.findOne(id);
    let targetEmail = factura.cliente.email;

    if (optionalEmail) {
      targetEmail = optionalEmail;
      // Guardar en el cliente
      await this.clienteRepo.update(factura.cliente.id, { email: optionalEmail });
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
    await this.notificacionesService.create({
      usuarioId: 1, // Sistema/Admin
      titulo: 'Factura Enviada',
      mensaje: `La factura ${factura.numero} fue enviada por email a ${targetEmail}.`,
      tipo: NotificacionTipo.INFO,
    });

    return { success: true };
  }
}
