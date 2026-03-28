import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movimiento } from './movimientos.entity';
import { EmbarcacionesService } from '../embarcaciones/embarcaciones.service';
import { EspaciosService } from '../espacios/espacios.service';

@Injectable()
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    private readonly embarcacionesService: EmbarcacionesService,
    private readonly espaciosService: EspaciosService,
  ) {}

  findAll() {
    return this.movimientoRepo.find({
      relations: ['embarcacion', 'espacio', 'espacio.rack'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id },
      relations: ['embarcacion', 'espacio'],
    });
    if (!movimiento)
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    return movimiento;
  }

  async create(data: Record<string, unknown>) {
    const { embarcacionId, espacioId, tipo, ...rest } = data;

    // Find the current boat to get its assigned space if needed
    const embarcacion = await this.embarcacionesService.findOne(
      Number(embarcacionId),
    );
    const targetEspacioId = espacioId
      ? Number(espacioId)
      : (embarcacion as any).espacio?.id || null;

    const createData: any = {
      ...(rest as object),
      tipo,
      embarcacion: { id: Number(embarcacionId) },
    };

    if (targetEspacioId) {
      createData.espacio = { id: targetEspacioId };
    }

    const savedMovement = await this.movimientoRepo.save(
      this.movimientoRepo.create(createData),
    );

    // --- SYNC STATUS ---
    if (tipo === 'entrada') {
      // Boat comes to rack -> Occupy space
      await this.embarcacionesService.update(embarcacion.id, {
        estado: 'EN_CUNA',
      });
      if (targetEspacioId) {
        await this.espaciosService.update(targetEspacioId, { ocupado: true });
      }
    } else if (tipo === 'salida') {
      // Boat goes to water -> Free space
      await this.embarcacionesService.update(embarcacion.id, {
        estado: 'EN_AGUA',
      });
      if (targetEspacioId) {
        await this.espaciosService.update(targetEspacioId, { ocupado: false });
      }
    }

    return savedMovement;
  }

  async remove(id: number) {
    const movimiento = await this.findOne(id);
    return this.movimientoRepo.remove(movimiento);
  }
}
