import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  private async validarDimensionesUbicacion(
    espacioId: number,
    eslora: number,
    manga: number,
  ) {
    if (!espacioId) return;

    const espacio = await this.espacioRepo.findOne({
      where: { id: espacioId },
      relations: ['rack'],
    });

    if (!espacio || !espacio.rack) return;

    const { largo, ancho } = espacio.rack;

    // Solo validar si el rack tiene dimensiones configuradas (> 0)
    if (largo > 0 && eslora > largo) {
      throw new BadRequestException(
        `La eslora de la embarcación (${eslora}m) excede el largo disponible en el rack (${largo}m)`,
      );
    }

    if (ancho > 0 && manga > ancho) {
      throw new BadRequestException(
        `La manga de la embarcación (${manga}m) excede el ancho disponible en el rack (${ancho}m)`,
      );
    }
  }

  async create(
    createEmbarcacionDto: Partial<Embarcacion>,
  ): Promise<Embarcacion> {
    // Validar dimensiones antes de crear si se asignó un espacio
    if (createEmbarcacionDto.espacioId) {
      await this.validarDimensionesUbicacion(
        createEmbarcacionDto.espacioId,
        createEmbarcacionDto.eslora || 0,
        createEmbarcacionDto.manga || 0,
      );
    }

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

    // Identificar el futuro estado de la embarcación para validar
    const nuevaEslora = updateEmbarcacionDto.eslora ?? embarcacion.eslora;
    const nuevaManga = updateEmbarcacionDto.manga ?? embarcacion.manga;
    const nuevoEspacioId =
      'espacioId' in updateEmbarcacionDto
        ? updateEmbarcacionDto.espacioId
        : anteriorEspacioId;

    // Validar dimensiones si hay un espacio asignado (nuevo o mantenido)
    if (nuevoEspacioId) {
      await this.validarDimensionesUbicacion(
        nuevoEspacioId,
        nuevaEslora,
        nuevaManga,
      );
    }

    Object.assign(embarcacion, updateEmbarcacionDto);

    // Si explícitamente se manda espacioId como null, limpiar la relación
    if (
      'espacioId' in updateEmbarcacionDto &&
      updateEmbarcacionDto.espacioId === null
    ) {
      embarcacion.espacio = null;
    }

    const saved = await this.embarcacionesRepository.save(embarcacion);

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
