import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './configuracion.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

import { BaseTenantService } from '../compartido/bases/base-tenant.service';
import { TenantContext } from '../compartido/interfaces/tenant-context.interface';

@Injectable()
export class ConfiguracionService extends BaseTenantService {
  private readonly logger = new Logger(ConfiguracionService.name);

  constructor(
    @InjectRepository(Configuracion)
    private readonly configRepo: Repository<Configuracion>,
  ) {
    super();
  }

  async syncConfigs(guarderiaId: number) {
    this.logger.log(`Inicializando configuraciones base para Guardería ID: ${guarderiaId}...`);
    const items = [
      {
        clave: 'NOMBRE_GUARDERIA',
        valor: 'Gestor Náutico',
        descripcion: 'Nombre de la guardería náutica',
      },
      // ... (rest of items)
    ];

    // Re-definir items aquí para asegurar que todos tengan el guarderiaId
    const configsToSync = [
      { clave: 'NOMBRE_GUARDERIA', valor: 'Gestor Náutico', descripcion: 'Nombre de la guardería náutica' },
      { clave: 'DIRECCION', valor: 'Av. de la Rivera 456, CP 1000', descripcion: 'Dirección física de la guardería' },
      { clave: 'TELEFONO', valor: '+54 011 4444-5555', descripcion: 'Teléfono de contacto' },
      { clave: 'EMAIL_GUARDERIA', valor: 'info@gestornautico.com', descripcion: 'Email de contacto de la guardería' },
      { clave: 'DIAS_VENCIMIENTO', valor: '15', descripcion: 'Días desde la emisión hasta el vencimiento de un cargo' },
      { clave: 'CUOTA_INDIVIDUAL', valor: '50', descripcion: 'Monto de cuota mensual para socios individuales' },
      { clave: 'CUOTA_FAMILIAR', valor: '120', descripcion: 'Monto de cuota mensual para grupos familiares' },
      { clave: 'HORARIO_APERTURA', valor: '08:00', descripcion: 'Horario oficial de apertura de la marina' },
      { clave: 'HORARIO_MAX_SUBIDA', valor: '18:00', descripcion: 'Horario límite para subida/hoisting de las embarcaciones' },
      { clave: 'MORA_TASA_INTERES', valor: '3', descripcion: 'Tasa de interés moratorio mensual (%)' },
      { clave: 'MORA_TASA_RECARGO', valor: '10', descripcion: 'Tasa de recargo por retraso (%)' },
      { clave: 'MORA_DIAS_GRACIA', valor: '5', descripcion: 'Días de gracia antes de aplicar intereses' },
    ];

    for (const item of configsToSync) {
      const exists = await this.configRepo.findOne({
        where: { clave: item.clave, guarderiaId },
      });
      if (!exists) {
        await this.configRepo.save(
          this.configRepo.create({
            ...item,
            guarderiaId,
          }),
        );
        this.logger.debug(`Configuración creada [Tenant ${guarderiaId}]: ${item.clave}`);
      }
    }
  }

  async findAll(
    tenant: TenantContext,
    query: PaginationQuery = {},
  ): Promise<PaginatedResult<Configuracion>> {
    return paginate(this.configRepo, query, {
      where: this.buildTenantWhere(tenant),
      order: { clave: 'ASC' },
    });
  }

  async findByClave(tenant: TenantContext, clave: string) {
    return this.configRepo.findOne({
      where: this.buildTenantWhere(tenant, { clave }),
    });
  }

  async getValor(
    tenant: TenantContext,
    clave: string,
    defaultValue = '',
  ): Promise<string> {
    const config = await this.findByClave(tenant, clave);
    return config ? config.valor : defaultValue;
  }

  async getValorNumerico(
    tenant: TenantContext,
    clave: string,
    defaultValue = 0,
  ): Promise<number> {
    const valor = await this.getValor(tenant, clave);
    return valor ? Number(valor) : defaultValue;
  }

  async update(tenant: TenantContext, clave: string, valor: string) {
    const config = await this.configRepo.findOne({
      where: this.buildTenantWhere(tenant, { clave }),
    });
    if (config) {
      config.valor = valor;
      return this.configRepo.save(config);
    }
    // Si no existe para este tenant, lo creamos
    const nueva = this.configRepo.create({
      clave,
      valor,
      guarderiaId: tenant.guarderiaId as number,
    });
    return this.configRepo.save(nueva);
  }

  async updateMultiple(tenant: TenantContext, updates: Record<string, string>) {
    for (const [clave, valor] of Object.entries(updates)) {
      await this.update(tenant, clave, valor);
    }
    return this.findAll(tenant);
  }
}
