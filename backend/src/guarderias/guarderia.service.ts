import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guarderia } from './guarderia.entity';
import { CreateGuarderiaDto } from './dto/create-guarderia.dto';
import { UpdateGuarderiaDto } from './dto/update-guarderia.dto';

@Injectable()
export class GuarderiaService {
  constructor(
    @InjectRepository(Guarderia)
    private readonly guarderiaRepository: Repository<Guarderia>,
  ) {}

  async create(createGuarderiaDto: CreateGuarderiaDto): Promise<Guarderia> {
    const guarderia = this.guarderiaRepository.create(createGuarderiaDto);
    return this.guarderiaRepository.save(guarderia);
  }

  async findAll(): Promise<Guarderia[]> {
    return this.guarderiaRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Guarderia> {
    const guarderia = await this.guarderiaRepository.findOne({
      where: { id },
    });
    if (!guarderia) {
      throw new NotFoundException(`Guardería con ID ${id} no encontrada`);
    }
    return guarderia;
  }

  async update(
    id: number,
    updateGuarderiaDto: UpdateGuarderiaDto,
  ): Promise<Guarderia> {
    const guarderia = await this.findOne(id);
    Object.assign(guarderia, updateGuarderiaDto);
    return this.guarderiaRepository.save(guarderia);
  }

  async remove(id: number): Promise<void> {
    const guarderia = await this.findOne(id);
    // Soft delete - marcar como inactivo
    guarderia.activo = false;
    await this.guarderiaRepository.save(guarderia);
  }

}
