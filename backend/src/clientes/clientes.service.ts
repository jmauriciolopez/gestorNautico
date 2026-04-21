import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Cliente } from './clientes.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
  ) {}

  async findAll(
    query: PaginationQuery & { search?: string } = {},
  ): Promise<PaginatedResult<Cliente>> {
    const { search, ...pagination } = query;

    if (search) {
      // For searching multiple fields, we use an array of objects (OR logic)
      return paginate(this.clientesRepository, pagination, {
        where: [
          { nombre: ILike(`%${search}%`) },
          { dni: ILike(`%${search}%`) },
          { email: ILike(`%${search}%`) },
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return paginate(this.clientesRepository, pagination, {
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return cliente;
  }

  async create(createClienteDto: Partial<Cliente>): Promise<Cliente> {
    const nuevoCliente = this.clientesRepository.create(createClienteDto);
    return this.clientesRepository.save(nuevoCliente);
  }

  async update(
    id: number,
    updateClienteDto: Partial<Cliente>,
  ): Promise<Cliente> {
    const cliente = await this.findOne(id);
    Object.assign(cliente, updateClienteDto);
    return this.clientesRepository.save(cliente);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    cliente.activo = false;
    await this.clientesRepository.save(cliente);
  }

  async getCuentaCorriente(id: number, limite = 50) {
    await this.findOne(id); // valida que existe

    // Totales con aggregates SQL
    const [cargoAgg, pagoAgg, vencidoAgg] = await Promise.all([
      this.cargoRepository
        .createQueryBuilder('c')
        .select('SUM(c.monto)', 'total')
        .addSelect('COUNT(c.id)', 'cantidad')
        .addSelect('COUNT(c.id) FILTER (WHERE c.pagado = false)', 'impagos')
        .where('c.clienteId = :id', { id })
        .getRawOne<{ total: string; cantidad: string; impagos: string }>(),
      this.pagoRepository
        .createQueryBuilder('p')
        .select('SUM(p.monto)', 'total')
        .addSelect('MAX(p.fecha)', 'ultimaFecha')
        .where('p.clienteId = :id', { id })
        .getRawOne<{ total: string; ultimaFecha: string }>(),
      this.cargoRepository
        .createQueryBuilder('c')
        .select('SUM(c.monto)', 'total')
        .where('c.clienteId = :id', { id })
        .andWhere('c.pagado = false')
        .andWhere('c.fechaVencimiento < NOW()')
        .getRawOne<{ total: string }>(),
    ]);

    const totalCargado = Number(cargoAgg?.total || 0);
    const totalPagado = Number(pagoAgg?.total || 0);

    // Historiales paginados en paralelo
    const [cargos, pagos] = await Promise.all([
      this.cargoRepository.find({
        where: { cliente: { id } },
        order: { fechaEmision: 'DESC' },
        take: limite,
      }),
      this.pagoRepository.find({
        where: { cliente: { id } },
        order: { fecha: 'DESC' },
        take: limite,
      }),
    ]);

    return {
      totalCargado: +totalCargado.toFixed(2),
      totalPagado: +totalPagado.toFixed(2),
      saldoPendiente: +(totalCargado - totalPagado).toFixed(2),
      totalVencido: +Number(vencidoAgg?.total || 0).toFixed(2),
      cantidadCargos: Number(cargoAgg?.cantidad || 0),
      cantidadCargosImpagos: Number(cargoAgg?.impagos || 0),
      ultimoPago: pagoAgg?.ultimaFecha
        ? { fecha: new Date(pagoAgg.ultimaFecha) }
        : null,
      cargos,
      pagos,
    };
  }
}
