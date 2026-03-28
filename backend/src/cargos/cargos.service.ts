import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw, FindOptionsWhere } from 'typeorm';
import { Cargo } from './cargo.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
  ) {}

  async findAll(clienteId?: number, soloSinFacturar: boolean = false) {
    const where: FindOptionsWhere<Cargo> = {};
    if (clienteId) {
      where.cliente = { id: clienteId };
    }
    if (soloSinFacturar) {
      where.factura = Raw((alias) => `${alias} IS NULL`);
    }

    return this.cargoRepo.find({
      where,
      relations: ['cliente', 'factura'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findOne(id: number) {
    const cargo = await this.cargoRepo.findOne({
      where: { id },
      relations: ['cliente'],
    });
    if (!cargo) throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    return cargo;
  }

  async create(data: CreateCargoDto) {
    const { clienteId, ...rest } = data;
    const nuevo = this.cargoRepo.create({
      ...rest,
      cliente: { id: clienteId },
    });
    return this.cargoRepo.save(nuevo);
  }

  async setPagado(id: number, status: boolean = true) {
    await this.cargoRepo.update(id, { pagado: status });
    return this.findOne(id);
  }

  async remove(id: number) {
    const cargo = await this.findOne(id);
    return this.cargoRepo.remove(cargo);
  }
}
