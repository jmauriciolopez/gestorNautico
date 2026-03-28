import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embarcacion } from './embarcaciones.entity';
import { Espacio } from '../espacios/espacio.entity';

@Injectable()
export class EmbarcacionesService {
  constructor(
    @InjectRepository(Embarcacion)
    private readonly embarcacionesRepository: Repository<Embarcacion>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
  ) {}

  async findAll(): Promise<Embarcacion[]> {
    return this.embarcacionesRepository.find({
      relations: ['cliente', 'espacio', 'espacio.rack', 'espacio.rack.zona'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Embarcacion> {
    const embarcacion = await this.embarcacionesRepository.findOne({
      where: { id },
      relations: ['cliente', 'espacio', 'espacio.rack', 'espacio.rack.zona'],
    });
    if (!embarcacion) {
      throw new NotFoundException(`Embarcación con ID ${id} no encontrada`);
    }
    return embarcacion;
  }

  async create(
    createEmbarcacionDto: Partial<Embarcacion>,
  ): Promise<Embarcacion> {
    const nuevaEmbarcacion =
      this.embarcacionesRepository.create(createEmbarcacionDto);
    const saved = await this.embarcacionesRepository.save(nuevaEmbarcacion);

    // Si se asignó un espacio, marcarlo como ocupado
    if (saved.espacioId) {
      await this.espacioRepo.update(saved.espacioId, { ocupado: true });
    }

    return saved;
  }

  async update(
    id: number,
    updateEmbarcacionDto: Partial<Embarcacion>,
  ): Promise<Embarcacion> {
    const embarcacion = await this.findOne(id);
    const anteriorEspacioId = embarcacion.espacio?.id || null;

    Object.assign(embarcacion, updateEmbarcacionDto);
    const saved = await this.embarcacionesRepository.save(embarcacion);

    // Determines the resulting DB state correctly using DTO overriding
    const nuevoEspacioId =
      'espacioId' in updateEmbarcacionDto
        ? updateEmbarcacionDto.espacioId
        : anteriorEspacioId;

    // Gestinar cambio de espacio
    if (anteriorEspacioId !== nuevoEspacioId) {
      // Liberar el anterior
      if (anteriorEspacioId) {
        await this.espacioRepo.update(anteriorEspacioId, { ocupado: false });
      }
      // Ocupar el nuevo
      if (nuevoEspacioId) {
        await this.espacioRepo.update(nuevoEspacioId, { ocupado: true });
      }
    }

    return saved;
  }

  async remove(id: number): Promise<void> {
    const embarcacion = await this.findOne(id);
    const espacioId = embarcacion.espacioId;

    // Liberar espacio si tenía uno
    if (espacioId) {
      await this.espacioRepo.update(espacioId, { ocupado: false });
    }

    Object.assign(embarcacion, { estado: 'INACTIVA', espacioId: null });
    await this.embarcacionesRepository.save(embarcacion);
  }
}
