import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './clientes.entity';
import { Cargo } from '../cargos/cargo.entity';
import { Pago } from '../pagos/pago.entity';
import { paginate, PaginationQuery, PaginatedResult } from '../common/pagination/pagination.helper';

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

  async findAll(query: PaginationQuery = {}): Promise<PaginatedResult<Cliente>> {
    return paginate(this.clientesRepository, query, {
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

  async getCuentaCorriente(id: number) {
    await this.findOne(id); // valida que existe

    const cargos = await this.cargoRepository.find({
      where: { cliente: { id } },
      order: { fechaEmision: 'DESC' },
    });

    const pagos = await this.pagoRepository.find({
      where: { cliente: { id } },
      order: { fecha: 'DESC' },
    });

    const totalCargado = cargos.reduce((s, c) => s + Number(c.monto), 0);
    const totalPagado  = pagos.reduce((s, p) => s + Number(p.monto), 0);
    const saldoPendiente = totalCargado - totalPagado;

    const cargosVencidos = cargos.filter(
      c => !c.pagado && c.fechaVencimiento && new Date(c.fechaVencimiento) < new Date()
    );
    const totalVencido = cargosVencidos.reduce((s, c) => s + Number(c.monto), 0);

    return {
      totalCargado: +totalCargado.toFixed(2),
      totalPagado:  +totalPagado.toFixed(2),
      saldoPendiente: +saldoPendiente.toFixed(2),
      totalVencido: +totalVencido.toFixed(2),
      cantidadCargos: cargos.length,
      cantidadCargosImpagos: cargos.filter(c => !c.pagado).length,
      ultimoPago: pagos[0] ?? null,
      cargos,
      pagos,
    };
  }
}
