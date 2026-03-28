import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rack } from './rack.entity';
import { Espacio } from '../espacios/espacio.entity';

@Injectable()
export class RacksService {
  constructor(
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
    @InjectRepository(Espacio)
    private readonly espacioRepo: Repository<Espacio>,
  ) {}

  findAll() {
    return this.rackRepo.find({ relations: ['zona', 'espacios'] });
  }

  async findOne(id: number) {
    const rack = await this.rackRepo.findOne({
      where: { id },
      relations: ['zona', 'espacios'],
    });
    if (!rack) throw new NotFoundException(`Rack con ID ${id} no encontrado`);
    return rack;
  }

  async create(data: Partial<Rack>) {
    const rack = this.rackRepo.create(data);
    const savedRack = await this.rackRepo.save(rack);

    // Lógica de Cuadrícula Automática (Grid Generation)
    const pisos = savedRack.pisos || 1;
    const filas = savedRack.filas || 1;
    const columnas = savedRack.columnas || 1;
    const codigo = savedRack.codigo;

    const nuevosEspacios = [];
    for (let p = 1; p <= pisos; p++) {
      for (let f = 1; f <= filas; f++) {
        for (let c = 1; c <= columnas; c++) {
          nuevosEspacios.push(
            this.espacioRepo.create({
              numero: `${codigo}-P${p}F${f}C${c}`,
              piso: p,
              fila: f,
              columna: c,
              rackId: savedRack.id,
              ocupado: false,
            }),
          );
        }
      }
    }

    if (nuevosEspacios.length > 0) {
      await this.espacioRepo.save(nuevosEspacios);
    }

    return this.findOne(savedRack.id);
  }

  async update(id: number, data: Partial<Rack>) {
    const rack = await this.findOne(id);

    // Si se están cambiando dimensiones de cuadrícula
    const gridChanged =
      (data.pisos && data.pisos !== rack.pisos) ||
      (data.filas && data.filas !== rack.filas) ||
      (data.columnas && data.columnas !== rack.columnas);

    if (gridChanged) {
      // Validar ocupación
      const tieneOcupados = rack.espacios.some((e) => e.ocupado === true);
      if (tieneOcupados) {
        throw new BadRequestException(
          'No se puede cambiar la cuadrícula de un rack con embarcaciones asignadas.',
        );
      }

      // Eliminar espacios antiguos
      if (rack.espacios.length > 0) {
        await this.espacioRepo.remove(rack.espacios);
      }
    }

    // Actualizar rack
    await this.rackRepo.update(id, data);
    const updatedRack = await this.findOne(id);

    // Re-generar espacios si cambió la cuadrícula o el código
    if (gridChanged || (data.codigo && data.codigo !== rack.codigo)) {
      // Si el código cambió pero la cuadrícula no, igual eliminamos y recreamos para actualizar nombres
      if (!gridChanged && rack.espacios.length > 0) {
        await this.espacioRepo.remove(rack.espacios);
      }

      const pisos = updatedRack.pisos || 1;
      const filas = updatedRack.filas || 1;
      const columnas = updatedRack.columnas || 1;
      const codigo = updatedRack.codigo;

      const nuevosEspacios = [];
      for (let p = 1; p <= pisos; p++) {
        for (let f = 1; f <= filas; f++) {
          for (let c = 1; c <= columnas; c++) {
            nuevosEspacios.push(
              this.espacioRepo.create({
                numero: `${codigo}-P${p}F${f}C${c}`,
                piso: p,
                fila: f,
                columna: c,
                rackId: updatedRack.id,
                ocupado: false,
              }),
            );
          }
        }
      }
      if (nuevosEspacios.length > 0) {
        await this.espacioRepo.save(nuevosEspacios);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const rack = await this.rackRepo.findOne({
      where: { id },
      relations: ['espacios'],
    });
    if (!rack) throw new NotFoundException(`Rack con ID ${id} no encontrado`);

    const tieneOcupados = rack.espacios?.some((e) => e.ocupado === true);
    if (tieneOcupados) {
      throw new BadRequestException(
        'No se puede eliminar un rack que tiene embarcaciones asignadas. Por favor, desasigne primero las embarcaciones.',
      );
    }

    // Usar delete directo para mayor seguridad con claves foráneas
    await this.espacioRepo.delete({ rackId: id });
    await this.rackRepo.delete(id);

    return { success: true };
  }
}
