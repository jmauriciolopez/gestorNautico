import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Guarderia } from './guarderia.entity';
import { CreateGuarderiaDto } from './dto/create-guarderia.dto';
import { UpdateGuarderiaDto } from './dto/update-guarderia.dto';

@Injectable()
export class GuarderiaService {
  constructor(
    @InjectRepository(Guarderia)
    private readonly guarderiaRepository: Repository<Guarderia>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createGuarderiaDto: CreateGuarderiaDto): Promise<Guarderia> {
    const guarderia = this.guarderiaRepository.create(createGuarderiaDto);
    return this.guarderiaRepository.save(guarderia);
  }

  async findAll(all: boolean = false): Promise<Guarderia[]> {
    const where = all ? {} : { activo: true };
    return this.guarderiaRepository.find({
      where,
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

    await this.dataSource.transaction(async (manager) => {
      // 1. Soft delete de la guardería
      guarderia.activo = false;
      await manager.save(guarderia);

      // 2. Propagar soft delete a los usuarios (Cascada manual)
      // Importamos las entidades dinámicamente o por nombre para evitar circulares si fuera necesario,
      // pero aquí usaremos la clase User directamente si está disponible.
      await manager.update('User', { guarderiaId: id }, { activo: false });

      // Podríamos agregar más entidades aquí (Embarcaciones, etc.) si se desea un "desmantelamiento" total
    });
  }
}
