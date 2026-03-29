import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './configuracion.entity';

@Injectable()
export class ConfiguracionService implements OnModuleInit {
  private readonly logger = new Logger(ConfiguracionService.name);

  constructor(
    @InjectRepository(Configuracion)
    private readonly configRepo: Repository<Configuracion>,
  ) {}

  async onModuleInit() {
    this.logger.log('Inicializando configuraciones base...');
    const items = [
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

  async findAll() {
    return this.configRepo.find({ order: { clave: 'ASC' } });
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
