import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Cliente } from './clientes.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { In } from 'typeorm';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepository: Repository<Embarcacion>,
  ) {}

  async findAll(
    query: PaginationQuery & { search?: string; onlyActive?: boolean } = {},
  ): Promise<PaginatedResult<Cliente>> {
    const { search, onlyActive = true, ...pagination } = query;

    const baseOptions: FindManyOptions<Cliente> = {
      order: { createdAt: 'DESC' },
    };

    if (search) {
      const searchConditions: FindOptionsWhere<Cliente>[] = [
        {
          nombre: ILike(`%${search}%`),
          ...(onlyActive ? { activo: true } : {}),
        },
        { dni: ILike(`%${search}%`), ...(onlyActive ? { activo: true } : {}) },
        {
          email: ILike(`%${search}%`),
          ...(onlyActive ? { activo: true } : {}),
        },
      ];
      return paginate(this.clientesRepository, pagination, {
        ...baseOptions,
        where: searchConditions,
      });
    }

    const where = onlyActive ? { activo: true } : {};
    return paginate(this.clientesRepository, pagination, {
      ...baseOptions,
      where,
    });
  }

  async findAllWithTarifaBase(
    query: PaginationQuery & { search?: string } = {},
  ): Promise<PaginatedResult<Cliente & { tarifaBase?: number }>> {
    const result = await this.findAll(query);
    const clientIds = result.data.map((c) => c.id);

    if (clientIds.length === 0) return { ...result, data: [] };

    // 1. Obtener todas las embarcaciones de estos clientes en una sola query
    const embarcaciones = await this.embarcacionRepository.find({
      where: { cliente: { id: In(clientIds) } },
      relations: ['espacio', 'espacio.rack'],
    });

    // 2. Crear un mapa para búsqueda rápida
    const tarifaMap = new Map<number, number>();
    embarcaciones.forEach((emb) => {
      const tarifa = emb.espacio?.rack?.tarifaBase
        ? Number(emb.espacio.rack.tarifaBase)
        : 0;
      // Si el cliente tiene varias embarcaciones, sumamos o tomamos la mayor?
      // Por ahora mantenemos la lógica anterior (asociada a la primera encontrada)
      if (!tarifaMap.has(emb.clienteId)) {
        tarifaMap.set(emb.clienteId, tarifa);
      }
    });

    const clientesWithTarifa = result.data.map((cliente) => ({
      ...cliente,
      tarifaBase: tarifaMap.get(cliente.id) || 0,
    }));

    return {
      ...result,
      data: clientesWithTarifa,
    };
  }

  async findOne(id: number): Promise<Cliente & { tarifaBase?: number }> {
    const cliente = await this.clientesRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const embarcacion = await this.embarcacionRepository.findOne({
      where: { cliente: { id } },
      relations: ['espacio', 'espacio.rack'],
    });

    const tarifaBase = embarcacion?.espacio?.rack?.tarifaBase
      ? Number(embarcacion.espacio.rack.tarifaBase)
      : 0;

    return {
      ...cliente,
      tarifaBase,
    };
  }

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const nuevoCliente = this.clientesRepository.create(createClienteDto);
    return this.clientesRepository.save(nuevoCliente);
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
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

    // Totales con aggregates SQL (compatibilidad multi-DB)
    const [cargoAgg, pagoAgg, vencidoAgg] = await Promise.all([
      this.cargoRepository
        .createQueryBuilder('c')
        .select('SUM(c.monto)', 'total')
        .addSelect('COUNT(c.id)', 'cantidad')
        .addSelect(
          'SUM(CASE WHEN c.pagado = false THEN 1 ELSE 0 END)',
          'impagos',
        )
        .where('c.cliente_id = :id', { id })
        .getRawOne<{ total: string; cantidad: string; impagos: string }>(),
      this.pagoRepository
        .createQueryBuilder('p')
        .select('SUM(p.monto)', 'total')
        .addSelect('MAX(p.fecha)', 'ultimaFecha')
        .where('p.cliente_id = :id', { id })
        .getRawOne<{ total: string; ultimaFecha: string }>(),
      this.cargoRepository
        .createQueryBuilder('c')
        .select('SUM(c.monto)', 'total')
        .where('c.cliente_id = :id', { id })
        .andWhere('c.pagado = false')
        .andWhere('c.fechaVencimiento < :now', { now: new Date() })
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
