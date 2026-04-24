import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw, FindOptionsWhere } from 'typeorm';
import { Cargo } from './cargo.entity';
import { CreateCargoDto } from './dto/create-cargo.dto';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class CargosService extends BaseTenantService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepo: Repository<Cargo>,
  ) {
    super();
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery = {},
    clienteId?: number,
    soloSinFacturar: boolean = false,
  ): Promise<PaginatedResult<Cargo>> {
    const where: FindOptionsWhere<Cargo> = this.buildTenantWhere(tenant);
    if (clienteId) {
      where.cliente = { id: clienteId };
    }
    if (soloSinFacturar) {
      where.factura = Raw((alias) => `${alias} IS NULL`);
    }

    return paginate(this.cargoRepo, query, {
      where,
      relations: ['cliente', 'factura'],
      order: { fechaEmision: 'DESC' },
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const cargo = await this.cargoRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['cliente'],
    });
    if (!cargo) throw new NotFoundException(`Cargo con ID ${id} no encontrado`);
    return cargo;
  }

  async create(tenant: TenantContext, data: CreateCargoDto) {
    const { clienteId, ...rest } = data;
    const nuevo = this.cargoRepo.create({
      ...rest,
      cliente: { id: clienteId },
      guarderiaId: tenant.guarderiaId as number,
    });
    const guardado = await this.cargoRepo.save(nuevo);
    return this.findOne(tenant, guardado.id);
  }

  async setPagado(tenant: TenantContext, id: number, status: boolean = true) {
    await this.findOne(tenant, id); // Ensure it belongs to tenant
    await this.cargoRepo.update(id, { pagado: status });
    return this.findOne(tenant, id);
  }

  async remove(tenant: TenantContext, id: number) {
    const cargo = await this.findOne(tenant, id);
    return this.cargoRepo.remove(cargo);
  }
}
