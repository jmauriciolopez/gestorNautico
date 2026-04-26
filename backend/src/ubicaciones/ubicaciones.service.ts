import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from './ubicacion.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class UbicacionesService extends BaseTenantService {
  constructor(
    @InjectRepository(Ubicacion)
    private readonly ubicacionRepo: Repository<Ubicacion>,
  ) {
    super();
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery = {},
  ): Promise<PaginatedResult<Ubicacion>> {
    return paginate(this.ubicacionRepo, query, {
      where: this.buildTenantWhere(tenant),
      relations: ['zonas', 'zonas.racks', 'zonas.racks.espacios'],
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const ubicacion = await this.ubicacionRepo.findOne({
      where: this.buildTenantWhere<Ubicacion>(tenant, { id }),
      relations: ['zonas', 'zonas.racks', 'zonas.racks.espacios'],
    });
    if (!ubicacion)
      throw new NotFoundException(`Ubicación con ID ${id} no encontrada`);
    return ubicacion;
  }

  create(tenant: TenantContext, data: Partial<Ubicacion>) {
    const ubicacion = this.ubicacionRepo.create({
      ...data,
      guarderiaId: tenant.guarderiaId,
    });
    return this.ubicacionRepo.save(ubicacion);
  }

  async update(tenant: TenantContext, id: number, data: Partial<Ubicacion>) {
    await this.findOne(tenant, id);
    await this.ubicacionRepo.update(id, data);
    return this.findOne(tenant, id);
  }

  async remove(tenant: TenantContext, id: number) {
    const ubicacion = await this.findOne(tenant, id);
    return this.ubicacionRepo.remove(ubicacion);
  }
}
