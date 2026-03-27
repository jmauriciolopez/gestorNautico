import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Embarcacion } from './embarcaciones.entity';

@Injectable()
export class EmbarcacionesService {
  constructor(
    @InjectRepository(Embarcacion)
    private readonly embarcacionesRepository: Repository<Embarcacion>,
  ) {}

  async findAll(): Promise<Embarcacion[]> {
    // En el listado debemos incluir las relaciones del Cliente, para mostrar su nombre en el frontend
    return this.embarcacionesRepository.find({
      relations: ['cliente', 'espacio'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Embarcacion> {
    const embarcacion = await this.embarcacionesRepository.findOne({ 
      where: { id },
      relations: ['cliente', 'espacio']
    });
    if (!embarcacion) {
      throw new NotFoundException(`Embarcación con ID ${id} no encontrada`);
    }
    return embarcacion;
  }

  async create(createEmbarcacionDto: Partial<Embarcacion>): Promise<Embarcacion> {
    const nuevaEmbarcacion = this.embarcacionesRepository.create(createEmbarcacionDto);
    return this.embarcacionesRepository.save(nuevaEmbarcacion);
  }

  async update(id: number, updateEmbarcacionDto: Partial<Embarcacion>): Promise<Embarcacion> {
    const embarcacion = await this.findOne(id);
    Object.assign(embarcacion, updateEmbarcacionDto);
    return this.embarcacionesRepository.save(embarcacion);
  }

  async remove(id: number): Promise<void> {
    const embarcacion = await this.findOne(id);
    // Para Embarcaciones, utilizaremos el campo 'estado' como soft delete virtual 
    // pasándolo a 'INACTIVA' para que no rompa el histórico de facturación.
    Object.assign(embarcacion, { estado: 'INACTIVA' });
    await this.embarcacionesRepository.save(embarcacion);
  }
}
