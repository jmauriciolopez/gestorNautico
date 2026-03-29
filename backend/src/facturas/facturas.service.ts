import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Factura, EstadoFactura } from './factura.entity';
import { Cargo } from '../cargos/cargo.entity';
import { CargosService } from '../cargos/cargos.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { Role } from '../users/user.entity';
import { NotificacionTipo } from '../notificaciones/notificacion.entity';

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
    private readonly cargosService: CargosService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  async findAll() {
    return this.facturaRepo.find({
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

  async updateEstado(id: number, estado: EstadoFactura) {
    const factura = await this.findOne(id);
    await this.facturaRepo.update(id, { estado });

    // SIDE EFFECTS
    if (estado === EstadoFactura.PAGADA) {
      // Mark all cargos as paid
      const cargoIds = (factura.cargos || []).map((c) => c.id);
      if (cargoIds.length > 0) {
        await this.cargoRepo.update({ id: In(cargoIds) }, { pagado: true });
      }

      // Notify operators
      await this.notificacionesService.createForRole(Role.OPERADOR, {
        titulo: 'Factura Realizada',
        mensaje: `La factura ${factura.numero} del cliente ${factura.cliente.nombre} ha sido marcada como PAGADA.`,
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
}
