import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import { Rack } from '../racks/rack.entity';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

export interface SearchResult {
  clientes: Pick<Cliente, 'id' | 'nombre' | 'dni' | 'email'>[];
  embarcaciones: Pick<
    Embarcacion,
    'id' | 'nombre' | 'matricula' | 'tipo' | 'estado_operativo'
  >[];
  racks: Pick<Rack, 'id' | 'codigo'>[];
}

@Injectable()
export class SearchService extends BaseTenantService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
  ) {
    super();
  }

  async search(tenant: TenantContext, query: string): Promise<SearchResult> {
    if (!query || query.trim().length < 2) {
      return { clientes: [], embarcaciones: [], racks: [] };
    }

    const term = `%${query.trim()}%`;

    const [clientes, embarcaciones, racks] = await Promise.all([
      this.clienteRepo.find({
        where: [
          this.buildTenantWhere<Cliente>(tenant, { nombre: ILike(term) }),
          this.buildTenantWhere<Cliente>(tenant, { dni: ILike(term) }),
          this.buildTenantWhere<Cliente>(tenant, { email: ILike(term) }),
        ],
        select: ['id', 'nombre', 'dni', 'email'],
        take: 5,
      }),
      this.embarcacionRepo.find({
        where: [
          this.buildTenantWhere<Embarcacion>(tenant, { nombre: ILike(term) }),
          this.buildTenantWhere<Embarcacion>(tenant, {
            matricula: ILike(term),
          }),
        ],
        select: ['id', 'nombre', 'matricula', 'tipo', 'estado_operativo'],
        take: 5,
      }),
      this.rackRepo.find({
        where: [this.buildTenantWhere<Rack>(tenant, { codigo: ILike(term) })],
        select: ['id', 'codigo'],
        take: 5,
      }),
    ]);

    return { clientes, embarcaciones, racks };
  }
}
