import {
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Espacio } from './espacio.entity';
import { Embarcacion } from '../embarcaciones/embarcaciones.entity';
import {
  paginate,
  PaginationQuery,
} from '../common/pagination/pagination.helper';

@Injectable()
export class EspaciosService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EspaciosService.name);

  constructor(
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
    @InjectRepository(Embarcacion)
    private readonly embarcacionRepo: Repository<Embarcacion>,
  ) {}

  async onApplicationBootstrap() {
    try {
      this.logger.log('Iniciando saneamiento automático de infraestructura...');
      await this.syncHealth();
    } catch (error) {
      this.logger.error(
        `Error durante el saneamiento de espacios: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async syncHealth() {
    this.logger.log('Ejecutando diagnóstico de integridad de espacios...');
    let corregidos = 0;

    // 1. Limpiar embarcaciones INACTIVAS que aún tengan espacioId
    const inactivasConEspacio = await this.embarcacionRepo.find({
      where: { estado_operativo: 'INACTIVA', espacioId: Not(IsNull()) },
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
        where: { espacioId: espacio.id, estado_operativo: Not('INACTIVA') },
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

  findAll(query: PaginationQuery = {}) {
    return paginate(this.espacioRepo, query, {
      relations: ['rack', 'rack.zona', 'rack.zona.ubicacion'],
    });
  }

  async findOne(id: number) {
    const espacio = await this.espacioRepo.findOne({
      where: { id },
      relations: ['rack', 'rack.zona', 'rack.zona.ubicacion'],
    });
    if (!espacio)
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    return espacio;
  }

  create(data: Partial<Espacio>) {
    const espacio = this.espacioRepo.create(data);
    return this.espacioRepo.save(espacio);
  }

  async update(id: number, data: Partial<Espacio>) {
    await this.findOne(id);
    await this.espacioRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const espacio = await this.espacioRepo.findOne({
      where: { id },
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

  async getEstadisticas() {
    const total = await this.espacioRepo.count();
    const ocupados = await this.espacioRepo.count({ where: { ocupado: true } });
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
