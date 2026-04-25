import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Espacio } from './espacio.entity';
import {
  Embarcacion,
  EstadoEmbarcacion,
} from '../embarcaciones/embarcaciones.entity';
import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';

@Injectable()
export class EspaciosService
  extends BaseTenantService
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(EspaciosService.name);

  constructor(
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
  ) {
    super();
  }

  async onApplicationBootstrap() {
    try {
      this.logger.log('Iniciando saneamiento automático de infraestructura...');
      // Boot-time sync: global, runs without tenant context (system-level only)
      await this.syncHealthGlobal();
    } catch (error) {
      this.logger.error(
        `Error durante el saneamiento de espacios: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * Saneamiento GLOBAL (solo para arranque del sistema o uso exclusivo de SuperAdmin).
   * No debe ser expuesto como endpoint accesible por Admins.
   */
  async syncHealthGlobal() {
    this.logger.log(
      'Ejecutando diagnóstico GLOBAL de integridad de espacios...',
    );
    let corregidos = 0;

    // 1. Limpiar embarcaciones INACTIVAS que aún tengan espacioId
    const inactivasConEspacio = await this.embarcacionRepo.find({
      where: {
        estado_operativo: EstadoEmbarcacion.INACTIVA,
        espacioId: Not(IsNull()),
      },
    });

    for (const emb of inactivasConEspacio) {
      await this.embarcacionRepo.update(emb.id, { espacioId: null });
      this.logger.warn(
        `Limpiada referencia de espacio en embarcación INACTIVA: ${emb.nombre}`,
      );
      corregidos++;
    }

    // 2. Saneamiento de espacios marcados como ocupados
    const espaciosOcupados = await this.espacioRepo.find({
      where: { ocupado: true },
    });

    for (const espacio of espaciosOcupados) {
      const tieneEmbarcacionActiva = await this.embarcacionRepo.findOne({
        where: {
          espacioId: espacio.id,
          estado_operativo: Not(EstadoEmbarcacion.INACTIVA),
        },
      });

      if (!tieneEmbarcacionActiva) {
        await this.espacioRepo.update(espacio.id, { ocupado: false });
        this.logger.error(
          `Saneado espacio fantasma: ${espacio.numero} (estaba marcado como ocupado pero no tenía embarcación activa)`,
        );
        corregidos++;
      }
    }

    this.logger.log(
      `Saneamiento finalizado. Registros corregidos: ${corregidos}`,
    );
    return { corregidos };
  }

  /**
   * Saneamiento SCOPED al tenant del usuario que lo solicita.
   * Este es el método seguro para exponer como endpoint.
   */
  async syncHealth(tenant: TenantContext) {
    this.logger.log(
      `Ejecutando diagnóstico de integridad para guardería ${tenant.guarderiaId}...`,
    );
    let corregidos = 0;

    const where = this.buildTenantWhere(tenant);

    // 1. Limpiar embarcaciones INACTIVAS con espacioId en este tenant
    const inactivasConEspacio = await this.embarcacionRepo.find({
      where: {
        ...where,
        estado_operativo: EstadoEmbarcacion.INACTIVA,
        espacioId: Not(IsNull()),
      },
    });

    for (const emb of inactivasConEspacio) {
      await this.embarcacionRepo.update(emb.id, { espacioId: null });
      this.logger.warn(
        `[Tenant ${tenant.guarderiaId}] Limpiada referencia de espacio en embarcación INACTIVA: ${emb.nombre}`,
      );
      corregidos++;
    }

    // 2. Saneamiento de espacios ocupados de este tenant
    const espaciosOcupados = await this.espacioRepo.find({
      where: { ...where, ocupado: true },
    });

    for (const espacio of espaciosOcupados) {
      const tieneEmbarcacionActiva = await this.embarcacionRepo.findOne({
        where: {
          ...where,
          espacioId: espacio.id,
          estado_operativo: Not(EstadoEmbarcacion.INACTIVA),
        },
      });

      if (!tieneEmbarcacionActiva) {
        await this.espacioRepo.update(espacio.id, { ocupado: false });
        this.logger.error(
          `[Tenant ${tenant.guarderiaId}] Saneado espacio fantasma: ${espacio.numero}`,
        );
        corregidos++;
      }
    }

    this.logger.log(
      `[Tenant ${tenant.guarderiaId}] Saneamiento finalizado. Registros corregidos: ${corregidos}`,
    );
    return { corregidos };
  }

  findAll(tenant: TenantContext, query: PaginationQuery = {}) {
    return paginate(this.espacioRepo, query, {
      where: this.buildTenantWhere(tenant),
      relations: ['rack', 'rack.zona', 'rack.zona.ubicacion'],
    });
  }

  async findOne(tenant: TenantContext, id: number) {
    const espacio = await this.espacioRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['rack', 'rack.zona', 'rack.zona.ubicacion'],
    });
    if (!espacio)
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    return espacio;
  }

  create(tenant: TenantContext, data: Partial<Espacio>) {
    const espacio = this.espacioRepo.create({
      ...data,
      guarderiaId: tenant.guarderiaId,
    });
    return this.espacioRepo.save(espacio);
  }

  async update(tenant: TenantContext, id: number, data: Partial<Espacio>) {
    await this.findOne(tenant, id);
    await this.espacioRepo.update(id, data);
    return this.findOne(tenant, id);
  }

  async remove(tenant: TenantContext, id: number) {
    const espacio = await this.espacioRepo.findOne({
      where: this.buildTenantWhere(tenant, { id }),
      relations: ['embarcacion'],
    });
    if (!espacio)
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);

    // Desvincular embarcación si tiene una asignada
    if (espacio.embarcacion) {
      await this.embarcacionRepo.update(espacio.embarcacion.id, {
        espacioId: null,
      });
    }

    return this.espacioRepo.remove(espacio);
  }

  async getEstadisticas(tenant: TenantContext) {
    const where = this.buildTenantWhere(tenant);
    const total = await this.espacioRepo.count({ where });
    const ocupados = await this.espacioRepo.count({
      where: { ...where, ocupado: true },
    });
    const libres = total - ocupados;
    const porcentajeOcupacion = total > 0 ? (ocupados / total) * 100 : 0;

    return {
      total,
      ocupados,
      libres,
      porcentajeOcupacion,
    };
  }
}
