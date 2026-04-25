import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Rack } from './rack.entity';
import { Espacio } from '../espacios/espacio.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class RacksService extends BaseTenantService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
  ) {
    super();
  }

  /** Desvincula embarcaciones de los espacios dados y luego los elimina */
  private async desvincularYEliminarEspacios(espacios: Espacio[]) {
    if (espacios.length === 0) return;
    const ids = espacios.map((e) => e.id);
    await this.embarcacionRepo.update(
      { espacioId: In(ids) },
      { espacioId: null },
    );
    await this.espacioRepo.remove(espacios);
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery = {},
  ): Promise<PaginatedResult<Rack>> {
    return paginate(this.rackRepo, query, {
      where: this.buildTenantWhere(tenant),
      relations: ['zona', 'espacios'],
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const rack = await this.rackRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['zona', 'espacios'],
    });
    if (!rack) throw new NotFoundException(`Rack con ID ${id} no encontrado`);
    return rack;
  }

  async create(tenant: TenantContext, data: Partial<Rack>) {
    if (data.zonaId) {
      await this.validateRelation(
        this.rackRepo.manager.getRepository('Zona'),
        tenant,
        data.zonaId,
        'Zona',
      );
    }

    const rack = this.rackRepo.create({
      ...data,
      guarderiaId: tenant.guarderiaId,
    });
    const savedRack = await this.rackRepo.save(rack);

    // Lógica de Cuadrícula Automática (Grid Generation)
    const pisos = savedRack.pisos || 1;
    const filas = savedRack.filas || 1;
    const columnas = savedRack.columnas || 1;
    const codigo = savedRack.codigo;

    const nuevosEspacios = [];
    for (let p = 1; p <= pisos; p++) {
      for (let f = 1; f <= filas; f++) {
        for (let c = 1; c <= columnas; c++) {
          nuevosEspacios.push(
            this.espacioRepo.create({
              numero: `${codigo}-P${p}F${f}C${c}`,
              piso: p,
              fila: f,
              columna: c,
              rackId: savedRack.id,
              ocupado: false,
              guarderiaId: tenant.guarderiaId,
            }),
          );
        }
      }
    }

    if (nuevosEspacios.length > 0) {
      await this.espacioRepo.save(nuevosEspacios);
    }

    return this.findOne(tenant, savedRack.id);
  }

  async update(tenant: TenantContext, id: number, data: Partial<Rack>) {
    const rack = await this.findOne(tenant, id);

    // Si se están cambiando dimensiones de cuadrícula
    const gridChanged =
      (data.pisos && data.pisos !== rack.pisos) ||
      (data.filas && data.filas !== rack.filas) ||
      (data.columnas && data.columnas !== rack.columnas);

    if (gridChanged) {
      // Validar ocupación
      const tieneOcupados = rack.espacios.some((e) => e.ocupado === true);
      if (tieneOcupados) {
        throw new BadRequestException(
          'No se puede cambiar la cuadrícula de un rack con embarcaciones asignadas.',
        );
      }

      // Eliminar espacios antiguos
      if (rack.espacios.length > 0) {
        await this.desvincularYEliminarEspacios(rack.espacios);
      }
    }

    if (data.zonaId && data.zonaId !== rack.zonaId) {
      await this.validateRelation(
        this.rackRepo.manager.getRepository('Zona'),
        tenant,
        data.zonaId,
        'Zona',
      );
    }

    // Actualizar rack
    await this.rackRepo.update(id, data);
    const updatedRack = await this.findOne(tenant, id);

    // Re-generar espacios si cambió la cuadrícula o el código
    if (gridChanged || (data.codigo && data.codigo !== rack.codigo)) {
      // Si el código cambió pero la cuadrícula no, igual eliminamos y recreamos para actualizar nombres
      if (!gridChanged && rack.espacios.length > 0) {
        await this.desvincularYEliminarEspacios(rack.espacios);
      }

      const pisos = updatedRack.pisos || 1;
      const filas = updatedRack.filas || 1;
      const columnas = updatedRack.columnas || 1;
      const codigo = updatedRack.codigo;

      const nuevosEspacios = [];
      for (let p = 1; p <= pisos; p++) {
        for (let f = 1; f <= filas; f++) {
          for (let c = 1; c <= columnas; c++) {
            nuevosEspacios.push(
              this.espacioRepo.create({
                numero: `${codigo}-P${p}F${f}C${c}`,
                piso: p,
                fila: f,
                columna: c,
                rackId: updatedRack.id,
                ocupado: false,
                guarderiaId: tenant.guarderiaId,
              }),
            );
          }
        }
      }
      if (nuevosEspacios.length > 0) {
        await this.espacioRepo.save(nuevosEspacios);
      }
    }

    return this.findOne(tenant, id);
  }

  async remove(tenant: TenantContext, id: number) {
    const rack = await this.rackRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['espacios'],
    });
    if (!rack) throw new NotFoundException(`Rack con ID ${id} no encontrado`);

    const tieneOcupados = rack.espacios?.some((e) => e.ocupado === true);
    if (tieneOcupados) {
      throw new BadRequestException(
        'No se puede eliminar un rack que tiene embarcaciones asignadas. Por favor, desasigne primero las embarcaciones.',
      );
    }

    // Usar delete directo para mayor seguridad con claves foráneas
    await this.espacioRepo.delete({
      rackId: id,
      guarderiaId: tenant.guarderiaId,
    });
    await this.rackRepo.delete({
      id,
      guarderiaId: tenant.guarderiaId,
    });

    return { success: true };
  }
}
