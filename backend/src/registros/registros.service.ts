import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroServicio, EstadoServicio } from './registro.entity';

@Injectable()
export class RegistrosService {
  constructor(
    @InjectRepository(RegistroServicio)
    private readonly registroRepo: Repository<RegistroServicio>,
  ) {}

  findAll() {
    return this.registroRepo.find({
      relations: ['embarcacion', 'servicio'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number) {
    const registro = await this.registroRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'servicio']
    });
    if (!registro) throw new NotFoundException(`Registro de servicio con ID ${id} no encontrado`);
    return registro;
  }

  findByEmbarcacion(embarcacionId: number) {
    return this.registroRepo.find({
      where: { embarcacionId },
      relations: ['servicio'],
      order: { createdAt: 'DESC' }
    });
  }

  create(data: Partial<RegistroServicio>) {
    const registro = this.registroRepo.create(data);
    return this.registroRepo.save(registro);
  }

  async update(id: number, data: Partial<RegistroServicio>) {
    await this.findOne(id);
    await this.registroRepo.update(id, data);
    return this.findOne(id);
  }

  async complete(id: number, costoFinal?: number) {
    const registro = await this.findOne(id);
    registro.estado = EstadoServicio.COMPLETADO;
    registro.fechaCompletada = new Date().toISOString().split('T')[0];
    if (costoFinal !== undefined) {
      registro.costoFinal = costoFinal;
    }
    return this.registroRepo.save(registro);
  }

  async remove(id: number) {
    const registro = await this.findOne(id);
    return this.registroRepo.remove(registro);
  }
}
