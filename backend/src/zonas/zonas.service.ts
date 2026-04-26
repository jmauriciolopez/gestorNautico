import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zona } from './zona.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class ZonasService extends BaseTenantService {
  constructor(
    @InjectRepository(Zona)
    private readonly zonaRepo: Repository<Zona>,
  ) {
    super();
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery = {},
  ): Promise<PaginatedResult<Zona>> {
    return paginate(this.zonaRepo, query, {
      where: this.buildTenantWhere(tenant),
      relations: ['ubicacion', 'racks', 'racks.espacios'],
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const zona = await this.zonaRepo.findOne({
      where: this.buildTenantWhere<Zona>(tenant, { id }),
      relations: ['ubicacion', 'racks', 'racks.espacios'],
    });
    if (!zona) throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    return zona;
  }

  async create(tenant: TenantContext, data: Partial<Zona>) {
    if (data.ubicacionId === 0) {
      data.ubicacionId = null;
    }

    if (data.ubicacionId) {
      await this.validateRelation(
        this.zonaRepo.manager.getRepository('Ubicacion'),
        tenant,
        data.ubicacionId,
        'Ubicación',
      );
    }

    const zona = this.zonaRepo.create({
      ...data,
      guarderiaId: tenant.guarderiaId,
    });
    return this.zonaRepo.save(zona);
  }

  async update(tenant: TenantContext, id: number, data: Partial<Zona>) {
    await this.findOne(tenant, id);
    if (data.ubicacionId === 0) {
      data.ubicacionId = null;
    }

    if (data.ubicacionId) {
      await this.validateRelation(
        this.zonaRepo.manager.getRepository('Ubicacion'),
        tenant,
        data.ubicacionId,
        'Ubicación',
      );
    }

    await this.zonaRepo.update(id, data);
    return this.findOne(tenant, id);
  }

  async remove(tenant: TenantContext, id: number) {
    const zona = await this.findOne(tenant, id);
    return this.zonaRepo.remove(zona);
  }
}
