import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './configuracion.entity';
import {
  paginate,
  PaginationQuery,
  PaginatedResult,
} from '../common/pagination/pagination.helper';

@Injectable()
export class ConfiguracionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ConfiguracionService.name);

  constructor(
    @InjectRepository(Configuracion)
    private readonly configRepo: Repository<Configuracion>,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.syncConfigs();
    } catch (error) {
      this.logger.error(`Error al inicializar configuraciones: ${error.message}`);
    }
  }

  async syncConfigs() {
    this.logger.log('Inicializando configuraciones base...');
    const items = [
      {
        clave: 'NOMBRE_GUARDERIA',
        valor: 'Gestor Náutico',
        descripcion: 'Nombre de la guardería náutica',
      },
      {
        clave: 'DIRECCION',
        valor: 'Av. de la Rivera 456, CP 1000',
        descripcion: 'Dirección física de la guardería',
      },
      {
        clave: 'TELEFONO',
        valor: '+54 011 4444-5555',
        descripcion: 'Teléfono de contacto',
      },
      {
        clave: 'EMAIL_GUARDERIA',
        valor: 'info@gestornautico.com',
        descripcion: 'Email de contacto de la guardería',
      },
      {
        clave: 'DIAS_VENCIMIENTO',
        valor: '15',
        descripcion: 'Días desde la emisión hasta el vencimiento de un cargo',
      },
      {
        clave: 'CUOTA_INDIVIDUAL',
        valor: '50',
        descripcion: 'Monto de cuota mensual para socios individuales',
      },
      {
        clave: 'CUOTA_FAMILIAR',
        valor: '120',
        descripcion: 'Monto de cuota mensual para grupos familiares',
      },
      {
        clave: 'HORARIO_APERTURA',
        valor: '08:00',
        descripcion: 'Horario oficial de apertura de la marina',
      },
      {
        clave: 'HORARIO_MAX_SUBIDA',
        valor: '18:00',
        descripcion: 'Horario límite para subida/hoisting de las embarcaciones',
      },
      {
        clave: 'MORA_TASA_INTERES',
        valor: '3',
        descripcion: 'Tasa de interés moratorio mensual (%)',
      },
      {
        clave: 'MORA_TASA_RECARGO',
        valor: '10',
        descripcion: 'Tasa de recargo por retraso (%)',
      },
      {
        clave: 'MORA_DIAS_GRACIA',
        valor: '5',
        descripcion: 'Días de gracia antes de aplicar intereses',
      },
    ];

    for (const item of items) {
      const exists = await this.configRepo.findOne({
        where: { clave: item.clave },
      });
      if (!exists) {
        await this.configRepo.save(this.configRepo.create(item));
        this.logger.log(`Configuración creada: ${item.clave} = ${item.valor}`);
      }
    }
  }

  async findAll(
    query: PaginationQuery = {},
  ): Promise<PaginatedResult<Configuracion>> {
    return paginate(this.configRepo, query, { order: { clave: 'ASC' } });
  }

  async findByClave(clave: string) {
    return this.configRepo.findOne({ where: { clave } });
  }

  async getValor(clave: string, defaultValue = ''): Promise<string> {
    const config = await this.findByClave(clave);
    return config ? config.valor : defaultValue;
  }

  async getValorNumerico(clave: string, defaultValue = 0): Promise<number> {
    const valor = await this.getValor(clave);
    return valor ? Number(valor) : defaultValue;
  }

  async update(clave: string, valor: string) {
    const config = await this.configRepo.findOne({ where: { clave } });
    if (config) {
      config.valor = valor;
      return this.configRepo.save(config);
    }
    return null;
  }

  async updateMultiple(updates: Record<string, string>) {
    for (const [clave, valor] of Object.entries(updates)) {
      await this.update(clave, valor);
    }
    return this.findAll();
  }
}
