import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalogo } from './catalogo.entity';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class CatalogoService extends BaseTenantService {
  constructor(
    @InjectRepository(Catalogo)
    private readonly catalogoRepo: Repository<Catalogo>,
  ) {
    super();
  }

  findAll(tenant: TenantContext, query: PaginationQuery = {}) {
    return paginate(this.catalogoRepo, query, {
      where: this.buildTenantWhere<Catalogo>(tenant),
      order: { categoria: 'ASC', nombre: 'ASC' },
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const item = await this.catalogoRepo.findOne({
      where: this.buildTenantWhere<Catalogo>(tenant, { id }),
    });
    if (!item)
      throw new NotFoundException(
        `Servicio con ID ${id} no encontrado en catálogo`,
      );
    return item;
  }

  create(tenant: TenantContext, data: Partial<Catalogo>) {
    const item = this.catalogoRepo.create({
      ...data,
      guarderiaId: tenant.guarderiaId,
    });
    return this.catalogoRepo.save(item);
  }

  async update(tenant: TenantContext, id: number, data: Partial<Catalogo>) {
    await this.findOne(tenant, id);
    await this.catalogoRepo.update(
      { id, guarderiaId: tenant.guarderiaId },
      data,
    );
    return this.findOne(tenant, id);
  }

  async remove(tenant: TenantContext, id: number) {
    const item = await this.findOne(tenant, id);
    return this.catalogoRepo.remove(item);
  }
}
